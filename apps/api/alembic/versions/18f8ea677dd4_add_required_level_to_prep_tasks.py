"""add required level to prep tasks

Revision ID: 18f8ea677dd4
Revises: c46305795919
Create Date: 2026-08-16 23:20:11.004512

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '18f8ea677dd4'
down_revision: Union[str, None] = 'c46305795919'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Existing tasks predate the distinction, so they default to "required"
    # the safer reading of a checklist item somebody already wrote down.
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                'required_level',
                sa.Enum('required', 'optional', name='taskrequiredlevel', native_enum=False),
                nullable=False,
                server_default='required',
            )
        )


def downgrade() -> None:
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.drop_column('required_level')
