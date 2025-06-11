"""add document definitions table and document_id to attachments

Revision ID: 0007
Revises: 0006
Create Date: 2025-06-11 00:05:00
"""

from alembic import op
import sqlalchemy as sa

revision = '0007'
down_revision = '0006'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'document_definitions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('call_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('allowed_formats', sa.String(), nullable=False),
    )
    op.create_index('ix_document_definitions_id', 'document_definitions', ['id'])
    op.add_column('attachments', sa.Column('document_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_attachments_document_id', 'attachments', 'document_definitions', ['document_id'], ['id'])


def downgrade():
    op.drop_constraint('fk_attachments_document_id', 'attachments', type_='foreignkey')
    op.drop_column('attachments', 'document_id')
    op.drop_index('ix_document_definitions_id', table_name='document_definitions')
    op.drop_table('document_definitions')
