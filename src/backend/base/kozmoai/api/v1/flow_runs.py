"""API endpoints for flow run execution history."""

from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import col, select
from sqlmodel.ext.asyncio.session import AsyncSession

from kozmoai.api.utils import DbSession
from kozmoai.services.database.models.flow import Flow
from kozmoai.services.database.models.flow_run import FlowRun, FlowRunRead, FlowRunStatus

router = APIRouter(prefix="/flow-runs", tags=["Flow Runs"])


@router.get("/", response_model=list[FlowRunRead])
async def get_flow_runs(
    session: DbSession,
    flow_id: UUID | None = Query(None, description="Filter by flow ID"),
    status_filter: str | None = Query(None, alias="status", description="Filter by status"),
    trigger_type: str | None = Query(None, description="Filter by trigger type"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    order_by: str = Query("started_at", description="Field to order by"),
    order_dir: str = Query("desc", description="Order direction (asc/desc)"),
) -> list[FlowRunRead]:
    """Get flow run execution history with optional filters."""
    
    query = select(FlowRun, Flow.name.label("flow_name")).join(Flow, FlowRun.flow_id == Flow.id)
    
    # Apply filters
    if flow_id:
        query = query.where(FlowRun.flow_id == flow_id)
    if status_filter:
        query = query.where(FlowRun.status == status_filter)
    if trigger_type:
        query = query.where(FlowRun.trigger_type == trigger_type)
    
    # Apply ordering
    order_column = getattr(FlowRun, order_by, FlowRun.started_at)
    if order_dir.lower() == "desc":
        query = query.order_by(col(order_column).desc())
    else:
        query = query.order_by(col(order_column).asc())
    
    # Apply pagination
    query = query.offset(offset).limit(limit)
    
    results = (await session.exec(query)).all()
    
    # Convert to response model
    flow_runs = []
    for run, flow_name in results:
        run_dict = run.model_dump()
        run_dict["flow_name"] = flow_name
        flow_runs.append(FlowRunRead(**run_dict))
    
    return flow_runs


@router.get("/stats")
async def get_flow_run_stats(
    session: DbSession,
    flow_id: UUID | None = Query(None, description="Filter by flow ID"),
    days: int = Query(7, ge=1, le=90, description="Number of days to include"),
) -> dict:
    """Get aggregated statistics for flow runs."""
    from datetime import timedelta
    
    cutoff_date = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    cutoff_date = cutoff_date - timedelta(days=days)
    
    base_query = select(FlowRun).where(FlowRun.started_at >= cutoff_date)
    if flow_id:
        base_query = base_query.where(FlowRun.flow_id == flow_id)
    
    runs = (await session.exec(base_query)).all()
    
    # Calculate statistics
    total_runs = len(runs)
    success_count = sum(1 for r in runs if r.status == FlowRunStatus.SUCCESS.value)
    failure_count = sum(1 for r in runs if r.status == FlowRunStatus.FAILURE.value)
    running_count = sum(1 for r in runs if r.status == FlowRunStatus.RUNNING.value)
    
    # Calculate average duration for completed runs
    completed_runs = [r for r in runs if r.duration_ms is not None]
    avg_duration_ms = (
        sum(r.duration_ms for r in completed_runs) / len(completed_runs)
        if completed_runs else 0
    )
    
    # Group by trigger type
    trigger_counts = {}
    for run in runs:
        trigger_counts[run.trigger_type] = trigger_counts.get(run.trigger_type, 0) + 1
    
    # Group by status
    status_counts = {}
    for run in runs:
        status_counts[run.status] = status_counts.get(run.status, 0) + 1
    
    return {
        "total_runs": total_runs,
        "success_count": success_count,
        "failure_count": failure_count,
        "running_count": running_count,
        "success_rate": (success_count / total_runs * 100) if total_runs > 0 else 0,
        "avg_duration_ms": avg_duration_ms,
        "trigger_counts": trigger_counts,
        "status_counts": status_counts,
        "period_days": days,
    }


@router.get("/{run_id}", response_model=FlowRunRead)
async def get_flow_run(
    run_id: UUID,
    session: DbSession,
) -> FlowRunRead:
    """Get a specific flow run by ID."""
    
    query = select(FlowRun, Flow.name.label("flow_name")).join(
        Flow, FlowRun.flow_id == Flow.id
    ).where(FlowRun.id == run_id)
    
    result = (await session.exec(query)).first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Flow run {run_id} not found",
        )
    
    run, flow_name = result
    run_dict = run.model_dump()
    run_dict["flow_name"] = flow_name
    return FlowRunRead(**run_dict)


@router.delete("/{run_id}")
async def delete_flow_run(
    run_id: UUID,
    session: DbSession,
) -> dict:
    """Delete a flow run record."""
    
    run = await session.get(FlowRun, run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Flow run {run_id} not found",
        )
    
    await session.delete(run)
    await session.commit()
    
    return {"message": "Flow run deleted successfully"}


@router.delete("/")
async def delete_flow_runs(
    session: DbSession,
    flow_id: UUID | None = Query(None, description="Delete runs for specific flow"),
    older_than_days: int | None = Query(None, ge=1, description="Delete runs older than N days"),
) -> dict:
    """Delete multiple flow run records based on filters."""
    from datetime import timedelta
    
    query = select(FlowRun)
    
    if flow_id:
        query = query.where(FlowRun.flow_id == flow_id)
    
    if older_than_days:
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=older_than_days)
        query = query.where(FlowRun.started_at < cutoff_date)
    
    runs = (await session.exec(query)).all()
    count = len(runs)
    
    for run in runs:
        await session.delete(run)
    
    await session.commit()
    
    return {"message": f"Deleted {count} flow run(s)"}
