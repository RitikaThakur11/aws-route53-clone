import { DNSRecord, DNSRecordType } from "@/types/dns-record";

export interface RecordTypeInfo {
  type: DNSRecordType;
  title: string;
  description: string;
  valuePlaceholder: string;
  example: string;
  rfc: string;
}

export const RECORD_TYPE_METADATA: Record<DNSRecordType, RecordTypeInfo> = {
  A: {
    type: "A",
    title: "A – Routes traffic to an IPv4 address",
    description: "Points a domain or subdomain to one or more IPv4 addresses (e.g., 198.51.100.1).",
    valuePlaceholder: "192.0.2.1",
    example: "192.0.2.42",
    rfc: "RFC 1035",
  },
  AAAA: {
    type: "AAAA",
    title: "AAAA – Routes traffic to an IPv6 address",
    description: "Points a domain or subdomain to one or more 128-bit IPv6 addresses.",
    valuePlaceholder: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
    example: "2001:db8::1",
    rfc: "RFC 3596",
  },
  CNAME: {
    type: "CNAME",
    title: "CNAME – Canonical name / Alias",
    description: "Routes traffic to another domain name or hostname. Cannot coexist with other records of the same name.",
    valuePlaceholder: "target.example.com.",
    example: "app.production.net.",
    rfc: "RFC 1035",
  },
  TXT: {
    type: "TXT",
    title: "TXT – Text / Verification strings",
    description: "Holds arbitrary text data, often used for SPF, DKIM, DMARC, or domain ownership verification.",
    valuePlaceholder: "v=spf1 include:_spf.google.com ~all",
    example: "google-site-verification=abc123xyz",
    rfc: "RFC 1464",
  },
  MX: {
    type: "MX",
    title: "MX – Mail exchange",
    description: "Specifies mail servers responsible for accepting incoming email on behalf of the domain.",
    valuePlaceholder: "mail.example.com.",
    example: "10 aspmx.l.google.com.",
    rfc: "RFC 1035",
  },
  NS: {
    type: "NS",
    title: "NS – Name server",
    description: "Delegates a DNS zone or subdomain to use the given authoritative name servers.",
    valuePlaceholder: "ns-1.awsdns-01.org.",
    example: "ns-123.awsdns-12.com.",
    rfc: "RFC 1035",
  },
  PTR: {
    type: "PTR",
    title: "PTR – Pointer / Reverse DNS",
    description: "Resolves an IP address back to a canonical domain name (Reverse DNS lookup).",
    valuePlaceholder: "host.example.com.",
    example: "web01.example.com.",
    rfc: "RFC 1035",
  },
  SRV: {
    type: "SRV",
    title: "SRV – Service locator",
    description: "Defines the hostname and port number of servers for specified services (e.g. SIP, LDAP).",
    valuePlaceholder: "sipserver.example.com.",
    example: "10 60 5060 sip.example.com.",
    rfc: "RFC 2782",
  },
  CAA: {
    type: "CAA",
    title: "CAA – Certification Authority Authorization",
    description: "Specifies which Certificate Authorities (CAs) are allowed to issue SSL/TLS certificates for the domain.",
    valuePlaceholder: "letsencrypt.org",
    example: '0 issue "amazon.com"',
    rfc: "RFC 6844",
  },
  SOA: {
    type: "SOA",
    title: "SOA – Start of Authority",
    description: "Provides core authoritative information about the DNS zone, including the primary name server and serial number.",
    valuePlaceholder: "ns-1.awsdns.com. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
    example: "ns-1.awsdns.com. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
    rfc: "RFC 1035",
  },
};

export function formatRecordValue(record: DNSRecord): string {
  if (record.type === "MX" && record.priority !== null && record.priority !== undefined) {
    return `${record.priority} ${record.value}`;
  }
  if (record.type === "SRV" && record.port !== null && record.port !== undefined) {
    return `${record.priority ?? 0} ${record.weight ?? 0} ${record.port} ${record.value}`;
  }
  if (record.type === "CAA" && record.tag) {
    return `${record.flags ?? 0} ${record.tag} "${record.value.replace(/"/g, "")}"`;
  }
  return record.value;
}

export function formatBindSnippet(record: DNSRecord): string {
  const val = formatRecordValue(record);
  return `${record.name}   ${record.ttl}   IN   ${record.type}   ${val}`;
}

export function getFullDomainPreview(subdomain: string, zoneName: string): string {
  const cleanSub = subdomain.trim();
  const cleanZone = zoneName.trim().replace(/\.$/, "");
  if (!cleanSub || cleanSub === "@") {
    return `${cleanZone}.`;
  }
  if (cleanSub.endsWith(".")) {
    return cleanSub;
  }
  if (cleanSub.endsWith(cleanZone)) {
    return `${cleanSub}.`;
  }
  return `${cleanSub}.${cleanZone}.`;
}
