from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings

# Create a SQLAlchemy engine using the database URL from settings
engine = create_engine(settings.database_url)

# Create a session local class for database sessions
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Base class for all ORM models (used for table mapping)
class Base(DeclarativeBase):
    pass
