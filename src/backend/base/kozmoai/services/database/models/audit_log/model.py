"""AuditLog database model for the Secrets Management service.

This module defines the database model for audit logging of secret operations:
- AuditLog: Table model for recording all secret access and modification events

The audit log captures all create, update, delete, and decrypt operations
on secrets for compliance and security monitoring purposes.

Validates: Requirements 10.2
"""

from datetime import datetime, timezone
from enum import StrEnum
from uuid import UUID, uuid4

from sqlmodel import Column, DateTime, Field, SQLModel, func


def utc_now():
    """Return the current UTC timestamp."""
    return datetime.now(timezone.utc)


class AuditAction(StrEnum):
    """Enumeration of audit log action types.
    
    This enum defines the types of actions that can be logged in the audit log.
    
    Attributes:
        CREATE: A new secret was created
        UPDATE: An existing secret was updated
        DELETE: A secret was deleted
        DECRYPT: A secret was decrypted (viewed in plaintext)
    """
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    DECRYPT = "DECRYPT"


class AuditLog(SQLModel, table=True):  # type: ignore[call-arg]
    """Database table model for audit log entries.
    
    This model represents the audit_log table in the database, recording
    all operations performed on secrets for security and compliance purposes.
    
    Attributes:
        id: Unique identifier for the audit log entry
        user_id: UUID of the user who performed the action
        action_type: Type of action performed (CREATE, UPDATE, DELETE, DECRYPT)
        secret_id: UUID of the affected secret
        timestamp: When the action occurred
        ip_address: Client IP address from which the action was performed
    
    Validates: Requirements 10.2
    """
    __tablename__ = "audit_log"
    
    id: UUID | None = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique identifier for the audit log entry",
    )
    user_id: UUID = Field(
        description="UUID of the user who performed the action",
        foreign_key="user.id",
    )
    action_type: AuditAction = Field(
        description="Type of action performed (CREATE, UPDATE, DELETE, DECRYPT)",
    )
    secret_id: UUID = Field(
        description="UUID of the affected secret",
    )
    timestamp: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=True),
        description="When the action occurred",
    )
    ip_address: str = Field(
        description="Client IP address from which the action was performed",
    )
