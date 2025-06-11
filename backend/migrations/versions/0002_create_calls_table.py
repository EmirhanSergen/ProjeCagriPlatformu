"""create calls table

Revision ID: 0002
Revises: 0001
Create Date: 2025-06-11 00:01:00
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'calls',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('is_open', sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_index('ix_calls_id', 'calls', ['id'])


def downgrade():
    op.drop_index('ix_calls_id', table_name='calls')
    op.drop_table('calls')
