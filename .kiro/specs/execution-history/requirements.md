# Execution History Tracking

## Overview
Track workflow execution history including success/failure status, execution times, and provide a UI to view and manage execution records.

## User Stories

### US-1: Flow Run Data Model
**As a** developer  
**I want** a database model to store flow execution records  
**So that** execution history can be persisted and queried

**Acceptance Criteria:**
- [x] FlowRun model exists with fields: id, flow_id, user_id, session_id, status, started_at, ended_at, duration_ms, inputs, outputs, error_message, error_type, trigger_type, components_executed, metadata
- [x] FlowRunStatus enum with values: PENDING, RUNNING, SUCCESS, FAILURE, CANCELLED
- [x] Foreign key relationships to Flow and User models
- [x] Proper indexes on flow_id, user_id, status, trigger_type, session_id

### US-2: Database Migration
**As a** developer  
**I want** an Alembic migration to create the flow_run table  
**So that** the schema is properly versioned and deployable

**Acceptance Criteria:**
- [x] Migration creates flow_run table with all required columns
- [x] Foreign key constraints to flow and user tables
- [x] Indexes created for query performance
- [x] Downgrade removes table and indexes cleanly

### US-3: API Endpoints for Flow Runs
**As a** developer  
**I want** REST API endpoints to query and manage flow runs  
**So that** the frontend can display execution history

**Acceptance Criteria:**
- [x] GET /api/v1/flow-runs/ - List flow runs with filters (flow_id, status, trigger_type) and pagination
- [x] GET /api/v1/flow-runs/stats - Get aggregated statistics (total, success/failure counts, avg duration)
- [x] GET /api/v1/flow-runs/{run_id} - Get specific flow run details
- [x] DELETE /api/v1/flow-runs/{run_id} - Delete a flow run record
- [x] DELETE /api/v1/flow-runs/ - Bulk delete with filters (flow_id, older_than_days)

### US-4: Execution History Page
**As a** user  
**I want** a page to view workflow execution history  
**So that** I can monitor and troubleshoot my workflows

**Acceptance Criteria:**
- [x] ExecutionHistoryPage component exists
- [x] Displays list of flow runs with status, flow name, duration, timestamp
- [x] Supports filtering by status and flow
- [x] Shows statistics summary (total runs, success rate, avg duration)

### US-5: History Navigation
**As a** user  
**I want** easy access to the execution history page  
**So that** I can quickly check workflow status

**Acceptance Criteria:**
- [x] History button added to left dock component
- [x] Route /history registered in routes.tsx
- [x] Navigation works correctly from any page

## Technical Notes

### Files Created/Modified
- `src/backend/base/kozmoai/services/database/models/flow_run/model.py` - FlowRun model and schemas
- `src/backend/base/kozmoai/alembic/versions/f8a1b2c3d4e5_create_flow_run_table.py` - Database migration
- `src/backend/base/kozmoai/api/v1/flow_runs.py` - API endpoints
- `src/backend/base/kozmoai/services/flow_run/service.py` - Service layer
- `src/backend/base/kozmoai/api/v1/endpoints.py` - Router registration
- `src/frontend/src/pages/ExecutionHistoryPage/index.tsx` - Frontend page
- `src/frontend/src/controllers/API/queries/flow-runs/index.ts` - API client
- `src/frontend/src/components/core/leftDockComponent/index.tsx` - History button
- `src/frontend/src/routes.tsx` - Route registration

### Database Pattern
Uses the same foreign key pattern as existing Flow and Message models:
```python
flow_id: UUID = Field(index=True, foreign_key="flow.id")
user_id: UUID | None = Field(default=None, index=True, foreign_key="user.id", nullable=True)
```

### Implementation Status
✅ **COMPLETED** - All user stories have been implemented and verified working.
