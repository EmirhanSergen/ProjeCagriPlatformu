"""add is_confirmed column to attachments

Revision ID: 0005
Revises: 0004
Create Date: 2025-06-11 00:04:00
"""
from alembic import op
import sqlalchemy as sa

revision = '0005'
down_revision = '0004'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('attachments', sa.Column('is_confirmed', sa.Boolean(), nullable=False, server_default='0'))


def downgrade():
    op.drop_column('attachments', 'is_confirmed')

