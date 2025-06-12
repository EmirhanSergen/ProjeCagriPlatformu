"""add call lifecycle

Revision ID: 0010
Revises: 0009
Create Date: 2025-06-12 00:02:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '0010'
down_revision = '0009'
branch_labels = None
depends_on = None

def upgrade():
    # Create an enum type for call status
    status_enum = postgresql.ENUM('draft', 'published', 'closed', 'archived', name='call_status')
    status_enum.create(op.get_bind())

    # Add new columns
    op.add_column('calls', sa.Column('status', sa.Enum('draft', 'published', 'closed', 'archived', name='call_status'), nullable=False, server_default='draft'))
    op.add_column('calls', sa.Column('start_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('calls', sa.Column('end_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('calls', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False))
    op.add_column('calls', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False))
    op.add_column('calls', sa.Column('category', sa.String(50), nullable=True))
    op.add_column('calls', sa.Column('max_applications', sa.Integer, nullable=True))
    
    # Add validation constraint for dates
    op.create_check_constraint(
        'valid_dates',
        'calls',
        'end_date IS NULL OR start_date IS NULL OR end_date > start_date'
    )

def downgrade():
    op.drop_constraint('valid_dates', 'calls')
    op.drop_column('calls', 'max_applications')
    op.drop_column('calls', 'category')
    op.drop_column('calls', 'updated_at')
    op.drop_column('calls', 'created_at')
    op.drop_column('calls', 'end_date')
    op.drop_column('calls', 'start_date')
    op.drop_column('calls', 'status')
    
    status_enum = postgresql.ENUM(name='call_status')
    status_enum.drop(op.get_bind())
