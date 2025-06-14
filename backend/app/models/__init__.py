# This file is intentionally left empty to ensure all models are imported
# and registered with the SQLAlchemy Base.

"""Import all ORM models so Alembic can discover them."""
from ..database import Base
from .user import User  # noqa: F401
from .call import Call  # noqa: F401
from .application import Application  # noqa: F401
from .attachment import Attachment  # noqa: F401
from .document import DocumentDefinition  # noqa: F401
from .application_reviewer import ApplicationReviewer  # noqa: F401
from .review import Review

__all__ = [
    "Base",
    "User",
    "Call",
    "Application",
    "Attachment",
    "DocumentDefinition",
    "ApplicationReviewer",
    "Review",
]
