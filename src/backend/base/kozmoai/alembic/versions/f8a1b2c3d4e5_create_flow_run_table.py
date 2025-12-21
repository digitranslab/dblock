"""Create flow_run table for execution history tracking.

Revision ID: f8a1b2c3d4e5
Revises: dd9e0804ebd1
Create Date: 2024-12-20 10:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f8a1b2c3d4e5"
down_revision: Union[str, None] = "dd9e0804ebd1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "flow_run",
        sa.Column("id", sqlmodel.sql.sqltypes.types.Uuid(), nullable=False),
        sa.Column("flow_id", sqlmodel.sql.sqltypes.types.Uuid(), nullable=False),
        sa.Column("user_id", sqlmodel.sql.sqltypes.types.Uuid(), nullable=True),
        sa.Column("session_id", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("status", sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default="pending"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column("inputs", sa.JSON(), nullable=True),
        sa.Column("outputs", sa.JSON(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("error_type", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("trigger_type", sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default="manual"),
        sa.Column("components_executed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["flow_id"], ["flow.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_flow_run_flow_id"), "flow_run", ["flow_id"], unique=False)
    op.create_index(op.f("ix_flow_run_user_id"), "flow_run", ["user_id"], unique=False)
    op.create_index(op.f("ix_flow_run_status"), "flow_run", ["status"], unique=False)
    op.create_index(op.f("ix_flow_run_trigger_type"), "flow_run", ["trigger_type"], unique=False)
    op.create_index(op.f("ix_flow_run_session_id"), "flow_run", ["session_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_flow_run_session_id"), table_name="flow_run")
    op.drop_index(op.f("ix_flow_run_trigger_type"), table_name="flow_run")
    op.drop_index(op.f("ix_flow_run_status"), table_name="flow_run")
    op.drop_index(op.f("ix_flow_run_user_id"), table_name="flow_run")
    op.drop_index(op.f("ix_flow_run_flow_id"), table_name="flow_run")
    op.drop_table("flow_run")
