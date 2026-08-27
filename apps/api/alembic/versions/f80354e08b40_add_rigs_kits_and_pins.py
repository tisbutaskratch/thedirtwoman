"""add rigs kits and pins

Three tables' worth of personal, per-user data that outlives any one trip:
your rigs, your kits and what you keep pinned to the top. None of it is
reachable through a trip, and trips never point at it.

Autogenerate also proposed altering gear.required_level and locations.kind.
Dropped by hand: those columns use Enum(native_enum=False), which creates no
constraint to compare against, so the diff reappears on every autogenerate
and applying it would rewrite two unrelated tables to no effect.

Revision ID: f80354e08b40
Revises: 6eea5d293daf
Create Date: 2026-08-27 01:02:40.152349

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f80354e08b40'
down_revision: Union[str, None] = '6eea5d293daf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('kits',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_kits_user_id'), 'kits', ['user_id'], unique=False)
    op.create_table('rigs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('kind', sa.Enum('motorcycle', 'truck', 'suv', 'van', 'car', 'other', name='rigkind', native_enum=False), nullable=False),
    sa.Column('make', sa.String(length=100), nullable=True),
    sa.Column('model', sa.String(length=100), nullable=True),
    sa.Column('year', sa.Integer(), nullable=True),
    sa.Column('fuel_capacity_gal', sa.Float(), nullable=True),
    sa.Column('fuel_economy_mpg', sa.Float(), nullable=True),
    sa.Column('ground_clearance_in', sa.Float(), nullable=True),
    sa.Column('tire_size', sa.String(length=100), nullable=True),
    sa.Column('drivetrain', sa.String(length=50), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_rigs_user_id'), 'rigs', ['user_id'], unique=False)
    op.create_table('section_pins',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('section', sa.Enum('members', 'timeline', 'files', 'contributions', 'packing', 'tasks', 'expenses', 'locations', 'notes', 'journal', 'photos', 'assignments', name='sectionkey', native_enum=False), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', 'section', name='uq_section_pin')
    )
    op.create_index(op.f('ix_section_pins_user_id'), 'section_pins', ['user_id'], unique=False)
    op.create_table('kit_items',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('kit_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['kit_id'], ['kits.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_kit_items_kit_id'), 'kit_items', ['kit_id'], unique=False)
    op.create_table('trip_pins',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('trip_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', 'trip_id', name='uq_trip_pin')
    )
    op.create_index(op.f('ix_trip_pins_trip_id'), 'trip_pins', ['trip_id'], unique=False)
    op.create_index(op.f('ix_trip_pins_user_id'), 'trip_pins', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_trip_pins_user_id'), table_name='trip_pins')
    op.drop_index(op.f('ix_trip_pins_trip_id'), table_name='trip_pins')
    op.drop_table('trip_pins')
    op.drop_index(op.f('ix_kit_items_kit_id'), table_name='kit_items')
    op.drop_table('kit_items')
    op.drop_index(op.f('ix_section_pins_user_id'), table_name='section_pins')
    op.drop_table('section_pins')
    op.drop_index(op.f('ix_rigs_user_id'), table_name='rigs')
    op.drop_table('rigs')
    op.drop_index(op.f('ix_kits_user_id'), table_name='kits')
    op.drop_table('kits')
