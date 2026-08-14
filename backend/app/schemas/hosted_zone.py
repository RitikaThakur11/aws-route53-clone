from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class HostedZoneCreate(BaseModel):
    name: str = Field(..., description="Apex domain name for the hosted zone, e.g. 'example.com'")
    type: str = Field(default="Public", description="'Public' or 'Private'")
    description: Optional[str] = Field(default="", description="Optional human-readable description/comment")
    is_private: Optional[bool] = Field(default=False, description="Whether this is a private VPC hosted zone")

class HostedZoneUpdate(BaseModel):
    description: Optional[str] = Field(None, description="Updated description for the hosted zone")

class HostedZoneResponse(BaseModel):
    id: str
    name: str
    type: str
    description: Optional[str] = ""
    is_private: bool = False
    record_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class HostedZoneListResponse(BaseModel):
    items: List[HostedZoneResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
