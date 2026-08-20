"""record privacy policy consent on users

Revision ID: 08ed4ca596bc
Revises: a64eabfb5ab9
Create Date: 2026-08-19 17:57:26.447373

Both columns are nullable, and that is deliberate rather than convenient.
Accounts that predate consent have not given it, and backfilling a
timestamp would be recording agreement that never happened. A null here
means "never asked", which is the truth and is also what a later prompt
would need to find them by.

Autogenerate also proposed altering gear.required_level from VARCHAR to a
non-native Enum. That is the usual phantom diff: the column is already a
VARCHAR with a check constraint and nothing about it has changed. Removed,
as in every migration before this one.

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "08ed4ca596bc"
down_revision: Union[str, None] = "a64eabfb5ab9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("privacy_policy_version", sa.String(length=20), nullable=True))
    op.add_column(
        "users", sa.Column("privacy_accepted_at", sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("users", "privacy_accepted_at")
    op.drop_column("users", "privacy_policy_version")
