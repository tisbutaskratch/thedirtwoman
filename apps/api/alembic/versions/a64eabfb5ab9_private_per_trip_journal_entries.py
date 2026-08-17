"""private per-trip journal entries

Revision ID: a64eabfb5ab9
Revises: 7a4fd0607ab7
Create Date: 2026-08-17 10:34:33.880570

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a64eabfb5ab9'
down_revision: Union[str, None] = '7a4fd0607ab7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('journal_entries',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('trip_id', sa.Integer(), nullable=False),
    sa.Column('author_user_id', sa.Integer(), nullable=False),
    sa.Column('entry_date', sa.Date(), nullable=False),
    sa.Column('body', sa.Text(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['author_user_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_journal_entries_author_user_id'), 'journal_entries', ['author_user_id'], unique=False)
    op.create_index(op.f('ix_journal_entries_trip_id'), 'journal_entries', ['trip_id'], unique=False)
    op.create_index('ix_journal_trip_author_date', 'journal_entries', ['trip_id', 'author_user_id', 'entry_date'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_journal_trip_author_date', table_name='journal_entries')
    op.drop_index(op.f('ix_journal_entries_trip_id'), table_name='journal_entries')
    op.drop_index(op.f('ix_journal_entries_author_user_id'), table_name='journal_entries')
    op.drop_table('journal_entries')
