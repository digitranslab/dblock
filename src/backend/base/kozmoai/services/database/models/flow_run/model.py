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
from typing import TYPE_CHECKING, Any
from uuid import UUID, uuid4

from pydantic import BaseModel, field_serializer, field_validator
from sqlalchemy import DateTime, func
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
    
    # Duration in milliseconds
    duration_ms: int | None = Field(default=None, nullable=True)
    
    # Error type for failed runs
    error_type: str | None = Field(default=None, nullable=True)
    
    # Trigger type (manual, api, webhook, cron, etc.)
    trigger_type: str = Field(default="manual", index=True)
    
    # Number of components executed
    components_executed: int = Field(default=0)

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


class FlowRun(FlowRunBase, table=True):  # type: ignore[call-arg]
    """Flow Run table for tracking workflow execution history."""
    
    __tablename__ = "flow_run"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    
    # Datetime fields with timezone - must use sa_column for proper timezone support
    started_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False),
    )
    ended_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    
    # JSON fields - must be defined in table class with sa_column
    inputs: dict | None = Field(default=None, sa_column=Column(JSON))
    outputs: dict | None = Field(default=None, sa_column=Column(JSON))
    error_message: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    metadata_: dict | None = Field(default=None, sa_column=Column("metadata", JSON))
    
    # Relationships
    flow: "Flow" = Relationship(back_populates="runs")
    user: "User" = Relationship(back_populates="flow_runs")
    
    @field_serializer("started_at", "ended_at")
    @classmethod
    def serialize_datetime(cls, value):
        if value is None:
            return None
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()


class FlowRunCreate(BaseModel):
    """Schema for creating a new flow run."""
    
    flow_id: UUID
    user_id: UUID | None = None
    session_id: str | None = None
    trigger_type: str = "manual"
    inputs: dict[str, Any] | None = None
    metadata: dict[str, Any] | None = None


class FlowRunUpdate(BaseModel):
    """Schema for updating a flow run."""
    
    status: str | None = None
    ended_at: datetime | None = None
    duration_ms: int | None = None
    outputs: dict[str, Any] | None = None
    error_message: str | None = None
    error_type: str | None = None
    components_executed: int | None = None
    metadata: dict[str, Any] | None = None


class FlowRunRead(BaseModel):
    """Schema for reading a flow run."""
    
    id: UUID
    flow_id: UUID
    user_id: UUID | None = None
    session_id: str | None = None
    status: str
    started_at: datetime
    ended_at: datetime | None = None
    duration_ms: int | None = None
    error_type: str | None = None
    trigger_type: str
    components_executed: int = 0
    flow_name: str | None = None
    inputs: dict[str, Any] | None = None
    outputs: dict[str, Any] | None = None
    error_message: str | None = None
    metadata: dict[str, Any] | None = None
    
    class Config:
        from_attributes = True
