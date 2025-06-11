from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from passlib.context import CryptContext


from ..database import SessionLocal, Base, engine
from ..schemas.user import UserCreate, UserOut, UserLogin
from ..crud.user import get_user_by_email, create_user
from ..models.user import User
from ..config import settings

router = APIRouter(prefix="/users", tags=["users"])
auth_router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict) -> str:
    return jwt.encode(data, settings.jwt_secret, algorithm="HS256")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user

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
