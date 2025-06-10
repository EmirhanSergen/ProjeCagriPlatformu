from fastapi import Depends, HTTPException, status

from .models.user import User, UserRole


def get_current_user() -> User:
    """Placeholder returning the authenticated user."""
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication not implemented",
    )


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Placeholder dependency to ensure the current user is an admin."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough privileges")
    return current_user
