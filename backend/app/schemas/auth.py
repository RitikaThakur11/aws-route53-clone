from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    account_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

TokenResponse.model_rebuild()
