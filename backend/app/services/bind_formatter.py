import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord

def export_zone_to_bind(zone: HostedZone, records: List[DNSRecord]) -> str:
    """
    Exports a hosted zone and its DNS records into standard BIND zone file format.
    """
    origin = zone.name if zone.name.endswith('.') else f"{zone.name}."
    lines = [
        f"; Zone file for {zone.name} ({zone.type} Hosted Zone)",
        f"; Exported from AWS Route 53 Clone at {datetime.now(timezone.utc).isoformat()}",
        f"; Zone ID: {zone.id}",
        f"$ORIGIN {origin}",
        f"$TTL 300",
        ""
    ]

    for rec in records:
        name = rec.name
        # Shorten name relative to origin if possible
        if name == origin:
            display_name = "@"
        elif name.endswith("." + origin):
            display_name = name[:-len("." + origin)]
        else:
            display_name = name

        ttl = str(rec.ttl)
        rtype = rec.type

        if rtype == "MX":
            val = f"{rec.priority or 10} {rec.value}"
        elif rtype == "SRV":
            val = f"{rec.priority or 0} {rec.weight or 0} {rec.port or 0} {rec.value}"
        elif rtype == "CAA":
            clean_val = rec.value.strip('"')
            val = f'{rec.flags or 0} {rec.tag or "issue"} "{clean_val}"'
        elif rtype == "TXT":
            val = rec.value if (rec.value.startswith('"') and rec.value.endswith('"')) else f'"{rec.value}"'
        else:
            val = rec.value

        lines.append(f"{display_name:<30} {ttl:<6} IN   {rtype:<8} {val}")

    return "\n".join(lines) + "\n"


def parse_bind_zone(content: str, zone_name: str) -> List[Dict[str, Any]]:
    """
    Parses a BIND zone file string into structured DNS record definitions for import.
    """
    origin = zone_name.lower().rstrip('.') + '.'
    current_origin = origin
    current_ttl = 300
    parsed_records = []

    lines = content.splitlines()
    for raw_line in lines:
        line = raw_line.split(';')[0].strip()  # Strip comments
        if not line:
            continue

        # Handle directives
        if line.startswith('$ORIGIN'):
            parts = line.split()
            if len(parts) > 1:
                current_origin = parts[1].strip()
                if not current_origin.endswith('.'):
                    current_origin += '.'
            continue

        if line.startswith('$TTL'):
            parts = line.split()
            if len(parts) > 1 and parts[1].isdigit():
                current_ttl = int(parts[1])
            continue

        # Parse record line
        tokens = line.split()
        if len(tokens) < 3:
            continue

        name = tokens[0]
        idx = 1
        ttl = current_ttl

        # Optional TTL token
        if tokens[idx].isdigit():
            ttl = int(tokens[idx])
            idx += 1

        # Optional Class token (IN, CH, etc.)
        if idx < len(tokens) and tokens[idx].upper() in ('IN', 'CS', 'CH', 'HS'):
            idx += 1

        # Record type
        if idx >= len(tokens):
            continue
        rtype = tokens[idx].upper()
        idx += 1

        if rtype not in ('A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'PTR', 'SRV', 'CAA', 'SOA'):
            continue

        # Remainder is value
        remainder = tokens[idx:]
        if not remainder:
            continue

        # Resolve record full name
        if name == '@':
            full_name = current_origin
        elif name.endswith('.'):
            full_name = name.lower()
        else:
            full_name = f"{name.lower()}.{current_origin}"

        priority = None
        weight = None
        port = None
        flags = None
        tag = None

        if rtype == "MX":
            if len(remainder) >= 2 and remainder[0].isdigit():
                priority = int(remainder[0])
                value = remainder[1]
            else:
                value = " ".join(remainder)
        elif rtype == "SRV":
            if len(remainder) >= 4 and remainder[0].isdigit() and remainder[1].isdigit() and remainder[2].isdigit():
                priority = int(remainder[0])
                weight = int(remainder[1])
                port = int(remainder[2])
                value = remainder[3]
            else:
                value = " ".join(remainder)
        elif rtype == "CAA":
            if len(remainder) >= 3 and remainder[0].isdigit():
                flags = int(remainder[0])
                tag = remainder[1]
                value = " ".join(remainder[2:]).strip('"')
            else:
                value = " ".join(remainder)
        elif rtype == "TXT":
            value = " ".join(remainder).strip('"')
        else:
            value = remainder[0]

        parsed_records.append({
            "name": full_name,
            "type": rtype,
            "ttl": ttl,
            "value": value,
            "priority": priority,
            "weight": weight,
            "port": port,
            "flags": flags,
            "tag": tag,
            "routing_policy": "Simple"
        })

    return parsed_records
