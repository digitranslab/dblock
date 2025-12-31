"""Service for managing flow run execution history."""

from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from loguru import logger
from sqlmodel.ext.asyncio.session import AsyncSession

from kozmoai.services.database.models.flow_run import FlowRun, FlowRunStatus


class FlowRunService:
    """Service for creating and updating flow run records."""

    @staticmethod
    async def create_flow_run(
        session: AsyncSession,
        flow_id: UUID | str,
        user_id: UUID | str | None = None,
        session_id: str | None = None,
        trigger_type: str = "manual",
        inputs: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> FlowRun:
        """Create a new flow run record when execution starts."""
        flow_run = FlowRun(
            flow_id=UUID(str(flow_id)) if isinstance(flow_id, str) else flow_id,
            user_id=UUID(str(user_id)) if user_id and isinstance(user_id, str) else user_id,
            session_id=session_id,
            status=FlowRunStatus.RUNNING.value,
            trigger_type=trigger_type,
            inputs=inputs,
            metadata_=metadata,
            started_at=datetime.now(timezone.utc),
        )
        session.add(flow_run)
        await session.commit()
        await session.refresh(flow_run)
        logger.debug(f"Created flow run {flow_run.id} for flow {flow_id}")
        return flow_run

    @staticmethod
    async def complete_flow_run(
        session: AsyncSession,
        flow_run: FlowRun,
        outputs: dict[str, Any] | None = None,
        components_executed: int = 0,
    ) -> FlowRun:
        """Mark a flow run as successfully completed."""
        ended_at = datetime.now(timezone.utc)
        duration_ms = int((ended_at - flow_run.started_at).total_seconds() * 1000)
        
        flow_run.status = FlowRunStatus.SUCCESS.value
        flow_run.ended_at = ended_at
        flow_run.duration_ms = duration_ms
        flow_run.outputs = outputs
        flow_run.components_executed = components_executed
        
        session.add(flow_run)
        await session.commit()
        await session.refresh(flow_run)
        logger.debug(f"Completed flow run {flow_run.id} in {duration_ms}ms")
        return flow_run

    @staticmethod
    async def fail_flow_run(
        session: AsyncSession,
        flow_run: FlowRun,
        error_message: str,
        error_type: str | None = None,
        components_executed: int = 0,
    ) -> FlowRun:
        """Mark a flow run as failed."""
        ended_at = datetime.now(timezone.utc)
        duration_ms = int((ended_at - flow_run.started_at).total_seconds() * 1000)
        
        flow_run.status = FlowRunStatus.FAILURE.value
        flow_run.ended_at = ended_at
        flow_run.duration_ms = duration_ms
        flow_run.error_message = error_message
        flow_run.error_type = error_type or type(Exception).__name__
        flow_run.components_executed = components_executed
        
        session.add(flow_run)
        await session.commit()
        await session.refresh(flow_run)
        logger.debug(f"Failed flow run {flow_run.id}: {error_message}")
        return flow_run

    @staticmethod
    async def cancel_flow_run(
        session: AsyncSession,
        flow_run: FlowRun,
    ) -> FlowRun:
        """Mark a flow run as cancelled."""
        ended_at = datetime.now(timezone.utc)
        duration_ms = int((ended_at - flow_run.started_at).total_seconds() * 1000)
        
        flow_run.status = FlowRunStatus.CANCELLED.value
        flow_run.ended_at = ended_at
        flow_run.duration_ms = duration_ms
        
        session.add(flow_run)
        await session.commit()
        await session.refresh(flow_run)
        logger.debug(f"Cancelled flow run {flow_run.id}")
        return flow_run
