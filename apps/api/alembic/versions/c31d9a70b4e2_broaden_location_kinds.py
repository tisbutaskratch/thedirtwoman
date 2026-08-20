"""broaden location kinds

Revision ID: c31d9a70b4e2
Revises: 4f87afd8e012
Create Date: 2026-08-19 20:05:00.000000

From a user: their final destination was their mother's house, and none of
the options fitted. The nearest was "hotel", which is a specific noun where
the category is "where you are staying". Renamed to "lodging", which covers
a spare room, an Airbnb, a hostel and an actual hotel.

Adds "transit" at the same time. Airports, stations and ferry terminals had
nowhere to go, and they are most of the shape of an international or
domestic trip; the gap showed up while seeding an airport and having to
file it as a point of interest.

Two things worth knowing about the column. There is no check constraint to
update: SQLAlchemy's Enum(native_enum=False) defaults to
create_constraint=False, so this is a plain VARCHAR and the values are
enforced in the application. That is also why autogenerate proposes an
enum alter on every run for columns like gear.required_level, a phantom
diff stripped from each migration since.

The column was VARCHAR(9), sized to the longest value it happened to hold.
Widened to 30 so the next kind does not need a migration of its own, and
so a longer value cannot be silently truncated.

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c31d9a70b4e2"
down_revision: Union[str, None] = "4f87afd8e012"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("locations") as batch:
        batch.alter_column(
            "kind", existing_type=sa.VARCHAR(length=9), type_=sa.String(length=30),
            existing_nullable=False,
        )
    # Nobody loses a place they saved.
    op.execute("UPDATE locations SET kind = 'lodging' WHERE kind = 'hotel'")


def downgrade() -> None:
    # transit has no older equivalent, so those become waypoints rather than
    # values the application would refuse to read back.
    op.execute("UPDATE locations SET kind = 'hotel' WHERE kind = 'lodging'")
    op.execute("UPDATE locations SET kind = 'waypoint' WHERE kind = 'transit'")
    with op.batch_alter_table("locations") as batch:
        batch.alter_column(
            "kind", existing_type=sa.String(length=30), type_=sa.VARCHAR(length=9),
            existing_nullable=False,
        )
