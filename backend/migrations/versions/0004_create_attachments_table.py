"""create attachments table

Revision ID: 0004
Revises: 0003
Create Date: 2025-06-11 00:03:00
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'attachments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('application_id', sa.Integer(), sa.ForeignKey('applications.id'), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
    )
    op.create_index('ix_attachments_id', 'attachments', ['id'])


def downgrade():
    op.drop_index('ix_attachments_id', table_name='attachments')
    op.drop_table('attachments')
