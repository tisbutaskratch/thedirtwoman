"""drop scheduled trip deletion

Revision ID: d5b21c8a9e77
Revises: c31d9a70b4e2
Create Date: 2026-08-20 02:10:00.000000

deletion_scheduled_at implemented a design nobody asked for: a departing
creator could put a shared trip on a countdown and it would be destroyed for
everyone still on it.

The intended behaviour is per person. You leave; the trip carries on for
whoever is still there. Asking for a shared trip to be deleted means asking
the others to leave too, which each of them decides. The trip goes when the
last person leaves it, which is the only moment its going costs nobody
anything.

Nothing in production had a value here, since the column shipped and was
replaced in the same session, so there is no data to preserve. The
downgrade re-adds it empty, which matches: an older application would find
no trip scheduled, and that is now permanently true.

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d5b21c8a9e77"
down_revision: Union[str, None] = "c31d9a70b4e2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("trips") as batch:
        batch.drop_column("deletion_scheduled_at")


def downgrade() -> None:
    op.add_column(
        "trips", sa.Column("deletion_scheduled_at", sa.DateTime(timezone=True), nullable=True)
    )
