"""allow trips to outlive their creator

Revision ID: 4f87afd8e012
Revises: 08ed4ca596bc
Create Date: 2026-08-19 18:41:00.000000

A trip no longer needs a creator. When someone deletes their account and
leaves a shared trip behind, trips.user_id becomes null and the trip is
governed entirely by its collaborator rows, so nobody inherits it and no
single inactive account can strand the others.

deletion_scheduled_at carries the other case: the departing creator asked
for the trip to go too, and it stays readable until the grace period ends
so collaborators can object or take a copy.

The downgrade cannot restore a creator that no longer exists. Any trip
whose creator has gone is deleted on the way back, which is destructive and
deliberate: the alternative is a not-null column with nothing to put in it.

Autogenerate also proposed altering gear.required_level from VARCHAR to a
non-native Enum, the usual phantom diff. Removed, as always.

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "4f87afd8e012"
down_revision: Union[str, None] = "08ed4ca596bc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("trips", sa.Column("deletion_scheduled_at", sa.DateTime(timezone=True), nullable=True))
    # batch_alter_table so this applies on SQLite too, which cannot alter a
    # column in place.
    with op.batch_alter_table("trips") as batch:
        batch.alter_column("user_id", existing_type=sa.INTEGER(), nullable=True)


def downgrade() -> None:
    # Trips whose creator is gone have nothing to put in a not-null column.
    op.execute("DELETE FROM trips WHERE user_id IS NULL")
    with op.batch_alter_table("trips") as batch:
        batch.alter_column("user_id", existing_type=sa.INTEGER(), nullable=False)
    op.drop_column("trips", "deletion_scheduled_at")
