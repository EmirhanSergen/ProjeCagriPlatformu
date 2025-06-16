from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from .models.user import User, UserRole
from .database import SessionLocal
from .config import settings

# Corrected tokenUrl based on actual login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_db():
    """Provide a database session to path operations."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Return the authenticated user based on the JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret.get_secret_value(),
            algorithms=[settings.jwt_algorithm]
        )
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return user

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensure the current user has admin privileges."""
    if current_user.role is not UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges",
        )
    return current_user

async def get_current_admin_or_reviewer(
    current_user: User = Depends(get_current_user),
) -> User:
    """Allow access to admins and reviewers."""
    if current_user.role not in (UserRole.ADMIN, UserRole.REVIEWER):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges",
        )
    return current_user
