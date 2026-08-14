export interface HostedZone {
  id: string;
  name: string;
  type: "Public" | "Private";
  description?: string;
  is_private: boolean;
  record_count: number;
  created_at: string;
  updated_at: string;
}

export interface HostedZoneCreate {
  name: string;
  type: "Public" | "Private";
  description?: string;
  is_private?: boolean;
}

export interface HostedZoneUpdate {
  description?: string;
}

export interface HostedZoneListResponse {
  items: HostedZone[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
