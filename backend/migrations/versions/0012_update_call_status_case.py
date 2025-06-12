"""update call status case to uppercase

Revision ID: 0012
Revises: 0011
Create Date: 2025-06-12 00:03:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '0012'
down_revision = '0011'
branch_labels = None
depends_on = None

def upgrade():
    # Create new enum type with uppercase values
    status_enum_new = postgresql.ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED', name='call_status_new')
    status_enum_new.create(op.get_bind())

    # First alter the default value
    op.execute("ALTER TABLE calls ALTER COLUMN status DROP DEFAULT")
    
    # Update the column to use uppercase values by first casting to text
    op.execute("ALTER TABLE calls ALTER COLUMN status TYPE call_status_new USING (UPPER(status::text)::call_status_new)")
    
    # Set the new default value
    op.execute("ALTER TABLE calls ALTER COLUMN status SET DEFAULT 'DRAFT'::call_status_new")
    
    # Drop old enum type
    op.execute("DROP TYPE call_status")

    # Rename new enum type to old name
    op.execute("ALTER TYPE call_status_new RENAME TO call_status")

def downgrade():
    # Create new enum type with lowercase values
    status_enum_new = postgresql.ENUM('draft', 'published', 'closed', 'archived', name='call_status_new')
    status_enum_new.create(op.get_bind())

    # First alter the default value
    op.execute("ALTER TABLE calls ALTER COLUMN status DROP DEFAULT")
    
    # Update the column to use lowercase values by first casting to text
    op.execute("ALTER TABLE calls ALTER COLUMN status TYPE call_status_new USING (LOWER(status::text)::call_status_new)")
    
    # Set the new default value
    op.execute("ALTER TABLE calls ALTER COLUMN status SET DEFAULT 'draft'::call_status_new")
    
    # Drop old enum type
    op.execute("DROP TYPE call_status")

    # Rename new enum type to old name
    op.execute("ALTER TYPE call_status_new RENAME TO call_status")
