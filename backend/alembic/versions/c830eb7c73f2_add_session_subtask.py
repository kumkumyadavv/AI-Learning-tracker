"""add optional subtask to learning sessions

Revision ID: c830eb7c73f2
Revises: 6a7eed2c281f
Create Date: 2026-11-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c830eb7c73f2"
down_revision: Union[str, Sequence[str], None] = "6a7eed2c281f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "learning_sessions",
        sa.Column("subtask_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_learning_sessions_subtask_id_subtasks",
        "learning_sessions",
        "subtasks",
        ["subtask_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_learning_sessions_subtask_id_subtasks",
        "learning_sessions",
        type_="foreignkey",
    )
    op.drop_column("learning_sessions", "subtask_id")
