"""Trigger schema for workflow execution triggers.

The Trigger type represents an execution signal that can be used to start
workflow execution. Unlike Data which carries payload information, Trigger
is primarily used for control flow - signaling when a component should execute.
"""

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


class Trigger(BaseModel):
    """Represents a trigger signal for workflow execution.
    
    A Trigger is used to signal that a downstream component should execute.
    It can optionally carry a payload with additional context, but its primary
    purpose is control flow rather than data transfer.
    
    Attributes:
        source: The source component that fired the trigger (e.g., "cron", "webhook", "manual")
        trigger_type: The type of trigger (e.g., "scheduled", "event", "manual")
        timestamp: When the trigger was fired (ISO format)
        payload: Optional data payload to pass to downstream components
        metadata: Additional metadata about the trigger
    """
    
    source: str = Field(default="", description="Source component that fired the trigger")
    trigger_type: str = Field(default="manual", description="Type of trigger")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    payload: dict[str, Any] = Field(default_factory=dict, description="Optional payload data")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
    @classmethod
    def create(
        cls,
        source: str = "",
        trigger_type: str = "manual",
        payload: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> "Trigger":
        """Factory method to create a Trigger instance.
        
        Args:
            source: The source component name
            trigger_type: Type of trigger (scheduled, event, manual)
            payload: Optional data payload
            metadata: Optional metadata
            
        Returns:
            A new Trigger instance
        """
        return cls(
            source=source,
            trigger_type=trigger_type,
            payload=payload or {},
            metadata=metadata or {},
        )
    
    @classmethod
    def from_cron(
        cls,
        schedule_type: str,
        cron_expression: str | None = None,
        timezone_str: str = "UTC",
        payload: dict[str, Any] | None = None,
    ) -> "Trigger":
        """Create a Trigger from a cron schedule.
        
        Args:
            schedule_type: The schedule type (@once, @hourly, @daily, etc.)
            cron_expression: The cron expression if custom
            timezone_str: The timezone for the schedule
            payload: Optional payload data
            
        Returns:
            A new Trigger instance configured for cron
        """
        return cls(
            source="cron",
            trigger_type="scheduled",
            payload=payload or {},
            metadata={
                "schedule_type": schedule_type,
                "cron_expression": cron_expression,
                "timezone": timezone_str,
            },
        )
    
    def __str__(self) -> str:
        return f"Trigger(source={self.source}, type={self.trigger_type}, timestamp={self.timestamp})"
    
    def __repr__(self) -> str:
        return self.__str__()
