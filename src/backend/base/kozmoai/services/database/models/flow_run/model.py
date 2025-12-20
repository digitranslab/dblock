"""Flow Run model for tracking workflow execution history.

This model tracks complete workflow executions including:
- Start and end times
- Execution status (running, success, failure, cancelled)
- Error messages for failed runs
- Input/output data
- Execution duration
"""

from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from pydantic import field_serializer, field_validator
from sqlmodel import JSON, Column, Field, Relationship, SQLModel, Text

if TYPE_CHECKING:
    from kozmoai.services.database.models.flow.model import Flow
    from kozmoai.services.database.models.user.model import User


class FlowRunStatus(str, Enum):
    """Status of a flow run."""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILURE = "failure"
    CANCELLED = "cancelled"


class FlowRunBase(SQLModel):
    """Base model for flow runs."""
    
    flow_id: UUID = Field(foreign_key="flow.id", index=True)
    user_id: UUID | None = Field(default=None, foreign_key="user.id", index=True, nullable=True)
    session_id: str | None = Field(default=None, index=True, nullable=True)
    
    status: str = Field(default=FlowRunStatus.PENDING.value, index=True)
    
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: datetime | None = Field(default=None, nullable=True)
    
    # Duration in milliseconds
    duration_ms: int | None = Field(default=None, nullable=True)
    
    # Input data (tweaks, input values, etc.)
    inputs: dict | None = Field(default=None, sa_column=Column(JSON))
    
    # Output data (results from the flow)
    outputs: dict | None = Field(default=None, sa_column=Column(JSON))
    
    # Error information for failed runs
    error_message: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    error_type: str | None = Field(default=None, nullable=True)
    
    # Trigger type (manual, api, webhook, cron, etc.)
    trigger_type: str = Field(default="manual", index=True)
    
    # Number of components executed
    components_executed: int = Field(default=0)
    
    # Metadata for additional context
    metadata: dict | None = Field(default=None, sa_column=Column(JSON))

    class Config:
        arbitrary_types_allowed = True

    @field_validator("flow_id", "user_id", mode="before")
    @classmethod
    def validate_uuid(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            return UUID(value)
        return value

    @field_serializer("started_at", "ended_at")
    @classmethod
    def serialize_datetime(cls, value):
        if value is None:
            return None
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()


class FlowRun(FlowRunBase, table=True):  # type: ignore[call-arg]
    """Flow Run table for tracking workflow execution history."""
    
    __tablename__ = "flow_run"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    
    # Relationships
    flow: "Flow" = Relationship(back_populates="runs")
    user: "User" = Relationship(back_populates="flow_runs")


class FlowRunCreate(SQLModel):
    """Schema for creating a new flow run."""
    
    flow_id: UUID
    user_id: UUID | None = None
    session_id: str | None = None
    trigger_type: str = "manual"
    inputs: dict | None = None
    metadata: dict | None = None


class FlowRunUpdate(SQLModel):
    """Schema for updating a flow run."""
    
    status: str | None = None
    ended_at: datetime | None = None
    duration_ms: int | None = None
    outputs: dict | None = None
    error_message: str | None = None
    error_type: str | None = None
    components_executed: int | None = None
    metadata: dict | None = None


class FlowRunRead(FlowRunBase):
    """Schema for reading a flow run."""
    
    id: UUID
    flow_name: str | None = None
