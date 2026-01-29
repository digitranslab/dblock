"""Secrets Management service package.

This package provides secure storage, retrieval, and management of sensitive credentials
using Fernet symmetric encryption, with support for multiple credential sources.
"""

from kozmoai.services.secrets.constants import (
    AuditAction,
    ConfigKey,
    SecretCategory,
    SecretProfile,
)
from kozmoai.services.secrets.encryption import (
    ConfigurationError,
    DecryptionError,
    EncryptionService,
)
from kozmoai.services.secrets.service import (
    AdminRequiredError,
    DuplicateSecretError,
    ImportResult,
    RateLimitExceededError,
    SecretNotFoundError,
    SecretsService,
    YAMLImportError,
)

__all__ = [
    "SecretCategory",
    "SecretProfile",
    "AuditAction",
    "ConfigKey",
    "EncryptionService",
    "ConfigurationError",
    "DecryptionError",
    "SecretsService",
    "SecretNotFoundError",
    "DuplicateSecretError",
    "AdminRequiredError",
    "RateLimitExceededError",
    "ImportResult",
    "YAMLImportError",
]
