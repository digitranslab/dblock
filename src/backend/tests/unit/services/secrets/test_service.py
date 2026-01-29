"""Property-based tests for the SecretsService.

This module contains property-based tests using Hypothesis to verify
the correctness of the secrets service implementation.

**Validates: Requirements 1.3, 2.2, 2.5, 3.1, 3.3, 3.6, 4.1, 10.1, 10.2, 10.3, 10.4**
"""

import asyncio
from datetime import datetime, timezone
from typing import AsyncGenerator
from uuid import UUID, uuid4

import pytest
import pytest_asyncio
from hypothesis import given, settings, HealthCheck
from hypothesis import strategies as st
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from kozmoai.services.secrets.constants import AuditAction, SecretCategory, SecretProfile
from kozmoai.services.secrets.encryption import EncryptionService
from kozmoai.services.secrets.service import (
    AdminRequiredError,
    DuplicateSecretError,
    RateLimitExceededError,
    SecretsService,
)
from kozmoai.services.database.models.secret import (
    Secret,
    SecretCreate,
    SecretRead,
)


# Test constants
VALID_ENCRYPTION_KEY = "this-is-a-valid-encryption-key-32"


def get_encryption_service() -> EncryptionService:
    """Create an EncryptionService with a valid key (>= 32 chars)."""
    return EncryptionService(VALID_ENCRYPTION_KEY)


# Hypothesis strategies for generating test data
secret_name_strategy = st.text(
    alphabet=st.characters(categories=("L", "N"), whitelist_characters="-_"),
    min_size=1,
    max_size=50,
).filter(lambda x: x.strip() != "")

secret_key_strategy = st.text(
    alphabet=st.characters(categories=("Lu", "N"), whitelist_characters="_"),
    min_size=1,
    max_size=50,
).filter(lambda x: x.strip() != "")

secret_value_strategy = st.text(min_size=1, max_size=200)

category_strategy = st.sampled_from(list(SecretCategory))
profile_strategy = st.sampled_from(list(SecretProfile))


@pytest.fixture(scope="module")
def event_loop():
    """Create an event loop for the test module."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def async_session() -> AsyncGenerator[AsyncSession, None]:
    """Create an async session with an in-memory SQLite database."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    async with AsyncSession(engine) as session:
        yield session
    
    await engine.dispose()


@pytest.fixture
def encryption_service() -> EncryptionService:
    """Create an EncryptionService with a valid key."""
    return get_encryption_service()


@pytest.fixture
def secrets_service(encryption_service: EncryptionService) -> SecretsService:
    """Create a SecretsService instance."""
    return SecretsService(encryption_service)


class TestMaskedValuesOnRetrieval:
    """Property-based tests for masked values on retrieval.
    
    **Property 2: Masked Values on Retrieval**
    For any secret retrieved via the list or get endpoints, the returned value
    SHALL be masked (e.g., "********") and SHALL NOT contain the plaintext
    or encrypted value.
    
    **Validates: Requirements 1.3, 4.1**
    """

    @pytest.mark.asyncio
    @settings(max_examples=20, suppress_health_check=[HealthCheck.function_scoped_fixture])
    @given(
        name=secret_name_strategy,
        key=secret_key_strategy,
        value=secret_value_strategy,
        category=category_strategy,
        profile=profile_strategy,
    )
    async def test_created_secret_has_masked_value(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
        name: str,
        key: str,
        value: str,
        category: SecretCategory,
        profile: SecretProfile,
    ) -> None:
        """Test that created secrets return masked values.
        
        **Property 2: Masked Values on Retrieval**
        For any secret retrieved via the list or get endpoints, the returned value
        SHALL be masked (e.g., "********") and SHALL NOT contain the plaintext
        or encrypted value.
        
        **Validates: Requirements 1.3, 4.1**
        """
        user_id = uuid4()
        
        # Create a secret
        secret_data = SecretCreate(
            name=name,
            key=key,
            value=value,
            category=category,
            profile=profile,
        )
        
        result = await secrets_service.create_secret(async_session, user_id, secret_data)
        
        # Verify the result is a SecretRead with masked value
        assert isinstance(result, SecretRead)
        assert result.masked_value == "********"
        
        # Verify the masked_value is exactly "********" (not the actual value)
        # Note: We can't check "value not in masked_value" because if value is "*"
        # it would be contained in "********"
        assert result.masked_value != value or value == "********"
        
        # Clean up - rollback to avoid unique constraint issues in next iteration
        await async_session.rollback()

    @pytest.mark.asyncio
    async def test_get_secret_returns_masked_value(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that get_secret returns masked value.
        
        **Validates: Requirements 1.3, 4.1**
        """
        user_id = uuid4()
        plaintext_value = "super-secret-api-key-12345"
        
        # Create a secret
        secret_data = SecretCreate(
            name="Test Secret",
            key="TEST_KEY",
            value=plaintext_value,
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        
        created = await secrets_service.create_secret(async_session, user_id, secret_data)
        
        # Get the secret
        result = await secrets_service.get_secret(async_session, user_id, created.id)
        
        # Verify masked value
        assert result.masked_value == "********"
        assert plaintext_value not in str(result.masked_value)

    @pytest.mark.asyncio
    async def test_list_secrets_returns_masked_values(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that list_secrets returns masked values for all secrets.
        
        **Validates: Requirements 1.3, 4.1**
        """
        user_id = uuid4()
        plaintext_values = ["secret1", "secret2", "secret3"]
        
        # Create multiple secrets
        for i, value in enumerate(plaintext_values):
            secret_data = SecretCreate(
                name=f"Secret {i}",
                key=f"KEY_{i}",
                value=value,
                category=SecretCategory.CUSTOM,
                profile=SecretProfile.DEFAULT,
            )
            await secrets_service.create_secret(async_session, user_id, secret_data)
        
        # List all secrets
        results = await secrets_service.list_secrets(async_session, user_id)
        
        # Verify all have masked values
        assert len(results) == 3
        for result in results:
            assert result.masked_value == "********"
            for plaintext in plaintext_values:
                assert plaintext not in str(result.masked_value)


class TestNonAdminRejection:
    """Property-based tests for non-admin rejection.
    
    **Property 3: Non-Admin Rejection**
    For any non-admin user attempting to decrypt a secret, the Secrets_Service
    SHALL raise an AdminRequiredError.
    
    **Validates: Requirements 2.2, 3.6**
    """

    @pytest.mark.asyncio
    async def test_non_admin_cannot_decrypt_secret(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that non-admin users cannot decrypt secrets.
        
        **Property 3: Non-Admin Rejection**
        For any non-admin user attempting to decrypt a secret, the Secrets_Service
        SHALL raise an AdminRequiredError.
        
        **Validates: Requirements 2.2, 3.6**
        """
        user_id = uuid4()
        
        # Create a secret
        secret_data = SecretCreate(
            name="Test Secret",
            key="TEST_KEY",
            value="secret-value",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        
        created = await secrets_service.create_secret(async_session, user_id, secret_data)
        
        # Attempt to decrypt as non-admin
        with pytest.raises(AdminRequiredError) as exc_info:
            await secrets_service.decrypt_secret(
                async_session, user_id, created.id, is_admin=False
            )
        
        assert "Admin privileges required" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_admin_can_decrypt_secret(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that admin users CAN decrypt secrets.
        
        **Validates: Requirements 2.1, 2.2**
        """
        user_id = uuid4()
        plaintext_value = "my-secret-value"
        
        # Create a secret
        secret_data = SecretCreate(
            name="Test Secret",
            key="TEST_KEY",
            value=plaintext_value,
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        
        created = await secrets_service.create_secret(async_session, user_id, secret_data)
        
        # Decrypt as admin
        decrypted = await secrets_service.decrypt_secret(
            async_session, user_id, created.id, is_admin=True
        )
        
        assert decrypted.value == plaintext_value


class TestUniqueNameValidation:
    """Property-based tests for unique name validation.
    
    **Property 10: Unique Name Validation**
    For any attempt to create a secret with a name that already exists for the
    same user and profile, the Secrets_Service SHALL reject the request with
    a DuplicateSecretError.
    
    **Validates: Requirements 3.1**
    """

    @pytest.mark.asyncio
    async def test_duplicate_name_same_profile_raises_error(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that duplicate names in the same profile raise DuplicateSecretError.
        
        **Property 10: Unique Name Validation**
        For any attempt to create a secret with a name that already exists for the
        same user and profile, the Secrets_Service SHALL reject the request with
        a DuplicateSecretError.
        
        **Validates: Requirements 3.1**
        """
        user_id = uuid4()
        secret_name = "My API Key"
        
        # Create first secret
        secret_data1 = SecretCreate(
            name=secret_name,
            key="API_KEY_1",
            value="value1",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        await secrets_service.create_secret(async_session, user_id, secret_data1)
        
        # Attempt to create second secret with same name and profile
        secret_data2 = SecretCreate(
            name=secret_name,
            key="API_KEY_2",
            value="value2",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        
        with pytest.raises(DuplicateSecretError) as exc_info:
            await secrets_service.create_secret(async_session, user_id, secret_data2)
        
        assert secret_name in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_same_name_different_profile_allowed(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that same name in different profiles is allowed.
        
        **Validates: Requirements 3.1**
        """
        user_id = uuid4()
        secret_name = "My API Key"
        
        # Create secret in DEFAULT profile
        secret_data1 = SecretCreate(
            name=secret_name,
            key="API_KEY_1",
            value="value1",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        await secrets_service.create_secret(async_session, user_id, secret_data1)
        
        # Create secret with same name in PRODUCTION profile - should succeed
        secret_data2 = SecretCreate(
            name=secret_name,
            key="API_KEY_2",
            value="value2",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.PRODUCTION,
        )
        result = await secrets_service.create_secret(async_session, user_id, secret_data2)
        
        assert result.name == secret_name
        assert result.profile == SecretProfile.PRODUCTION

    @pytest.mark.asyncio
    async def test_same_name_different_user_allowed(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that same name for different users is allowed.
        
        **Validates: Requirements 3.1**
        """
        user_id1 = uuid4()
        user_id2 = uuid4()
        secret_name = "My API Key"
        
        # Create secret for user 1
        secret_data1 = SecretCreate(
            name=secret_name,
            key="API_KEY",
            value="value1",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        await secrets_service.create_secret(async_session, user_id1, secret_data1)
        
        # Create secret with same name for user 2 - should succeed
        secret_data2 = SecretCreate(
            name=secret_name,
            key="API_KEY",
            value="value2",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        result = await secrets_service.create_secret(async_session, user_id2, secret_data2)
        
        assert result.name == secret_name



class TestAuditLoggingCompleteness:
    """Property-based tests for audit logging completeness.
    
    **Property 6: Audit Logging Completeness**
    For any create, update, delete, or decrypt operation on a secret, an audit
    log entry SHALL be created containing user_id, action_type, secret_id,
    timestamp, and ip_address.
    
    **Validates: Requirements 2.5, 3.3, 10.1, 10.2**
    """

    @pytest.mark.asyncio
    async def test_create_secret_creates_audit_log(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that creating a secret creates an audit log entry.
        
        **Property 6: Audit Logging Completeness**
        For any create operation on a secret, an audit log entry SHALL be created.
        
        **Validates: Requirements 2.5, 10.1, 10.2**
        """
        from sqlmodel import select
        from kozmoai.services.database.models.audit_log.model import AuditLog
        
        user_id = uuid4()
        ip_address = "192.168.1.100"
        
        # Create a secret
        secret_data = SecretCreate(
            name="Test Secret",
            key="TEST_KEY",
            value="secret-value",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        
        created = await secrets_service.create_secret(
            async_session, user_id, secret_data, ip_address=ip_address
        )
        
        # Query audit logs
        statement = select(AuditLog).where(
            AuditLog.secret_id == created.id,
            AuditLog.action_type == AuditAction.CREATE,
        )
        result = await async_session.execute(statement)
        audit_log = result.scalar_one_or_none()
        
        # Verify audit log exists with required fields
        assert audit_log is not None
        assert audit_log.user_id == user_id
        assert audit_log.action_type == AuditAction.CREATE
        assert audit_log.secret_id == created.id
        assert audit_log.ip_address == ip_address
        assert audit_log.timestamp is not None

    @pytest.mark.asyncio
    async def test_update_secret_creates_audit_log(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that updating a secret creates an audit log entry.
        
        **Validates: Requirements 2.5, 10.1, 10.2**
        """
        from sqlmodel import select
        from kozmoai.services.database.models.secret import SecretUpdate
        from kozmoai.services.database.models.audit_log.model import AuditLog
        
        user_id = uuid4()
        ip_address = "192.168.1.101"
        
        # Create a secret first
        secret_data = SecretCreate(
            name="Test Secret",
            key="TEST_KEY",
            value="secret-value",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        created = await secrets_service.create_secret(async_session, user_id, secret_data)
        
        # Update the secret
        update_data = SecretUpdate(value="new-secret-value")
        await secrets_service.update_secret(
            async_session, user_id, created.id, update_data, ip_address=ip_address
        )
        
        # Query audit logs for UPDATE action
        statement = select(AuditLog).where(
            AuditLog.secret_id == created.id,
            AuditLog.action_type == AuditAction.UPDATE,
        )
        result = await async_session.execute(statement)
        audit_log = result.scalar_one_or_none()
        
        # Verify audit log exists
        assert audit_log is not None
        assert audit_log.user_id == user_id
        assert audit_log.action_type == AuditAction.UPDATE
        assert audit_log.ip_address == ip_address

    @pytest.mark.asyncio
    async def test_delete_secret_creates_audit_log(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that deleting a secret creates an audit log entry.
        
        **Validates: Requirements 2.5, 3.3, 10.1, 10.2**
        """
        from sqlmodel import select
        from kozmoai.services.database.models.audit_log.model import AuditLog
        
        user_id = uuid4()
        ip_address = "192.168.1.102"
        
        # Create a secret first
        secret_data = SecretCreate(
            name="Test Secret",
            key="TEST_KEY",
            value="secret-value",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        created = await secrets_service.create_secret(async_session, user_id, secret_data)
        secret_id = created.id
        
        # Delete the secret
        await secrets_service.delete_secret(
            async_session, user_id, secret_id, ip_address=ip_address
        )
        
        # Query audit logs for DELETE action
        statement = select(AuditLog).where(
            AuditLog.secret_id == secret_id,
            AuditLog.action_type == AuditAction.DELETE,
        )
        result = await async_session.execute(statement)
        audit_log = result.scalar_one_or_none()
        
        # Verify audit log exists
        assert audit_log is not None
        assert audit_log.user_id == user_id
        assert audit_log.action_type == AuditAction.DELETE
        assert audit_log.ip_address == ip_address

    @pytest.mark.asyncio
    async def test_decrypt_secret_creates_audit_log(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that decrypting a secret creates an audit log entry.
        
        **Validates: Requirements 2.5, 10.1, 10.2**
        """
        from sqlmodel import select
        from kozmoai.services.database.models.audit_log.model import AuditLog
        
        user_id = uuid4()
        ip_address = "192.168.1.103"
        
        # Create a secret first
        secret_data = SecretCreate(
            name="Test Secret",
            key="TEST_KEY",
            value="secret-value",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        created = await secrets_service.create_secret(async_session, user_id, secret_data)
        
        # Decrypt the secret (as admin)
        await secrets_service.decrypt_secret(
            async_session, user_id, created.id, is_admin=True, ip_address=ip_address
        )
        
        # Query audit logs for DECRYPT action
        statement = select(AuditLog).where(
            AuditLog.secret_id == created.id,
            AuditLog.action_type == AuditAction.DECRYPT,
        )
        result = await async_session.execute(statement)
        audit_log = result.scalar_one_or_none()
        
        # Verify audit log exists
        assert audit_log is not None
        assert audit_log.user_id == user_id
        assert audit_log.action_type == AuditAction.DECRYPT
        assert audit_log.ip_address == ip_address


class TestRateLimitingOnDecrypt:
    """Property-based tests for rate limiting on decrypt.
    
    **Property 7: Rate Limiting on Decrypt**
    For any user making more than the configured max decrypt requests within
    the rate limit window, subsequent requests SHALL raise RateLimitExceededError.
    
    **Validates: Requirements 10.3, 10.4**
    """

    @pytest.mark.asyncio
    async def test_rate_limit_exceeded_raises_error(
        self,
        async_session: AsyncSession,
        encryption_service: EncryptionService,
    ) -> None:
        """Test that exceeding rate limit raises RateLimitExceededError.
        
        **Property 7: Rate Limiting on Decrypt**
        For any user making more than 10 decrypt requests within a 60-second
        window, subsequent requests SHALL raise RateLimitExceededError.
        
        **Validates: Requirements 10.3, 10.4**
        """
        # Create service with low rate limit for testing
        secrets_service = SecretsService(
            encryption_service,
            rate_limit_max=3,
            rate_limit_window=60,
        )
        
        user_id = uuid4()
        
        # Create a secret
        secret_data = SecretCreate(
            name="Test Secret",
            key="TEST_KEY",
            value="secret-value",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        created = await secrets_service.create_secret(async_session, user_id, secret_data)
        
        # Make 3 successful decrypt requests (at the limit)
        for _ in range(3):
            await secrets_service.decrypt_secret(
                async_session, user_id, created.id, is_admin=True
            )
        
        # 4th request should fail with rate limit error
        with pytest.raises(RateLimitExceededError) as exc_info:
            await secrets_service.decrypt_secret(
                async_session, user_id, created.id, is_admin=True
            )
        
        assert "Rate limit exceeded" in str(exc_info.value)
        assert exc_info.value.retry_after > 0

    @pytest.mark.asyncio
    async def test_rate_limit_per_user(
        self,
        async_session: AsyncSession,
        encryption_service: EncryptionService,
    ) -> None:
        """Test that rate limit is per-user, not global.
        
        **Validates: Requirements 10.3, 10.4**
        """
        # Create service with low rate limit for testing
        secrets_service = SecretsService(
            encryption_service,
            rate_limit_max=2,
            rate_limit_window=60,
        )
        
        user_id1 = uuid4()
        user_id2 = uuid4()
        
        # Create secrets for both users
        secret_data1 = SecretCreate(
            name="Test Secret 1",
            key="TEST_KEY_1",
            value="secret-value-1",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        created1 = await secrets_service.create_secret(async_session, user_id1, secret_data1)
        
        secret_data2 = SecretCreate(
            name="Test Secret 2",
            key="TEST_KEY_2",
            value="secret-value-2",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        created2 = await secrets_service.create_secret(async_session, user_id2, secret_data2)
        
        # User 1 makes 2 requests (at limit)
        for _ in range(2):
            await secrets_service.decrypt_secret(
                async_session, user_id1, created1.id, is_admin=True
            )
        
        # User 2 should still be able to decrypt (separate rate limit)
        result = await secrets_service.decrypt_secret(
            async_session, user_id2, created2.id, is_admin=True
        )
        assert result.value == "secret-value-2"
        
        # User 1's 3rd request should fail
        with pytest.raises(RateLimitExceededError):
            await secrets_service.decrypt_secret(
                async_session, user_id1, created1.id, is_admin=True
            )

    @pytest.mark.asyncio
    async def test_rate_limit_within_limit_succeeds(
        self,
        async_session: AsyncSession,
        encryption_service: EncryptionService,
    ) -> None:
        """Test that requests within rate limit succeed.
        
        **Validates: Requirements 10.3, 10.4**
        """
        # Create service with rate limit of 5
        secrets_service = SecretsService(
            encryption_service,
            rate_limit_max=5,
            rate_limit_window=60,
        )
        
        user_id = uuid4()
        
        # Create a secret
        secret_data = SecretCreate(
            name="Test Secret",
            key="TEST_KEY",
            value="secret-value",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        created = await secrets_service.create_secret(async_session, user_id, secret_data)
        
        # Make 5 requests (at the limit but not over)
        for i in range(5):
            result = await secrets_service.decrypt_secret(
                async_session, user_id, created.id, is_admin=True
            )
            assert result.value == "secret-value"



class TestYAMLImportUpsertBehavior:
    """Property-based tests for YAML import upsert behavior.
    
    **Property 9: YAML Import Upsert Behavior**
    For any YAML import containing a credential with the same name and profile
    as an existing secret, the existing secret SHALL be updated rather than
    creating a duplicate.
    
    **Validates: Requirements 6.4**
    """

    @pytest.mark.asyncio
    async def test_yaml_import_creates_new_secrets(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that YAML import creates new secrets.
        
        **Validates: Requirements 6.1, 6.3**
        """
        user_id = uuid4()
        
        yaml_content = """
default:
  API_KEY: "secret123"
  DB_PASSWORD: "dbpass456"
"""
        
        result = await secrets_service.import_yaml(async_session, user_id, yaml_content)
        
        assert result.imported == 2
        assert result.updated == 0
        assert result.failed == 0
        
        # Verify secrets were created
        secrets = await secrets_service.list_secrets(async_session, user_id)
        assert len(secrets) == 2
        
        names = {s.name for s in secrets}
        assert "API_KEY" in names
        assert "DB_PASSWORD" in names

    @pytest.mark.asyncio
    async def test_yaml_import_updates_existing_secrets(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that YAML import updates existing secrets (upsert behavior).
        
        **Property 9: YAML Import Upsert Behavior**
        For any YAML import containing a credential with the same name and profile
        as an existing secret, the existing secret SHALL be updated rather than
        creating a duplicate.
        
        **Validates: Requirements 6.4**
        """
        user_id = uuid4()
        
        # First, create a secret
        secret_data = SecretCreate(
            name="API_KEY",
            key="API_KEY",
            value="original_value",
            category=SecretCategory.CUSTOM,
            profile=SecretProfile.DEFAULT,
        )
        created = await secrets_service.create_secret(async_session, user_id, secret_data)
        original_id = created.id
        
        # Now import YAML with the same key
        yaml_content = """
default:
  API_KEY: "updated_value"
"""
        
        result = await secrets_service.import_yaml(async_session, user_id, yaml_content)
        
        # Should update, not create new
        assert result.imported == 0
        assert result.updated == 1
        assert result.failed == 0
        
        # Verify only one secret exists
        secrets = await secrets_service.list_secrets(async_session, user_id)
        assert len(secrets) == 1
        assert secrets[0].id == original_id
        
        # Verify the value was updated (decrypt to check)
        decrypted = await secrets_service.decrypt_secret(
            async_session, user_id, original_id, is_admin=True
        )
        assert decrypted.value == "updated_value"

    @pytest.mark.asyncio
    async def test_yaml_import_with_multiple_profiles(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that YAML import handles multiple profiles correctly.
        
        **Validates: Requirements 6.1, 6.2**
        """
        user_id = uuid4()
        
        yaml_content = """
default:
  API_KEY: "default_key"
production:
  API_KEY: "prod_key"
development:
  API_KEY: "dev_key"
"""
        
        result = await secrets_service.import_yaml(async_session, user_id, yaml_content)
        
        assert result.imported == 3
        assert result.updated == 0
        assert result.failed == 0
        
        # Verify secrets were created with correct profiles
        secrets = await secrets_service.list_secrets(async_session, user_id)
        assert len(secrets) == 3
        
        profiles = {s.profile for s in secrets}
        assert SecretProfile.DEFAULT in profiles
        assert SecretProfile.PRODUCTION in profiles
        assert SecretProfile.DEVELOPMENT in profiles

    @pytest.mark.asyncio
    async def test_yaml_import_invalid_yaml_raises_error(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that invalid YAML raises YAMLImportError.
        
        **Validates: Requirements 6.2**
        """
        from kozmoai.services.secrets.service import YAMLImportError
        
        user_id = uuid4()
        
        invalid_yaml = """
this is not valid yaml: [
  unclosed bracket
"""
        
        with pytest.raises(YAMLImportError) as exc_info:
            await secrets_service.import_yaml(async_session, user_id, invalid_yaml)
        
        assert "Invalid YAML format" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_yaml_import_invalid_profile_reports_error(
        self,
        async_session: AsyncSession,
        secrets_service: SecretsService,
    ) -> None:
        """Test that invalid profile names are reported as errors.
        
        **Validates: Requirements 6.2**
        """
        user_id = uuid4()
        
        yaml_content = """
invalid_profile:
  API_KEY: "value"
default:
  DB_KEY: "value2"
"""
        
        result = await secrets_service.import_yaml(async_session, user_id, yaml_content)
        
        # One should fail (invalid_profile), one should succeed (default)
        assert result.imported == 1
        assert result.failed == 1
        assert "Invalid profile name" in result.errors[0]
