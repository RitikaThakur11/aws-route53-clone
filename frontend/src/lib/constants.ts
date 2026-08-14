import { DNSRecordType } from "@/types/dns-record";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const RECORD_TYPES: DNSRecordType[] = [
  "A",
  "AAAA",
  "CNAME",
  "TXT",
  "MX",
  "NS",
  "PTR",
  "SRV",
  "CAA",
];

export const TTL_PRESETS = [
  { label: "1m (60s)", value: 60 },
  { label: "5m (300s) - Recommended", value: 300 },
  { label: "15m (900s)", value: 900 },
  { label: "1h (3600s)", value: 3600 },
  { label: "1d (86400s)", value: 86400 },
  { label: "2d (172800s)", value: 172800 },
];

export const ROUTING_POLICIES = [
  { value: "Simple", label: "Simple routing" },
  { value: "Weighted", label: "Weighted routing" },
  { value: "Latency", label: "Latency-based routing" },
  { value: "Failover", label: "Failover routing" },
];
