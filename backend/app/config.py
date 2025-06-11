from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    allowed_origins: str = "*"
    create_tables: bool = False

    class Config:
        env_file = '.env'

settings = Settings()
