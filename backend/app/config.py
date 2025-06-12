from typing import List
from pydantic_settings import BaseSettings
from pydantic import validator, SecretStr
import secrets

class Settings(BaseSettings):
    # Environment
    environment: str = "development"
    debug: bool = False
    
    # Database
    database_url: str
    
    # Security
    jwt_secret: SecretStr
    jwt_algorithm: str = "HS256"
    jwt_expiration: int = 30  # minutes
    access_token_expire_minutes: int = 30  # alias for jwt_expiration
    allowed_origins: str = "*"
    allowed_hosts: List[str] = ["localhost", "127.0.0.1"]
    create_tables: bool = False
    
    # File Upload
    upload_dir: str = "uploads"
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    
    # Redis (for rate limiting)
    redis_url: str | None = None
    
    # Monitoring
    sentry_dsn: str | None = None
    enable_metrics: bool = False
    
    # Email
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_user: str | None = None
    smtp_password: SecretStr | None = None
    from_email: str | None = None

    @validator("jwt_secret", pre=True, always=True)
    def validate_jwt_secret(cls, v):
        if not v:
            return SecretStr(secrets.token_urlsafe(32))
        return SecretStr(str(v))

    class Config:
        env_file = '.env'
        case_sensitive = True

settings = Settings()
