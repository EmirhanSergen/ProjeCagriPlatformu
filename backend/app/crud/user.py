from sqlalchemy.orm import Session
from passlib.context import CryptContext

from ..models.user import User, UserRole
from ..schemas.user import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_in: UserCreate) -> User:
    hashed_password = pwd_context.hash(user_in.password)
    role = UserRole(user_in.role)
    user = User(email=user_in.email, hashed_password=hashed_password, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
