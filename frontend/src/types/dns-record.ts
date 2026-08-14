import { HostedZone } from "./hosted-zone";

export type DNSRecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "TXT"
  | "MX"
  | "NS"
  | "PTR"
  | "SRV"
  | "CAA"
  | "SOA";

export interface DNSRecord {
  id: string;
  hosted_zone_id: string;
  name: string;
  type: DNSRecordType;
  ttl: number;
  value: string;
  priority?: number | null;
  weight?: number | null;
  port?: number | null;
  flags?: number | null;
  tag?: string | null;
  routing_policy: string;
  created_at: string;
  updated_at: string;
}

export interface DNSRecordCreate {
  name: string;
  type: DNSRecordType;
  ttl: number;
  value: string;
  priority?: number;
  weight?: number;
  port?: number;
  flags?: number;
  tag?: string;
  routing_policy?: string;
}

export interface DNSRecordUpdate {
  ttl?: number;
  value?: string;
  priority?: number;
  weight?: number;
  port?: number;
  flags?: number;
  tag?: string;
  routing_policy?: string;
}

export interface DNSRecordListResponse {
  items: DNSRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  hosted_zone?: HostedZone;
}

export interface ZoneImportResponse {
  imported_count: number;
  records: DNSRecord[];
  message: string;
}
