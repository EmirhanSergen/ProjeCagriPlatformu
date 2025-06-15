from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt

from app.dependencies import get_db
from ..dependencies import get_current_user, get_current_admin
from ..models.user import User as UserModel, UserRole
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
from ..config import settings
from ..utils.email import send_verification_email, send_password_reset_email

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/users", tags=["users"])
auth_router = APIRouter(tags=["auth"])


def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expiration)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret.get_secret_value(), algorithm=settings.jwt_algorithm)


@auth_router.post("/login")
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, user_in.email)

    # track_login_attempt sadece kullanıcı varsa yapılmalı
    if not user or not pwd_context.verify(user_in.password, user.hashed_password):
        if user:
            track_login_attempt(db, user, success=False)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if is_account_locked(user):
        raise HTTPException(status_code=status.HTTP_423_LOCKED, detail="Account locked")

    if user.role.value != user_in.role:
        track_login_attempt(db, user, success=False)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Role mismatch")

    track_login_attempt(db, user, success=True)

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role.value,
        "email": user.email,
        "firstName": user.first_name or "",
        "userId": user.id,
    })
    return {"access_token": token}


@auth_router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = create_user(db, user_in)
    background_tasks.add_task(send_verification_email, email=user.email, token=user.verification_token)
    return user


@auth_router.post("/verify/{token}", status_code=status.HTTP_200_OK)
def verify_email(token: str, db: Session = Depends(get_db)):
    verify_user(db, token)
    return JSONResponse({"detail": "Email verified successfully"})


@auth_router.post("/password-reset", response_model=dict)
async def request_password_reset(
    reset_request: PasswordReset,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, reset_request.email)
    if user:
        token = create_password_reset(db, user)
        background_tasks.add_task(send_password_reset_email, email=user.email, token=token)
    return {"detail": "If the email exists, a reset link will be sent"}


@auth_router.post("/password-reset/confirm", status_code=status.HTTP_200_OK)
def confirm_password_reset(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_db),
):
    reset_password(db, reset_data.token, reset_data.new_password)
    return {"detail": "Password has been reset successfully"}


# User management endpoints
@router.get("/me", response_model=UserOut)
def read_current_user(current_user = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_current_user(
    update_data: UserUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_user(db, current_user, update_data)


# Admin-only endpoints
@router.get("/", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin),
):
    return db.query(UserModel).all()


@router.get("/admin/reviewers", response_model=list[UserOut])
def list_reviewers(
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    return db.query(UserModel).filter(UserModel.role == UserRole.REVIEWER).all()


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: Depends = Depends(get_current_admin),
):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
