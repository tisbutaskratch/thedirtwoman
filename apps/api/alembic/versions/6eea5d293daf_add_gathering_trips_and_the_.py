"""add gathering trips and the contributions board

Revision ID: 6eea5d293daf
Revises: d5b21c8a9e77
Create Date: 2026-08-27 00:01:57.851038

Autogenerate also proposed altering gear.required_level and locations.kind.
Both were dropped by hand. Those columns use Enum(native_enum=False), which
defaults to create_constraint=False, so there is no constraint in the
database to compare against and the diff reappears on every autogenerate.
Applying it would rewrite two unrelated tables to no effect.

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6eea5d293daf'
down_revision: Union[str, None] = 'd5b21c8a9e77'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'contributions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('trip_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column(
            'kind',
            sa.Enum(
                'food', 'drink', 'dessert', 'game', 'supplies', 'other',
                name='contributionkind', native_enum=False,
            ),
            nullable=False,
        ),
        sa.Column('day_index', sa.Integer(), nullable=True),
        sa.Column('assigned_to_user_id', sa.Integer(), nullable=True),
        sa.Column('assigned_to_all', sa.Boolean(), nullable=False),
        sa.Column('serves', sa.Integer(), nullable=True),
        sa.Column('confirmed', sa.Boolean(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['assigned_to_user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_contributions_trip_id'), 'contributions', ['trip_id'], unique=False
    )
    op.create_table(
        'gathering_details',
        sa.Column('trip_id', sa.Integer(), nullable=False),
        sa.Column('occasion', sa.String(length=255), nullable=True),
        sa.Column('host_name', sa.String(length=255), nullable=True),
        sa.Column('headcount', sa.Integer(), nullable=True),
        sa.Column('dietary_notes', sa.Text(), nullable=True),
        sa.Column('kitchen_notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ),
        sa.PrimaryKeyConstraint('trip_id'),
    )


def downgrade() -> None:
    op.drop_table('gathering_details')
    op.drop_index(op.f('ix_contributions_trip_id'), table_name='contributions')
    op.drop_table('contributions')
