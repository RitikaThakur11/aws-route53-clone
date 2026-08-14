import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AWS Route53 Clone API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # SQLite Database Configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./route53.db"
    )
    
    # JWT / Session Config (Mock Auth)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "aws-route53-mock-secret-key-production-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Mock Admin Credentials
    MOCK_USER_EMAIL: str = "admin@example.com"
    MOCK_USER_PASSWORD: str = "password123"
    MOCK_USER_NAME: str = "Cloud Administrator"
    MOCK_ACCOUNT_ID: str = "4829-1029-3847"
    
    # CORS Origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    class Config:
        case_sensitive = True

settings = Settings()
