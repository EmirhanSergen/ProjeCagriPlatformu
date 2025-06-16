import secrets
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi import HTTPException

from ..models.user import User, UserRole
from ..schemas.user import UserCreate, UserUpdate
from ..config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_in: UserCreate) -> User:
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user_in.password)
    verification_token = secrets.token_urlsafe(32)

    is_verified = settings.environment == "development"

    user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        role=UserRole(user_in.role),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        organization=user_in.organization,
        verification_token=None if is_verified else verification_token,
        is_verified=is_verified
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user(db: Session, user: User, update_data: UserUpdate) -> User:
    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(user, field, value)
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

def verify_user(db: Session, token: str) -> User:
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="Invalid verification token")
    
    user.is_verified = True
    user.verification_token = None
    user.updated_at = datetime.utcnow()
    db.commit()
    return user

def create_password_reset(db: Session, user: User) -> str:
    token = secrets.token_urlsafe(32)
    user.password_reset_token = token
    user.password_reset_expires = datetime.utcnow() + timedelta(hours=1)
    user.updated_at = datetime.utcnow()
    db.commit()
    return token

def reset_password(db: Session, token: str, new_password: str) -> User:
    user = db.query(User).filter(
        User.password_reset_token == token,
        User.password_reset_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired password reset token"
        )
    
    user.hashed_password = pwd_context.hash(new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    user.updated_at = datetime.utcnow()
    db.commit()
    return user

def track_login_attempt(db: Session, user: User, success: bool):
    if success:
        user.login_attempts = 0
        user.last_login = datetime.utcnow()
        user.locked_until = None
    else:
        user.login_attempts += 1
        if user.login_attempts >= settings.max_login_attempts:
            user.locked_until = datetime.utcnow() + timedelta(minutes=15)
    
    user.updated_at = datetime.utcnow()
    db.commit()

def is_account_locked(user: User) -> bool:
    if user.locked_until and user.locked_until > datetime.utcnow():
        return True
    return False
