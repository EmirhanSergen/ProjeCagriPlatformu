from sqlalchemy import Column, Integer, String, Enum, MetaData, Table

from ..database import engine
from ..models.user import UserRole

metadata = MetaData()

users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("email", String, unique=True, index=True, nullable=False),
    Column("hashed_password", String, nullable=False),
    Column(
        "role",
        Enum(UserRole, name="user_role"),
        nullable=False,
        server_default=UserRole.APPLICANT.value,
    ),
)


def upgrade():
    metadata.create_all(engine)


def downgrade():
    metadata.drop_all(engine)
