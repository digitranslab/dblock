#!/usr/bin/env python3
"""Seed fake execution history data for testing the Execution History page."""

import random
from datetime import datetime, timedelta, timezone
from uuid import uuid4

# Database connection
import psycopg2

# Connection parameters
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="kozmoai",
    user="kozmoai",
    password="kozmoai"
)

# Get existing flows and user
cur = conn.cursor()
cur.execute("SELECT id, name FROM flow WHERE folder_id IS NOT NULL LIMIT 10;")
flows = cur.fetchall()

if not flows:
    print("No user flows found. Creating execution history for starter projects instead.")
    cur.execute("SELECT id, name FROM flow LIMIT 10;")
    flows = cur.fetchall()

cur.execute("SELECT id FROM \"user\" LIMIT 1;")
user_id = cur.fetchone()[0]

print(f"Found {len(flows)} flows and user_id: {user_id}")

# Status options
statuses = ["success", "failure", "running", "cancelled", "pending"]
status_weights = [60, 20, 5, 10, 5]  # More successes than failures

# Trigger types
trigger_types = ["manual", "api", "webhook", "cron"]
trigger_weights = [50, 30, 15, 5]

# Error types for failures
error_types = ["ValidationError", "TimeoutError", "APIError", "ConnectionError", "RuntimeError"]
error_messages = [
    "Input validation failed: missing required field 'api_key'",
    "Request timed out after 30 seconds",
    "OpenAI API returned error: rate limit exceeded",
    "Failed to connect to external service",
    "Component execution failed: unexpected null value"
]

# Generate fake data
now = datetime.now(timezone.utc)
records = []

for i in range(50):
    flow_id, flow_name = random.choice(flows)
    status = random.choices(statuses, weights=status_weights)[0]
    trigger_type = random.choices(trigger_types, weights=trigger_weights)[0]
    
    # Random start time in the last 7 days
    started_at = now - timedelta(
        days=random.randint(0, 7),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59)
    )
    
    # Duration between 500ms and 60 seconds
    duration_ms = random.randint(500, 60000) if status in ["success", "failure", "cancelled"] else None
    
    # End time
    ended_at = started_at + timedelta(milliseconds=duration_ms) if duration_ms else None
    
    # Components executed
    components_executed = random.randint(3, 15) if status != "pending" else 0
    
    # Error info for failures
    error_type = random.choice(error_types) if status == "failure" else None
    error_message = random.choice(error_messages) if status == "failure" else None
    
    # Session ID
    session_id = str(uuid4()) if random.random() > 0.3 else None
    
    record = {
        "id": str(uuid4()),
        "flow_id": str(flow_id),
        "user_id": str(user_id),
        "session_id": session_id,
        "status": status,
        "started_at": started_at.isoformat(),
        "ended_at": ended_at.isoformat() if ended_at else None,
        "duration_ms": duration_ms,
        "trigger_type": trigger_type,
        "components_executed": components_executed,
        "error_type": error_type,
        "error_message": error_message,
        "inputs": '{}',
        "outputs": '{}' if status == "success" else None,
        "metadata": '{}'
    }
    records.append(record)

# Insert records
insert_sql = """
INSERT INTO flow_run (
    id, flow_id, user_id, session_id, status, started_at, ended_at, 
    duration_ms, trigger_type, components_executed, error_type, 
    error_message, inputs, outputs, metadata
) VALUES (
    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
)
"""

for record in records:
    cur.execute(insert_sql, (
        record["id"],
        record["flow_id"],
        record["user_id"],
        record["session_id"],
        record["status"],
        record["started_at"],
        record["ended_at"],
        record["duration_ms"],
        record["trigger_type"],
        record["components_executed"],
        record["error_type"],
        record["error_message"],
        record["inputs"],
        record["outputs"],
        record["metadata"]
    ))

conn.commit()
print(f"Inserted {len(records)} fake execution records")

# Show summary
cur.execute("""
    SELECT status, COUNT(*) 
    FROM flow_run 
    GROUP BY status 
    ORDER BY COUNT(*) DESC;
""")
print("\nStatus distribution:")
for row in cur.fetchall():
    print(f"  {row[0]}: {row[1]}")

cur.close()
conn.close()
