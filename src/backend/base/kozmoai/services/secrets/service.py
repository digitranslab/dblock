"""Secrets Service for managing secrets with CRUD operations.

This module provides the SecretsService class that handles all secret management
operations including creation, retrieval, listing, updating, and deletion of secrets.

The service integrates with:
- EncryptionService for encrypting/decrypting secret values
- Credential loaders for resolving credentials from multiple sources
- Database models for persistent storage

Validates: Requirements 3.1, 3.2, 3.3
"""

import time
from collections import defaultdict
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from loguru import logger
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from kozmoai.services.database.models.secret import (
    Secret,
    SecretCreate,
    SecretRead,
    SecretUpdate,
)
from kozmoai.services.database.models.audit_log import AuditLog
from kozmoai.services.secrets.constants import AuditAction, SecretCategory, SecretProfile
from kozmoai.services.secrets.encryption import EncryptionService
from kozmoai.services.secrets.loaders.base import BaseCredentialLoader


class SecretNotFoundError(Exception):
    """Exception raised when a secret is not found.
    
    This exception is raised when attempting to retrieve, update, or delete
    a secret that does not exist in the database.
    """

    def __init__(self, secret_id: UUID):
        self.secret_id = secret_id
        self.message = f"Secret with id '{secret_id}' not found"
        super().__init__(self.message)


class DuplicateSecretError(Exception):
    """Exception raised when attempting to create a duplicate secret.
    
    This exception is raised when attempting to create a secret with a name
    that already exists for the same user and profile.
    
    Validates: Requirements 3.1
    """

    def __init__(self, name: str, profile: str):
        self.name = name
        self.profile = profile
        self.message = f"Secret with name '{name}' already exists for profile '{profile}'"
        super().__init__(self.message)


class AdminRequiredError(Exception):
    """Exception raised when admin privileges are required.
    
    This exception is raised when a non-admin user attempts to perform
    an operation that requires admin privileges (e.g., decrypt, create,
    update, delete secrets).
    
    Validates: Requirements 2.2, 3.6
    """

    def __init__(self, operation: str = "this operation"):
        self.operation = operation
        self.message = f"Admin privileges required for {operation}"
        super().__init__(self.message)


class RateLimitExceededError(Exception):
    """Exception raised when rate limit is exceeded.
    
    This exception is raised when a user exceeds the maximum number of
    decrypt requests within the rate limit window.
    
    Validates: Requirements 10.3, 10.4
    """

    def __init__(self, retry_after: int):
        self.retry_after = retry_after
        self.message = f"Rate limit exceeded. Retry after {retry_after} seconds"
        super().__init__(self.message)


class SecretsService:
    """Service for managing secrets with CRUD operations.
    
    This service provides methods for creating, reading, updating, and deleting
    secrets. It integrates with the EncryptionService for secure storage and
    supports multiple credential loaders for resolving credentials from various
    sources.
    
    Attributes:
        encryption_service: Service for encrypting and decrypting secret values.
        loaders: Optional list of credential loaders for resolving credentials
            from multiple sources (Database, Environment, Config File, AWS).
        rate_limit_max: Maximum decrypt requests per window (default: 10).
        rate_limit_window: Rate limit window in seconds (default: 60).
    
    Validates: Requirements 3.1, 3.2, 3.3, 10.3, 10.4
    
    Example:
        >>> encryption_service = EncryptionService("my-32-char-encryption-key-here!")
        >>> secrets_service = SecretsService(encryption_service)
        >>> secret = await secrets_service.create_secret(
        ...     session, user_id, SecretCreate(name="API Key", key="API_KEY", value="secret123")
        ... )
    """

    def __init__(
        self,
        encryption_service: EncryptionService,
        loaders: Optional[list[BaseCredentialLoader]] = None,
        rate_limit_max: int = 10,
        rate_limit_window: int = 60,
    ) -> None:
        """Initialize the SecretsService.
        
        Args:
            encryption_service: Service for encrypting and decrypting secret values.
            loaders: Optional list of credential loaders for resolving credentials
                from multiple sources. The loaders are checked in order:
                Database > Environment > Config File > AWS Secrets Manager.
            rate_limit_max: Maximum decrypt requests per window (default: 10).
            rate_limit_window: Rate limit window in seconds (default: 60).
        """
        self.encryption_service = encryption_service
        self.loaders = loaders or []
        self.rate_limit_max = rate_limit_max
        self.rate_limit_window = rate_limit_window
        # Track decrypt requests per user: {user_id: [(timestamp, ...], ...}
        self._decrypt_requests: dict[UUID, list[float]] = defaultdict(list)

    async def create_secret(
        self,
        session: AsyncSession,
        user_id: UUID,
        data: SecretCreate,
        ip_address: str = "unknown",
    ) -> SecretRead:
        """Create a new secret with encrypted value.
        
        This method creates a new secret in the database. The plaintext value
        is encrypted before storage. The secret name must be unique within
        the user's scope and profile.
        
        Args:
            session: SQLAlchemy async session for database access.
            user_id: The ID of the user creating the secret.
            data: The secret data including name, key, value, category, and profile.
            ip_address: The client IP address for audit logging.
        
        Returns:
            SecretRead: The created secret with masked value.
        
        Raises:
            DuplicateSecretError: If a secret with the same name already exists
                for the user and profile.
        
        Validates: Requirements 3.1
        
        Example:
            >>> secret_data = SecretCreate(
            ...     name="AWS Access Key",
            ...     key="AWS_ACCESS_KEY_ID",
            ...     value="AKIAIOSFODNN7EXAMPLE",
            ...     category=SecretCategory.AWS,
            ...     profile=SecretProfile.DEFAULT
            ... )
            >>> secret = await service.create_secret(session, user_id, secret_data)
        """
        # Check for duplicate name within user scope and profile
        await self._validate_unique_name(session, user_id, data.name, data.profile)
        
        # Encrypt the plaintext value
        encrypted_value = self.encryption_service.encrypt(data.value)
        
        # Create the secret record
        now = datetime.now(timezone.utc)
        secret = Secret(
            name=data.name,
            key=data.key,
            encrypted_value=encrypted_value,
            category=data.category,
            profile=data.profile,
            user_id=user_id,
            created_at=now,
            updated_at=now,
        )
        
        session.add(secret)
        await session.commit()
        await session.refresh(secret)
        
        # Store values before audit logging (which commits again)
        secret_id = secret.id
        secret_name = secret.name
        
        # Log audit entry
        await self._log_audit(session, user_id, AuditAction.CREATE, secret_id, ip_address)
        await session.commit()
        
        logger.debug(f"Created secret '{secret_name}' (id={secret_id}) for user {user_id}")
        
        # Refresh to get latest state after audit commit
        await session.refresh(secret)
        
        return self._to_secret_read(secret)

    async def get_secret(
        self,
        session: AsyncSession,
        user_id: UUID,
        secret_id: UUID,
    ) -> SecretRead:
        """Get a single secret with masked value.
        
        This method retrieves a secret by its ID. The returned secret has
        a masked value for security.
        
        Args:
            session: SQLAlchemy async session for database access.
            user_id: The ID of the user requesting the secret.
            secret_id: The ID of the secret to retrieve.
        
        Returns:
            SecretRead: The secret with masked value.
        
        Raises:
            SecretNotFoundError: If the secret does not exist or does not
                belong to the user.
        
        Example:
            >>> secret = await service.get_secret(session, user_id, secret_id)
            >>> print(secret.masked_value)  # "********"
        """
        secret = await self._get_secret_by_id(session, user_id, secret_id)
        return self._to_secret_read(secret)

    async def list_secrets(
        self,
        session: AsyncSession,
        user_id: UUID,
        category: Optional[SecretCategory] = None,
        profile: Optional[SecretProfile] = None,
        search: Optional[str] = None,
    ) -> list[SecretRead]:
        """List secrets with optional filters.
        
        This method retrieves all secrets for a user with optional filtering
        by category, profile, and search query. All returned secrets have
        masked values.
        
        Args:
            session: SQLAlchemy async session for database access.
            user_id: The ID of the user requesting the secrets.
            category: Optional category filter (AWS, Azure, GCP, Database, SSH, Custom).
            profile: Optional profile filter (default, development, staging, production).
            search: Optional search query to filter by name or key.
        
        Returns:
            list[SecretRead]: List of secrets with masked values.
        
        Validates: Requirements 4.3, 4.4, 4.5
        
        Example:
            >>> # List all secrets
            >>> secrets = await service.list_secrets(session, user_id)
            >>> 
            >>> # List AWS secrets in production
            >>> secrets = await service.list_secrets(
            ...     session, user_id,
            ...     category=SecretCategory.AWS,
            ...     profile=SecretProfile.PRODUCTION
            ... )
            >>> 
            >>> # Search for secrets containing "api"
            >>> secrets = await service.list_secrets(session, user_id, search="api")
        """
        # Build the base query
        statement = select(Secret).where(Secret.user_id == user_id)
        
        # Apply category filter
        if category is not None:
            statement = statement.where(Secret.category == category)
        
        # Apply profile filter
        if profile is not None:
            statement = statement.where(Secret.profile == profile)
        
        # Apply search filter (case-insensitive search on name and key)
        if search is not None:
            search_pattern = f"%{search.lower()}%"
            statement = statement.where(
                (Secret.name.ilike(search_pattern)) | (Secret.key.ilike(search_pattern))
            )
        
        # Order by created_at descending (newest first)
        statement = statement.order_by(Secret.created_at.desc())
        
        result = await session.execute(statement)
        secrets = result.scalars().all()
        
        logger.debug(f"Listed {len(secrets)} secrets for user {user_id}")
        
        return [self._to_secret_read(secret) for secret in secrets]

    async def update_secret(
        self,
        session: AsyncSession,
        user_id: UUID,
        secret_id: UUID,
        data: SecretUpdate,
        ip_address: str = "unknown",
    ) -> SecretRead:
        """Update a secret, re-encrypting if value changed.
        
        This method updates an existing secret. If the value is changed,
        it is re-encrypted before storage. The updated_at timestamp is
        always updated.
        
        Args:
            session: SQLAlchemy async session for database access.
            user_id: The ID of the user updating the secret.
            secret_id: The ID of the secret to update.
            data: The update data with optional fields to update.
            ip_address: The client IP address for audit logging.
        
        Returns:
            SecretRead: The updated secret with masked value.
        
        Raises:
            SecretNotFoundError: If the secret does not exist or does not
                belong to the user.
            DuplicateSecretError: If updating the name would create a duplicate.
        
        Validates: Requirements 3.2
        
        Example:
            >>> update_data = SecretUpdate(value="new-secret-value")
            >>> secret = await service.update_secret(session, user_id, secret_id, update_data)
        """
        secret = await self._get_secret_by_id(session, user_id, secret_id)
        
        # Check for duplicate name if name is being changed
        if data.name is not None and data.name != secret.name:
            target_profile = data.profile if data.profile is not None else secret.profile
            await self._validate_unique_name(
                session, user_id, data.name, target_profile, exclude_id=secret_id
            )
        
        # Update fields if provided
        if data.name is not None:
            secret.name = data.name
        if data.key is not None:
            secret.key = data.key
        if data.category is not None:
            secret.category = data.category
        if data.profile is not None:
            secret.profile = data.profile
        
        # Re-encrypt if value is changed
        if data.value is not None:
            secret.encrypted_value = self.encryption_service.encrypt(data.value)
        
        # Update timestamp
        secret.updated_at = datetime.now(timezone.utc)
        
        session.add(secret)
        
        # Log audit entry
        await self._log_audit(session, user_id, AuditAction.UPDATE, secret_id, ip_address)
        
        await session.commit()
        await session.refresh(secret)
        
        logger.debug(f"Updated secret '{secret.name}' (id={secret.id}) for user {user_id}")
        
        return self._to_secret_read(secret)

    async def delete_secret(
        self,
        session: AsyncSession,
        user_id: UUID,
        secret_id: UUID,
        ip_address: str = "unknown",
    ) -> None:
        """Delete a secret.
        
        This method deletes a secret from the database.
        
        Args:
            session: SQLAlchemy async session for database access.
            user_id: The ID of the user deleting the secret.
            secret_id: The ID of the secret to delete.
            ip_address: The client IP address for audit logging.
        
        Raises:
            SecretNotFoundError: If the secret does not exist or does not
                belong to the user.
        
        Validates: Requirements 3.3
        
        Example:
            >>> await service.delete_secret(session, user_id, secret_id)
        """
        secret = await self._get_secret_by_id(session, user_id, secret_id)
        secret_name = secret.name
        
        # Log audit entry before deletion
        await self._log_audit(session, user_id, AuditAction.DELETE, secret_id, ip_address)
        
        await session.delete(secret)
        await session.commit()
        
        logger.debug(f"Deleted secret '{secret_name}' (id={secret_id}) for user {user_id}")

    async def import_yaml(
        self,
        session: AsyncSession,
        user_id: UUID,
        yaml_content: str,
        ip_address: str = "unknown",
    ) -> "ImportResult":
        """Import secrets from YAML content.
        
        This method parses YAML content and imports credentials as secrets.
        If a credential with the same name and profile already exists, it
        will be updated (upsert behavior).
        
        Expected YAML format:
        ```yaml
        default:
          AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7EXAMPLE"
          AWS_SECRET_ACCESS_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
        production:
          AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7PROD"
        ```
        
        Args:
            session: SQLAlchemy async session for database access.
            user_id: The ID of the user importing the secrets.
            yaml_content: The YAML content to parse and import.
            ip_address: The client IP address for audit logging.
        
        Returns:
            ImportResult: Summary of imported, updated, and failed credentials.
        
        Raises:
            YAMLImportError: If the YAML structure is invalid.
        
        Validates: Requirements 6.1, 6.2, 6.3, 6.4
        
        Example:
            >>> yaml_content = '''
            ... default:
            ...   API_KEY: "secret123"
            ... '''
            >>> result = await service.import_yaml(session, user_id, yaml_content)
            >>> print(result.imported)  # 1
        """
        import yaml
        
        result = ImportResult()
        
        # Parse YAML content
        try:
            data = yaml.safe_load(yaml_content)
        except yaml.YAMLError as e:
            raise YAMLImportError(f"Invalid YAML format: {e}")
        
        if not isinstance(data, dict):
            raise YAMLImportError("YAML content must be a dictionary with profile sections")
        
        # Process each profile section
        for profile_name, credentials in data.items():
            # Validate profile name
            try:
                profile = SecretProfile(profile_name)
            except ValueError:
                result.failed += 1
                result.errors.append(f"Invalid profile name: {profile_name}")
                continue
            
            if not isinstance(credentials, dict):
                result.failed += 1
                result.errors.append(f"Profile '{profile_name}' must contain a dictionary of credentials")
                continue
            
            # Process each credential in the profile
            for key, value in credentials.items():
                if not isinstance(value, str):
                    result.failed += 1
                    result.errors.append(f"Value for '{key}' in profile '{profile_name}' must be a string")
                    continue
                
                try:
                    # Check if secret already exists
                    existing = await self._find_secret_by_name_and_profile(
                        session, user_id, key, profile
                    )
                    
                    if existing:
                        # Update existing secret
                        existing.encrypted_value = self.encryption_service.encrypt(value)
                        existing.updated_at = datetime.now(timezone.utc)
                        session.add(existing)
                        await self._log_audit(
                            session, user_id, AuditAction.UPDATE, existing.id, ip_address
                        )
                        result.updated += 1
                    else:
                        # Create new secret
                        secret_data = SecretCreate(
                            name=key,
                            key=key,
                            value=value,
                            category=SecretCategory.CUSTOM,
                            profile=profile,
                        )
                        await self.create_secret(session, user_id, secret_data, ip_address)
                        result.imported += 1
                except Exception as e:
                    result.failed += 1
                    result.errors.append(f"Failed to import '{key}' in profile '{profile_name}': {str(e)}")
        
        await session.commit()
        
        logger.debug(
            f"YAML import complete: imported={result.imported}, "
            f"updated={result.updated}, failed={result.failed}"
        )
        
        return result

    async def _find_secret_by_name_and_profile(
        self,
        session: AsyncSession,
        user_id: UUID,
        name: str,
        profile: SecretProfile,
    ) -> Optional[Secret]:
        """Find a secret by name and profile.
        
        Args:
            session: SQLAlchemy async session for database access.
            user_id: The ID of the user.
            name: The secret name to find.
            profile: The profile to search within.
        
        Returns:
            Secret or None: The secret if found, None otherwise.
        """
        statement = select(Secret).where(
            Secret.user_id == user_id,
            Secret.name == name,
            Secret.profile == profile,
        )
        
        result = await session.execute(statement)
        return result.scalar_one_or_none()

    async def decrypt_secret(
        self,
        session: AsyncSession,
        user_id: UUID,
        secret_id: UUID,
        is_admin: bool,
        ip_address: str = "unknown",
    ) -> "SecretDecrypted":
        """Decrypt a secret and return the plaintext value (admin only).
        
        This method decrypts a secret and returns the plaintext value.
        Only users with admin privileges can decrypt secrets.
        
        Args:
            session: SQLAlchemy async session for database access.
            user_id: The ID of the user requesting decryption.
            secret_id: The ID of the secret to decrypt.
            is_admin: Whether the user has admin privileges.
            ip_address: The client IP address for audit logging.
        
        Returns:
            SecretDecrypted: The secret with decrypted plaintext value.
        
        Raises:
            AdminRequiredError: If the user is not an admin.
            SecretNotFoundError: If the secret does not exist or does not
                belong to the user.
        
        Validates: Requirements 2.1, 2.2, 10.3, 10.4
        
        Example:
            >>> decrypted = await service.decrypt_secret(session, user_id, secret_id, is_admin=True)
            >>> print(decrypted.value)  # "actual-secret-value"
        """
        from kozmoai.services.database.models.secret import SecretDecrypted
        
        # Check admin privileges
        if not is_admin:
            raise AdminRequiredError("decrypting secrets")
        
        # Check rate limit
        self._check_rate_limit(user_id)
        
        secret = await self._get_secret_by_id(session, user_id, secret_id)
        
        # Capture all values before any commits (to avoid expired object issues)
        secret_name = secret.name
        secret_key = secret.key
        secret_category = secret.category
        secret_profile = secret.profile
        secret_created_at = secret.created_at
        encrypted_value = secret.encrypted_value
        
        # Decrypt the value
        decrypted_value = self.encryption_service.decrypt(encrypted_value)
        
        # Log audit entry for decrypt operation
        await self._log_audit(session, user_id, AuditAction.DECRYPT, secret_id, ip_address)
        await session.commit()
        
        logger.debug(f"Decrypted secret '{secret_name}' (id={secret_id}) for user {user_id}")
        
        return SecretDecrypted(
            id=secret_id,
            name=secret_name,
            key=secret_key,
            masked_value="********",
            category=secret_category,
            profile=secret_profile,
            created_at=secret_created_at,
            value=decrypted_value,
        )

    def _check_rate_limit(self, user_id: UUID) -> None:
        """Check if user has exceeded decrypt rate limit.
        
        This method implements a sliding window rate limiter for decrypt
        operations. It tracks the timestamps of recent decrypt requests
        and raises an exception if the limit is exceeded.
        
        Args:
            user_id: The ID of the user to check.
        
        Raises:
            RateLimitExceededError: If the user has exceeded the rate limit.
        
        Validates: Requirements 10.3, 10.4
        """
        now = time.time()
        window_start = now - self.rate_limit_window
        
        # Clean up old requests outside the window
        self._decrypt_requests[user_id] = [
            ts for ts in self._decrypt_requests[user_id] if ts > window_start
        ]
        
        # Check if limit exceeded
        if len(self._decrypt_requests[user_id]) >= self.rate_limit_max:
            # Calculate retry_after based on oldest request in window
            oldest = min(self._decrypt_requests[user_id])
            retry_after = int(oldest + self.rate_limit_window - now) + 1
            raise RateLimitExceededError(retry_after)
        
        # Record this request
        self._decrypt_requests[user_id].append(now)

    async def _get_secret_by_id(
        self,
        session: AsyncSession,
        user_id: UUID,
        secret_id: UUID,
    ) -> Secret:
        """Get a secret by ID, ensuring it belongs to the user.
        
        Args:
            session: SQLAlchemy async session for database access.
            user_id: The ID of the user.
            secret_id: The ID of the secret.
        
        Returns:
            Secret: The secret database model.
        
        Raises:
            SecretNotFoundError: If the secret does not exist or does not
                belong to the user.
        """
        statement = select(Secret).where(
            Secret.id == secret_id,
            Secret.user_id == user_id,
        )
        
        result = await session.execute(statement)
        secret = result.scalar_one_or_none()
        
        if secret is None:
            raise SecretNotFoundError(secret_id)
        
        return secret

    async def _validate_unique_name(
        self,
        session: AsyncSession,
        user_id: UUID,
        name: str,
        profile: SecretProfile,
        exclude_id: Optional[UUID] = None,
    ) -> None:
        """Validate that a secret name is unique within user scope and profile.
        
        Args:
            session: SQLAlchemy async session for database access.
            user_id: The ID of the user.
            name: The secret name to validate.
            profile: The profile to check within.
            exclude_id: Optional secret ID to exclude from the check (for updates).
        
        Raises:
            DuplicateSecretError: If a secret with the same name already exists.
        
        Validates: Requirements 3.1
        """
        statement = select(Secret).where(
            Secret.user_id == user_id,
            Secret.name == name,
            Secret.profile == profile,
        )
        
        if exclude_id is not None:
            statement = statement.where(Secret.id != exclude_id)
        
        result = await session.execute(statement)
        existing = result.scalar_one_or_none()
        
        if existing is not None:
            raise DuplicateSecretError(name, profile.value if isinstance(profile, SecretProfile) else profile)

    def _to_secret_read(self, secret: Secret) -> SecretRead:
        """Convert a Secret database model to a SecretRead response model.
        
        Args:
            secret: The Secret database model.
        
        Returns:
            SecretRead: The response model with masked value.
        """
        return SecretRead(
            id=secret.id,
            name=secret.name,
            key=secret.key,
            masked_value="********",
            category=secret.category,
            profile=secret.profile,
            created_at=secret.created_at,
        )

    async def _log_audit(
        self,
        session: AsyncSession,
        user_id: UUID,
        action_type: AuditAction,
        secret_id: UUID,
        ip_address: str = "unknown",
    ) -> None:
        """Log an audit entry for a secret operation.
        
        This method creates an audit log entry for tracking all secret
        operations for compliance and security monitoring.
        
        Args:
            session: SQLAlchemy async session for database access.
            user_id: The ID of the user performing the action.
            action_type: The type of action (CREATE, UPDATE, DELETE, DECRYPT).
            secret_id: The ID of the affected secret.
            ip_address: The client IP address (default: "unknown").
        
        Validates: Requirements 2.5, 10.1, 10.2
        """
        audit_log = AuditLog(
            user_id=user_id,
            action_type=action_type,
            secret_id=secret_id,
            ip_address=ip_address,
        )
        
        session.add(audit_log)
        # Note: We don't commit here - the caller should commit as part of the transaction
        
        logger.debug(
            f"Audit log: user={user_id}, action={action_type.value}, secret={secret_id}"
        )


class ImportResult:
    """Result of a YAML import operation.
    
    This class holds the summary of a YAML import operation, including
    counts of imported, updated, and failed credentials.
    
    Attributes:
        imported: Number of new secrets created.
        updated: Number of existing secrets updated.
        failed: Number of credentials that failed to import.
        errors: List of error messages for failed imports.
    
    Validates: Requirements 6.6
    """
    
    def __init__(self) -> None:
        self.imported: int = 0
        self.updated: int = 0
        self.failed: int = 0
        self.errors: list[str] = []
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "imported": self.imported,
            "updated": self.updated,
            "failed": self.failed,
            "errors": self.errors,
        }


class YAMLImportError(Exception):
    """Exception raised when YAML import fails.
    
    This exception is raised when the YAML structure is invalid or
    cannot be parsed.
    
    Validates: Requirements 6.2
    """

    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)
