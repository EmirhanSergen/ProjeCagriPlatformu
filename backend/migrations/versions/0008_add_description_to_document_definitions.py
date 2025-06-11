"""add description to document definitions

Revision ID: 0008
Revises: 0007
Create Date: 2025-06-12 00:00:00
"""

from alembic import op
import sqlalchemy as sa

revision = '0008'
down_revision = '0007'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('document_definitions', sa.Column('description', sa.String(), nullable=True))


def downgrade():
    op.drop_column('document_definitions', 'description')
