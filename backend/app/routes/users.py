from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext


from app.dependencies import get_db
from ..dependencies import get_current_user
from ..schemas.user import UserCreate, UserOut, UserLogin
from ..crud.user import get_user_by_email, create_user
from ..models.user import User
from ..config import settings

router = APIRouter(prefix="/users", tags=["users"])
auth_router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict) -> str:
    return jwt.encode(data, settings.jwt_secret, algorithm="HS256")


@router.post("/", response_model=UserOut)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with the provided role."""
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(db, user_in)
    return user


@auth_router.post("/login")
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, user_in.email)
    if not user or not pwd_context.verify(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.role.value != user_in.role:
        raise HTTPException(status_code=403, detail="Role mismatch")
    token = create_access_token({"sub": str(user.id), "role": user_in.role})
    return {"access_token": token}


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
