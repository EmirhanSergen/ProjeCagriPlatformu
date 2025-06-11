
"""Import all ORM models so Alembic can discover them."""

from .user import User  # noqa: F401
from .call import Call  # noqa: F401
from .application import Application  # noqa: F401
from .attachment import Attachment  # noqa: F401
from .document import DocumentDefinition  # noqa: F401

__all__ = [
    "User",
    "Call",
    "Application",
    "Attachment",
    "DocumentDefinition",
]
