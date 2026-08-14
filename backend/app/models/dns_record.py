import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class DNSRecord(Base):
    __tablename__ = "dns_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hosted_zone_id = Column(
        String(32), 
        ForeignKey("hosted_zones.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(10), nullable=False, index=True)  # A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA, SOA
    ttl = Column(Integer, default=300, nullable=False)
    value = Column(Text, nullable=False)
    
    # Specific fields for complex DNS types
    priority = Column(Integer, nullable=True)  # For MX & SRV
    weight = Column(Integer, nullable=True)    # For SRV / Weighted routing
    port = Column(Integer, nullable=True)      # For SRV
    flags = Column(Integer, nullable=True)     # For CAA (e.g. 0)
    tag = Column(String(32), nullable=True)    # For CAA (e.g. 'issue', 'issuewild', 'iodef')
    
    # Routing Policy metadata
    routing_policy = Column(String(32), default="Simple", nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Back-relationship
    hosted_zone = relationship("HostedZone", back_populates="records")
