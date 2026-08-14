from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.hosted_zone import HostedZoneResponse

class DNSRecordCreate(BaseModel):
    name: str = Field(..., description="Record name/subdomain, e.g. 'api', 'www', '@' or full domain")
    type: str = Field(..., description="DNS record type: A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA, SOA")
    ttl: int = Field(default=300, ge=1, le=2147483647, description="Time to live in seconds")
    value: str = Field(..., description="Record value, e.g. '192.0.2.1'")
    
    # Optional parameters for specific record types
    priority: Optional[int] = Field(None, ge=0, le=65535, description="Priority for MX / SRV records")
    weight: Optional[int] = Field(None, ge=0, le=65535, description="Weight for SRV records")
    port: Optional[int] = Field(None, ge=1, le=65535, description="Port for SRV records")
    flags: Optional[int] = Field(None, ge=0, le=255, description="Flags for CAA records")
    tag: Optional[str] = Field(None, description="Tag for CAA records ('issue', 'issuewild', 'iodef')")
    
    routing_policy: Optional[str] = Field(default="Simple", description="Routing policy: Simple, Weighted, Latency, Failover")

class DNSRecordUpdate(BaseModel):
    ttl: Optional[int] = Field(None, ge=1, le=2147483647)
    value: Optional[str] = None
    priority: Optional[int] = Field(None, ge=0, le=65535)
    weight: Optional[int] = Field(None, ge=0, le=65535)
    port: Optional[int] = Field(None, ge=1, le=65535)
    flags: Optional[int] = Field(None, ge=0, le=255)
    tag: Optional[str] = None
    routing_policy: Optional[str] = None

class DNSRecordResponse(BaseModel):
    id: str
    hosted_zone_id: str
    name: str
    type: str
    ttl: int
    value: str
    priority: Optional[int] = None
    weight: Optional[int] = None
    port: Optional[int] = None
    flags: Optional[int] = None
    tag: Optional[str] = None
    routing_policy: str = "Simple"
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DNSRecordListResponse(BaseModel):
    items: List[DNSRecordResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    hosted_zone: Optional[HostedZoneResponse] = None

class ZoneImportRequest(BaseModel):
    zone_content: str = Field(..., description="Raw BIND zone text or JSON records export")

class ZoneImportResponse(BaseModel):
    imported_count: int
    records: List[DNSRecordResponse]
    message: str
