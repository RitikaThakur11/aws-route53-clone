import secrets
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

def generate_hosted_zone_id() -> str:
    """Generate AWS Route 53 style Hosted Zone ID like Z0123456789ABCDEF."""
    return "Z" + secrets.token_hex(7).upper()

class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id = Column(String(32), primary_key=True, default=generate_hosted_zone_id)
    name = Column(String(255), index=True, nullable=False)
    type = Column(String(20), default="Public", nullable=False)  # "Public" or "Private"
    description = Column(String(500), nullable=True, default="")
    caller_reference = Column(String(64), nullable=True)
    is_private = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # 1-to-many relationship with DNS records; deleting a zone cascades to its records
    records = relationship(
        "DNSRecord", 
        back_populates="hosted_zone", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )
