"""replace trip status with archived_at, add assign-to-all flags

Revision ID: c46305795919
Revises: b8a4c26468e8
Create Date: 2026-08-16 17:37:47.367272

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c46305795919'
down_revision: Union[str, None] = 'b8a4c26468e8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # The new flags are NOT NULL, so existing rows need a server_default to
    # backfill; batch_alter_table keeps the DROP portable to SQLite.
    with op.batch_alter_table('gear', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('assigned_to_all', sa.Boolean(), nullable=False, server_default=sa.false())
        )

    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('assigned_to_all', sa.Boolean(), nullable=False, server_default=sa.false())
        )

    with op.batch_alter_table('trips', schema=None) as batch_op:
        batch_op.add_column(sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True))

    # Trips that were marked "completed" under the old status field are the
    # ones a user would have archived, so carry that intent across before the
    # column goes away.
    op.execute(
        "UPDATE trips SET archived_at = CURRENT_TIMESTAMP WHERE status = 'completed'"
    )

    with op.batch_alter_table('trips', schema=None) as batch_op:
        batch_op.drop_column('status')


def downgrade() -> None:
    with op.batch_alter_table('trips', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                'status', sa.VARCHAR(length=9), nullable=False, server_default='planning'
            )
        )

    op.execute("UPDATE trips SET status = 'completed' WHERE archived_at IS NOT NULL")

    with op.batch_alter_table('trips', schema=None) as batch_op:
        batch_op.drop_column('archived_at')

    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.drop_column('assigned_to_all')

    with op.batch_alter_table('gear', schema=None) as batch_op:
        batch_op.drop_column('assigned_to_all')
