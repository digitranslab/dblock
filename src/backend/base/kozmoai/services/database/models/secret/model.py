"""Secret database model for the Secrets Management service.

This module defines the database models for storing and managing secrets:
- SecretBase: Base class with common fields
- Secret: Table model with id, timestamps, and user relationship
- SecretCreate: For creating secrets (includes plaintext value)
- SecretRead: For reading secrets (includes masked_value)
- SecretDecrypted: Extends SecretRead with plaintext value (admin only)

Validates: Requirements 1.4
"""

from datetime import datetime, timezone
from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Column, DateTime, Field, Relationship, SQLModel, func

if TYPE_CHECKING:
    from kozmoai.services.database.models.user.model import User


def utc_now():
    """Return the current UTC timestamp."""
    return datetime.now(timezone.utc)


class SecretCategory(StrEnum):
    """Classification categories for secrets.
    
    Validates: Requirements 1.5
    """
    AWS = "AWS"
    AZURE = "Azure"
    GCP = "GCP"
    DATABASE = "Database"
    SSH = "SSH"
    CUSTOM = "Custom"


class SecretProfile(StrEnum):
    """Environment profiles for organizing secrets.
    
    Validates: Requirements 1.6
    """
    DEFAULT = "default"
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class SecretBase(SQLModel):
    """Base class for Secret models with common fields.
    
    Attributes:
        name: Display name of the secret
        key: ConfigKey enum value identifying the credential type
        encrypted_value: Fernet-encrypted value of the secret
        category: Classification category (AWS, Azure, GCP, Database, SSH, Custom)
        profile: Environment profile (default, development, staging, production)
    """
    name: str = Field(description="Display name of the secret")
    key: str = Field(description="ConfigKey enum value identifying the credential type")
    encrypted_value: str = Field(description="Fernet-encrypted value of the secret")
    category: SecretCategory = Field(
        default=SecretCategory.CUSTOM,
        description="Classification category for the secret"
    )
    profile: SecretProfile = Field(
        default=SecretProfile.DEFAULT,
        description="Environment profile for the secret"
    )


class Secret(SecretBase, table=True):  # type: ignore[call-arg]
    """Database table model for secrets.
    
    This model represents the secrets table in the database with all fields
    required for secure credential storage.
    
    Attributes:
        id: Unique identifier for the secret
        created_at: Timestamp when the secret was created
        updated_at: Timestamp when the secret was last updated
        user_id: Foreign key to the User who owns this secret
        user: Relationship to the User model
    """
    id: UUID | None = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique identifier for the secret",
    )
    created_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=True),
        description="Timestamp when the secret was created",
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
        description="Timestamp when the secret was last updated",
    )
    # Foreign key to user table
    user_id: UUID = Field(
        description="User ID associated with this secret",
        foreign_key="user.id"
    )
    user: "User" = Relationship(back_populates="secrets")


class SecretCreate(SQLModel):
    """Model for creating a new secret.
    
    This model is used when creating a new secret. It includes the plaintext
    value which will be encrypted before storage.
    
    Attributes:
        name: Display name of the secret
        key: ConfigKey enum value identifying the credential type
        value: Plaintext value (will be encrypted before storage)
        category: Classification category (AWS, Azure, GCP, Database, SSH, Custom)
        profile: Environment profile (default, development, staging, production)
    """
    name: str = Field(description="Display name of the secret")
    key: str = Field(description="ConfigKey enum value identifying the credential type")
    value: str = Field(description="Plaintext value (will be encrypted before storage)")
    category: SecretCategory = Field(
        default=SecretCategory.CUSTOM,
        description="Classification category for the secret"
    )
    profile: SecretProfile = Field(
        default=SecretProfile.DEFAULT,
        description="Environment profile for the secret"
    )
    created_at: datetime | None = Field(
        default_factory=utc_now,
        description="Timestamp when the secret was created"
    )
    updated_at: datetime | None = Field(
        default_factory=utc_now,
        description="Timestamp when the secret was last updated"
    )


class SecretRead(SQLModel):
    """Model for reading a secret with masked value.
    
    This model is returned when listing or retrieving secrets. The actual
    encrypted value is replaced with a masked value for security.
    
    Attributes:
        id: Unique identifier for the secret
        name: Display name of the secret
        key: ConfigKey enum value identifying the credential type
        masked_value: Masked representation of the value (e.g., "********")
        category: Classification category (AWS, Azure, GCP, Database, SSH, Custom)
        profile: Environment profile (default, development, staging, production)
        created_at: Timestamp when the secret was created
    """
    id: UUID = Field(description="Unique identifier for the secret")
    name: str = Field(description="Display name of the secret")
    key: str = Field(description="ConfigKey enum value identifying the credential type")
    masked_value: str = Field(
        default="********",
        description="Masked representation of the value"
    )
    category: SecretCategory = Field(description="Classification category for the secret")
    profile: SecretProfile = Field(description="Environment profile for the secret")
    created_at: datetime = Field(description="Timestamp when the secret was created")


class SecretDecrypted(SecretRead):
    """Model for reading a secret with decrypted plaintext value (admin only).
    
    This model extends SecretRead to include the decrypted plaintext value.
    It should only be returned to users with admin privileges.
    
    Attributes:
        value: Decrypted plaintext value of the secret
    """
    value: str = Field(description="Decrypted plaintext value of the secret (admin only)")


class SecretUpdate(SQLModel):
    """Model for updating an existing secret.
    
    This model is used when updating a secret. All fields are optional
    to allow partial updates.
    
    Attributes:
        name: Display name of the secret (optional)
        key: ConfigKey enum value identifying the credential type (optional)
        value: Plaintext value (will be encrypted before storage, optional)
        category: Classification category (optional)
        profile: Environment profile (optional)
    """
    name: str | None = Field(default=None, description="Display name of the secret")
    key: str | None = Field(default=None, description="ConfigKey enum value identifying the credential type")
    value: str | None = Field(default=None, description="Plaintext value (will be encrypted before storage)")
    category: SecretCategory | None = Field(default=None, description="Classification category for the secret")
    profile: SecretProfile | None = Field(default=None, description="Environment profile for the secret")
