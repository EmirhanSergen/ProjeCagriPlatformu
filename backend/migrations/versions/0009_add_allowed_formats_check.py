"""add check constraint on document_definitions.allowed_formats

Revision ID: 0009
Revises: 0008
Create Date: 2025-06-12 00:01:00
"""

from alembic import op
import sqlalchemy as sa

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_allowed_formats",
        "document_definitions",
        "allowed_formats in ('pdf','image','text')",
    )


def downgrade() -> None:
    op.drop_constraint(
        "ck_allowed_formats",
        "document_definitions",
        type_="check",
    )

