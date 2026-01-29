"""Database credential loader.

This module provides the DatabaseLoader class for loading credentials
from the Secret database table, following the pattern from Mage AI's
io/config.py and the existing credential loaders.

The DatabaseLoader is the highest priority loader in the credential
resolution chain, checking the database first before falling back to
environment variables, config files, or AWS Secrets Manager.

Validates: Requirements 5.4
"""

from typing import Optional, Union
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from kozmoai.services.database.models.secret import Secret
from kozmoai.services.secrets.constants import ConfigKey
from kozmoai.services.secrets.encryption import EncryptionService
from kozmoai.services.secrets.loaders.base import BaseCredentialLoader


class DatabaseLoader(BaseCredentialLoader):
    """
    Credential loader that reads from the Secret database table.
    
    This loader provides access to credentials stored in the database,
    scoped to a specific user and profile. It is the highest priority
    loader in the credential resolution chain.
    
    Attributes:
        session (AsyncSession): SQLAlchemy async session for database access.
        user_id (UUID): The user ID to scope secrets to.
        profile (str): The profile to filter secrets by.
        encryption_service (EncryptionService): Service for decrypting secret values.
    
    Validates: Requirements 5.4
    """

    def __init__(
        self,
        session: AsyncSession,
        user_id: UUID,
        profile: str = "default",
        encryption_service: Optional[EncryptionService] = None,
    ) -> None:
        """
        Initialize the DatabaseLoader.
        
        Args:
            session: SQLAlchemy async session for database access.
            user_id: The user ID to scope secrets to.
            profile: The profile to filter secrets by. Defaults to "default".
            encryption_service: Service for decrypting secret values.
        """
        self.session = session
        self.user_id = user_id
        self.profile = profile
        self.encryption_service = encryption_service

    def contains(self, key: Union[ConfigKey, str]) -> bool:
        """
        Synchronous check if a credential exists (not supported for database).
        
        Raises:
            NotImplementedError: Always raised. Use contains_async() instead.
        """
        raise NotImplementedError(
            "DatabaseLoader requires async operations. Use contains_async() instead."
        )

    def get(self, key: Union[ConfigKey, str]) -> Optional[str]:
        """
        Synchronous retrieval of a credential (not supported for database).
        
        Raises:
            NotImplementedError: Always raised. Use get_async() instead.
        """
        raise NotImplementedError(
            "DatabaseLoader requires async operations. Use get_async() instead."
        )

    async def contains_async(self, key: Union[ConfigKey, str]) -> bool:
        """
        Check if a secret with the given key exists in the database.
        
        Args:
            key: The name of the credential to check.
        
        Returns:
            True if a secret with the key exists for the user and profile.
        """
        key_str = key.value if isinstance(key, ConfigKey) else key
        
        statement = select(Secret).where(
            Secret.key == key_str,
            Secret.user_id == self.user_id,
            Secret.profile == self.profile,
        )
        
        result = await self.session.execute(statement)
        secret = result.scalar_one_or_none()
        
        return secret is not None

    async def get_async(self, key: Union[ConfigKey, str]) -> Optional[str]:
        """
        Retrieve the decrypted credential value for the given key.
        
        Args:
            key: The name of the credential to retrieve.
        
        Returns:
            The decrypted credential value as a string if found, None otherwise.
        """
        key_str = key.value if isinstance(key, ConfigKey) else key
        
        statement = select(Secret).where(
            Secret.key == key_str,
            Secret.user_id == self.user_id,
            Secret.profile == self.profile,
        )
        
        result = await self.session.execute(statement)
        secret = result.scalar_one_or_none()
        
        if secret is None:
            return None
        
        if self.encryption_service is None:
            return None
        
        return self.encryption_service.decrypt(secret.encrypted_value)

    def __repr__(self) -> str:
        """Return a string representation of the loader."""
        return f"DatabaseLoader(user_id={self.user_id}, profile='{self.profile}')"
