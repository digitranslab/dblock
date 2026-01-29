"""Credential loaders package.

This package provides various credential loader implementations for
loading secrets and configuration from different sources.

The loaders follow a priority order when resolving credentials:
1. DatabaseLoader - Loads from the Secret database table
2. EnvironmentLoader - Loads from environment variables
3. ConfigFileLoader - Loads from YAML config files
4. AWSSecretLoader - Loads from AWS Secrets Manager

Usage:
    from kozmoai.services.secrets.loaders import (
        BaseCredentialLoader,
        DatabaseLoader,
        EnvironmentLoader,
        ConfigFileLoader,
        AWSSecretLoader,
    )
"""

from kozmoai.services.secrets.loaders.base import BaseCredentialLoader
from kozmoai.services.secrets.loaders.config_file import ConfigFileLoader
from kozmoai.services.secrets.loaders.database import DatabaseLoader
from kozmoai.services.secrets.loaders.environment import EnvironmentLoader

# AWSSecretLoader is imported conditionally to avoid boto3 dependency
try:
    from kozmoai.services.secrets.loaders.aws import AWSSecretLoader
except ImportError:
    AWSSecretLoader = None  # type: ignore

__all__ = [
    "AWSSecretLoader",
    "BaseCredentialLoader",
    "ConfigFileLoader",
    "DatabaseLoader",
    "EnvironmentLoader",
]
