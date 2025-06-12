from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

from app.dependencies import get_db
from ..dependencies import get_current_user
from ..schemas.user import (
    UserCreate,
    UserOut,
    UserLogin,
    UserUpdate,
    PasswordReset,
    PasswordResetConfirm,
)
from ..crud.user import (
    get_user_by_email,
    create_user,
    update_user,
    verify_user,
    create_password_reset,
    reset_password,
    track_login_attempt,
    is_account_locked,
)
from ..models.user import User
from ..config import settings
from ..utils.email import send_verification_email, send_password_reset_email

router = APIRouter(prefix="/users", tags=["users"])
auth_router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm="HS256")


@router.post("/", response_model=UserOut)
async def register_user(
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Register a new user with the provided role."""
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = create_user(db, user_in)
    background_tasks.add_task(
        send_verification_email,
        email=user.email,
        token=user.verification_token
    )
    return user


@auth_router.post("/login")
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, user_in.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if is_account_locked(user):
        raise HTTPException(
            status_code=423,
            detail="Account is locked. Please try again later."
        )
        
    if not pwd_context.verify(user_in.password, user.hashed_password):
        track_login_attempt(db, user, success=False)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in"
        )
        
    if user.role.value != user_in.role:
        track_login_attempt(db, user, success=False)
        raise HTTPException(status_code=403, detail="Role mismatch")
    
    track_login_attempt(db, user, success=True)
    token = create_access_token({
        "sub": str(user.id),
        "role": user_in.role,
        "email": user.email
    })
    return {"access_token": token}


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_current_user(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_user(db, current_user, update_data)


@router.post("/verify/{token}")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = verify_user(db, token)
    return {"message": "Email verified successfully"}


@router.post("/password-reset", response_model=dict)
async def request_password_reset(
    reset_request: PasswordReset,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = get_user_by_email(db, reset_request.email)
    if user:
        token = create_password_reset(db, user)
        background_tasks.add_task(
            send_password_reset_email,
            email=user.email,
            token=token
        )
    return {"message": "If the email exists, a password reset link will be sent"}


@router.post("/password-reset/confirm")
def confirm_password_reset(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    reset_password(db, reset_data.token, reset_data.new_password)
    return {"message": "Password has been reset successfully"}
