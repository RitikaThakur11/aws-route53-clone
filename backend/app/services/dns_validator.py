import ipaddress
import re
from typing import Tuple, Optional

DOMAIN_REGEX = re.compile(
    r"^(?:[a-zA-Z0-9_](?:[a-zA-Z0-9_-]{0,61}[a-zA-Z0-9_])?\.)+[a-zA-Z]{2,63}\.?$"
)
SUBDOMAIN_REGEX = re.compile(
    r"^(?:@|\*|[a-zA-Z0-9_](?:[a-zA-Z0-9_-]{0,61}[a-zA-Z0-9_])?(?:\.[a-zA-Z0-9_](?:[a-zA-Z0-9_-]{0,61}[a-zA-Z0-9_])?)*\.?)$"
)

SUPPORTED_RECORD_TYPES = {"A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA", "SOA"}

class DNSValidationError(Exception):
    def __init__(self, message: str, field: Optional[str] = None):
        self.message = message
        self.field = field
        super().__init__(message)


def normalize_domain_name(name: str, zone_name: str) -> str:
    """
    Normalizes record name ensuring it has appropriate FQDN format.
    E.g. if name is 'api' and zone is 'example.com', result is 'api.example.com.'
    If name is '@' or empty, result is 'example.com.'
    """
    clean_zone = zone_name.strip().lower()
    if not clean_zone.endswith('.'):
        clean_zone += '.'
    
    clean_name = name.strip().lower()
    if clean_name == '@' or clean_name == '' or clean_name == '.':
        return clean_zone
    
    # If ends with dot and is already full domain
    if clean_name.endswith('.'):
        return clean_name
    
    # If ends with zone_name without trailing dot
    zone_no_dot = clean_zone[:-1]
    if clean_name == zone_no_dot:
        return clean_zone
    if clean_name.endswith('.' + zone_no_dot):
        return clean_name + '.'
    
    # Otherwise append zone name
    return f"{clean_name}.{clean_zone}"


def validate_domain_name(domain: str) -> bool:
    """Validate a standard apex domain name like 'example.com' or 'sub.example.co.uk'."""
    clean = domain.strip().rstrip('.')
    if len(clean) > 253 or len(clean) < 3:
        return False
    # Check parts
    parts = clean.split('.')
    if len(parts) < 2:
        return False
    for part in parts:
        if not part or len(part) > 63:
            return False
        if not re.match(r"^[a-zA-Z0-9_]([a-zA-Z0-9_-]*[a-zA-Z0-9_])?$", part):
            return False
    return True


def validate_dns_record(
    record_type: str,
    name: str,
    value: str,
    ttl: int,
    zone_name: str,
    priority: Optional[int] = None,
    weight: Optional[int] = None,
    port: Optional[int] = None,
    flags: Optional[int] = None,
    tag: Optional[str] = None,
) -> Tuple[bool, Optional[str]]:
    """
    Validates DNS record fields according to DNS RFCs and Route53 specifications.
    Returns (True, None) if valid, or (False, "Error message") if invalid.
    """
    record_type = record_type.upper()
    if record_type not in SUPPORTED_RECORD_TYPES:
        return False, f"Unsupported DNS record type '{record_type}'. Supported types: {', '.join(sorted(SUPPORTED_RECORD_TYPES))}"

    # Validate TTL
    if ttl is None or ttl < 1 or ttl > 2147483647:
        return False, "TTL must be a positive integer between 1 and 2147483647 seconds."

    # Validate Name
    clean_name = name.strip()
    if not clean_name:
        return False, "Record name cannot be empty. Use '@' for the root domain."
    if not (clean_name == '@' or SUBDOMAIN_REGEX.match(clean_name)):
        return False, f"Invalid record name '{clean_name}'. Must contain only alphanumeric characters, dashes, dots, or '@'."

    # Validate Value per Type
    val = value.strip()
    if not val:
        return False, "Record value cannot be empty."

    if record_type == "A":
        # Must be valid IPv4 address
        try:
            ip = ipaddress.IPv4Address(val)
            # Cannot be multicast or reserved
            if ip.is_multicast:
                return False, f"'{val}' is a multicast IPv4 address and cannot be used for A records."
        except ValueError:
            return False, f"Invalid IPv4 address '{val}' for A record. Enter a valid IPv4 address such as '192.0.2.1'."

    elif record_type == "AAAA":
        # Must be valid IPv6 address
        try:
            ip = ipaddress.IPv6Address(val)
            if ip.is_multicast:
                return False, f"'{val}' is a multicast IPv6 address."
        except ValueError:
            return False, f"Invalid IPv6 address '{val}' for AAAA record. Enter a valid IPv6 address such as '2001:db8::1'."

    elif record_type == "CNAME":
        # Must be a valid hostname/FQDN, cannot be an IP address
        try:
            ipaddress.ip_address(val)
            return False, f"CNAME value cannot be an IP address ('{val}'). Must be a valid domain name target."
        except ValueError:
            pass  # Expected: not an IP
        clean_target = val.rstrip('.')
        if not validate_domain_name(clean_target):
            return False, f"Invalid target domain name '{val}' for CNAME record."

    elif record_type == "MX":
        # MX requires priority (0-65535) and mail server host
        if priority is None:
            # Check if priority is included at the beginning of value, e.g. "10 mail.example.com"
            parts = val.split(None, 1)
            if len(parts) == 2 and parts[0].isdigit():
                p_num = int(parts[0])
                if p_num < 0 or p_num > 65535:
                    return False, "MX priority must be an integer between 0 and 65535."
                server_host = parts[1].rstrip('.')
                if not validate_domain_name(server_host):
                    return False, f"Invalid mail server hostname '{parts[1]}' for MX record."
            else:
                return False, "MX records require a priority (0-65535) and a mail server domain."
        else:
            if priority < 0 or priority > 65535:
                return False, "MX priority must be an integer between 0 and 65535."
            clean_host = val.rstrip('.')
            if not validate_domain_name(clean_host):
                return False, f"Invalid mail server hostname '{val}' for MX record."

    elif record_type == "TXT":
        # TXT records can contain any text up to 255 chars per string or multiple chunks
        if len(val) > 4096:
            return False, "TXT record value exceeds maximum length of 4096 characters."

    elif record_type == "NS":
        # NS must be a valid nameserver hostname
        clean_ns = val.rstrip('.')
        if not validate_domain_name(clean_ns):
            return False, f"Invalid nameserver hostname '{val}' for NS record."

    elif record_type == "PTR":
        # PTR must be a valid pointer target domain
        clean_ptr = val.rstrip('.')
        if not validate_domain_name(clean_ptr):
            return False, f"Invalid pointer target hostname '{val}' for PTR record."

    elif record_type == "SRV":
        # SRV format: priority weight port target
        if priority is not None and weight is not None and port is not None:
            if priority < 0 or priority > 65535:
                return False, "SRV priority must be between 0 and 65535."
            if weight < 0 or weight > 65535:
                return False, "SRV weight must be between 0 and 65535."
            if port < 1 or port > 65535:
                return False, "SRV port must be between 1 and 65535."
            clean_target = val.rstrip('.')
            if not validate_domain_name(clean_target):
                return False, f"Invalid target host '{val}' for SRV record."
        else:
            parts = val.split()
            if len(parts) != 4:
                return False, "SRV record value must be formatted as: '<priority> <weight> <port> <target-host>'."
            try:
                p, w, pt = int(parts[0]), int(parts[1]), int(parts[2])
                if p < 0 or p > 65535 or w < 0 or w > 65535 or pt < 1 or pt > 65535:
                    return False, "SRV values out of range: priority (0-65535), weight (0-65535), port (1-65535)."
                if not validate_domain_name(parts[3].rstrip('.')):
                    return False, f"Invalid target host '{parts[3]}' in SRV record."
            except ValueError:
                return False, "SRV priority, weight, and port must be numbers."

    elif record_type == "CAA":
        # CAA format: flags tag value
        valid_tags = {"issue", "issuewild", "iodef"}
        if tag is not None and flags is not None:
            if flags < 0 or flags > 255:
                return False, "CAA flags must be between 0 and 255."
            if tag.lower() not in valid_tags:
                return False, f"CAA tag must be one of: {', '.join(valid_tags)}."
        else:
            parts = val.split(None, 2)
            if len(parts) < 3:
                return False, "CAA record value must be formatted as: '<flags> <tag> \"<value>\"'."
            try:
                fl = int(parts[0])
                if fl < 0 or fl > 255:
                    return False, "CAA flags must be between 0 and 255."
                if parts[1].lower() not in valid_tags:
                    return False, f"CAA tag '{parts[1]}' must be one of: {', '.join(valid_tags)}."
            except ValueError:
                return False, "CAA flag must be an integer (e.g. 0)."

    return True, None
