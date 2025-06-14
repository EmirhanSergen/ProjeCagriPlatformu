from typing import List
from pydantic_settings import BaseSettings
from pydantic import validator, SecretStr
import secrets

class Settings(BaseSettings):
    # Environment
    environment: str = "development"
    debug: bool = False

    # Rate Limiting
    requests_per_minute: int = 600
    max_login_attempts: int = 5

    # Database
    database_url: str

    # Security
    jwt_secret: SecretStr
    jwt_algorithm: str = "HS256"
    jwt_expiration: int = 30
    access_token_expire_minutes: int = 30
    allowed_origins: str = "*"
    allowed_hosts: List[str] = ["localhost", "127.0.0.1"]
    create_tables: bool = False

    # File Upload
    upload_dir: str = "uploads"  # <--- Yeni eklendi
    max_upload_size: int = 10 * 1024 * 1024  # <--- Yeni eklendi

    # App
    base_url: str

    # Redis
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
        env_file = ".env"
        case_sensitive = False
        encoding = "utf-8"

settings = Settings()
