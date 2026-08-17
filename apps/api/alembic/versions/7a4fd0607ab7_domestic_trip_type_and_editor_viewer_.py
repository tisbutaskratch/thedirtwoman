"""domestic trip type and editor viewer roles

Revision ID: 7a4fd0607ab7
Revises: 18f8ea677dd4
Create Date: 2026-08-16 23:09:44.791964

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a4fd0607ab7'
down_revision: Union[str, None] = '18f8ea677dd4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'domestic_details',
        sa.Column('trip_id', sa.Integer(), nullable=False),
        sa.Column(
            'travel_mode',
            sa.Enum('car', 'train', 'flight', name='domestictravelmode', native_enum=False),
            nullable=True,
        ),
        sa.Column('booking_ref', sa.String(length=100), nullable=True),
        sa.Column('origin', sa.String(length=255), nullable=True),
        sa.Column('destination', sa.String(length=255), nullable=True),
        sa.Column('is_rental', sa.Boolean(), nullable=True),
        sa.Column('rental_company', sa.String(length=255), nullable=True),
        sa.Column('total_distance_mi', sa.Float(), nullable=True),
        sa.Column('vehicle_mpg', sa.Float(), nullable=True),
        sa.Column('fuel_price_per_gallon', sa.Float(), nullable=True),
        sa.Column('rail_operator', sa.String(length=255), nullable=True),
        sa.Column('rail_pass_type', sa.String(length=255), nullable=True),
        sa.Column('seat_reservation_required', sa.Boolean(), nullable=True),
        sa.Column('seat_reservations_booked', sa.Boolean(), nullable=True),
        sa.Column('airline', sa.String(length=255), nullable=True),
        sa.Column('checked_bags', sa.Integer(), nullable=True),
        sa.Column('carry_on_only', sa.Boolean(), nullable=True),
        sa.Column('separate_tickets', sa.Boolean(), nullable=True),
        sa.Column('layover_notes', sa.Text(), nullable=True),
        sa.Column('lodging_type', sa.String(length=50), nullable=True),
        sa.Column('lodging_ref', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ),
        sa.PrimaryKeyConstraint('trip_id'),
    )

    # Everyone who already had access was an editor — the viewer tier is new,
    # so nothing existing should be silently downgraded to read-only.
    role_enum = sa.Enum('editor', 'viewer', name='triprole', native_enum=False)
    with op.batch_alter_table('trip_collaborators', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('role', role_enum, nullable=False, server_default='editor')
        )
    with op.batch_alter_table('trip_invites', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('role', role_enum, nullable=False, server_default='editor')
        )


def downgrade() -> None:
    with op.batch_alter_table('trip_invites', schema=None) as batch_op:
        batch_op.drop_column('role')
    with op.batch_alter_table('trip_collaborators', schema=None) as batch_op:
        batch_op.drop_column('role')
    op.drop_table('domestic_details')
