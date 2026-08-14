import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False, default="Admin User")
    account_id = Column(String(32), nullable=False, default="4829-1029-3847")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
