import { API_BASE_URL } from "./constants";
import { LoginResponse, User } from "@/types/auth";
import {
  HostedZone,
  HostedZoneCreate,
  HostedZoneListResponse,
  HostedZoneUpdate,
} from "@/types/hosted-zone";
import {
  DNSRecord,
  DNSRecordCreate,
  DNSRecordListResponse,
  DNSRecordUpdate,
  ZoneImportResponse,
} from "@/types/dns-record";

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("route53_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        data?.detail ||
        (data?.errors && data.errors[0]?.msg) ||
        `Request failed with status ${response.status}`;
      throw new ApiError(errorMsg, response.status, data);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message ||
        "Unable to connect to the AWS Route 53 API server. Please ensure the backend is running at http://localhost:8000.",
      0
    );
  }
}

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async logout(): Promise<void> {
    try {
      await request("/auth/logout", { method: "POST" });
    } catch {
      // client-side logout cleanup regardless
    }
  },

  async getCurrentUser(): Promise<User> {
    return request<User>("/auth/me");
  },

  // Hosted Zones
  async getHostedZones(params?: {
    search?: string;
    type?: string;
    page?: number;
    page_size?: number;
  }): Promise<HostedZoneListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.type && params.type !== "ALL") query.append("type", params.type);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.page_size) query.append("page_size", params.page_size.toString());

    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<HostedZoneListResponse>(`/hosted-zones${qs}`);
  },

  async getHostedZone(id: string): Promise<HostedZone> {
    return request<HostedZone>(`/hosted-zones/${id}`);
  },

  async createHostedZone(payload: HostedZoneCreate): Promise<HostedZone> {
    return request<HostedZone>("/hosted-zones", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateHostedZone(
    id: string,
    payload: HostedZoneUpdate
  ): Promise<HostedZone> {
    return request<HostedZone>(`/hosted-zones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteHostedZone(id: string): Promise<void> {
    return request<void>(`/hosted-zones/${id}`, {
      method: "DELETE",
    });
  },

  // DNS Records
  async getRecords(
    zoneId: string,
    params?: {
      search?: string;
      type?: string;
      page?: number;
      page_size?: number;
    }
  ): Promise<DNSRecordListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.type && params.type !== "ALL") query.append("type", params.type);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.page_size) query.append("page_size", params.page_size.toString());

    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<DNSRecordListResponse>(`/hosted-zones/${zoneId}/records${qs}`);
  },

  async getRecord(id: string): Promise<DNSRecord> {
    return request<DNSRecord>(`/records/${id}`);
  },

  async createRecord(
    zoneId: string,
    payload: DNSRecordCreate
  ): Promise<DNSRecord> {
    return request<DNSRecord>(`/hosted-zones/${zoneId}/records`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateRecord(
    id: string,
    payload: DNSRecordUpdate
  ): Promise<DNSRecord> {
    return request<DNSRecord>(`/records/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteRecord(id: string): Promise<void> {
    return request<void>(`/records/${id}`, {
      method: "DELETE",
    });
  },

  // Zone Export / Import
  async exportZoneBind(zoneId: string): Promise<string> {
    const url = `${API_BASE_URL}/hosted-zones/${zoneId}/export?format=bind`;
    const response = await fetch(url, {
      headers: { ...getAuthHeader() },
    });
    if (!response.ok) {
      throw new Error("Failed to export BIND zone file.");
    }
    return response.text();
  },

  async exportZoneJson(zoneId: string): Promise<any> {
    return request<any>(`/hosted-zones/${zoneId}/export?format=json`);
  },

  async importZoneBind(
    zoneId: string,
    zoneContent: string
  ): Promise<ZoneImportResponse> {
    return request<ZoneImportResponse>(`/hosted-zones/${zoneId}/import`, {
      method: "POST",
      body: JSON.stringify({ zone_content: zoneContent }),
    });
  },
};
