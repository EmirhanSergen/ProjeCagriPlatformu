"""create applications table

Revision ID: 0003
Revises: 0002
Create Date: 2025-06-11 00:02:00
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'applications',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('call_id', sa.Integer(), sa.ForeignKey('calls.id'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
    )
    op.create_index('ix_applications_id', 'applications', ['id'])


def downgrade():
    op.drop_index('ix_applications_id', table_name='applications')
    op.drop_table('applications')
