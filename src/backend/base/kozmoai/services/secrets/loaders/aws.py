"""AWS Secrets Manager credential loader.

This module provides the AWSSecretLoader class for loading credentials
from AWS Secrets Manager, following the pattern from Mage AI's
AWSSecretLoader in archive/mage-ai-master/mage_ai/io/config.py.

AWS Secrets Manager is a secure way to store and retrieve credentials
in AWS environments, with support for automatic rotation and versioning.

Validates: Requirements 5.3
"""

import json
from typing import Any, Dict, Optional, Union

from kozmoai.services.secrets.constants import ConfigKey
from kozmoai.services.secrets.loaders.base import BaseCredentialLoader


class AWSSecretLoader(BaseCredentialLoader):
    """
    Credential loader that reads from AWS Secrets Manager.
    
    This loader provides access to credentials stored in AWS Secrets Manager.
    It supports retrieving secrets by their secret ID and optionally by
    version ID or version stage label.
    
    The loader caches retrieved secrets to minimize API calls to AWS.
    
    Attributes:
        client: boto3 Secrets Manager client.
        _cache: Cache of retrieved secrets.
    
    Validates: Requirements 5.3
    """

    def __init__(
        self,
        region_name: Optional[str] = None,
        aws_access_key_id: Optional[str] = None,
        aws_secret_access_key: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        """
        Initialize the AWSSecretLoader.
        
        Args:
            region_name: AWS region name. If not provided, uses default region.
            aws_access_key_id: AWS access key ID. If not provided, uses default credentials.
            aws_secret_access_key: AWS secret access key. If not provided, uses default credentials.
            **kwargs: Additional arguments passed to boto3 client.
        """
        try:
            import boto3
        except ImportError:
            raise ImportError(
                "boto3 is required for AWSSecretLoader. "
                "Install it with: pip install boto3"
            )
        
        client_kwargs: Dict[str, Any] = {}
        if region_name:
            client_kwargs["region_name"] = region_name
        if aws_access_key_id:
            client_kwargs["aws_access_key_id"] = aws_access_key_id
        if aws_secret_access_key:
            client_kwargs["aws_secret_access_key"] = aws_secret_access_key
        client_kwargs.update(kwargs)
        
        self.client = boto3.client("secretsmanager", **client_kwargs)
        self._cache: Dict[str, str] = {}

    def contains(self, key: Union[ConfigKey, str]) -> bool:
        """
        Check if a secret with the given key exists in AWS Secrets Manager.
        
        Args:
            key: The secret ID to check.
        
        Returns:
            True if the secret exists, False otherwise.
        """
        key_str = key.value if isinstance(key, ConfigKey) else key
        
        # Check cache first
        if key_str in self._cache:
            return True
        
        try:
            self.client.describe_secret(SecretId=key_str)
            return True
        except self.client.exceptions.ResourceNotFoundException:
            return False
        except Exception:
            return False

    def get(
        self,
        key: Union[ConfigKey, str],
        version_id: Optional[str] = None,
        version_stage_label: Optional[str] = None,
    ) -> Optional[str]:
        """
        Retrieve a secret value from AWS Secrets Manager.
        
        Args:
            key: The secret ID to retrieve.
            version_id: Optional version ID of the secret.
            version_stage_label: Optional version stage label (e.g., AWSCURRENT, AWSPREVIOUS).
        
        Returns:
            The secret value as a string if found, None otherwise.
            If the secret is a JSON object, returns the JSON string.
        """
        key_str = key.value if isinstance(key, ConfigKey) else key
        
        # Check cache first (only for default version)
        if version_id is None and version_stage_label is None:
            if key_str in self._cache:
                return self._cache[key_str]
        
        try:
            kwargs: Dict[str, Any] = {"SecretId": key_str}
            if version_id:
                kwargs["VersionId"] = version_id
            if version_stage_label:
                kwargs["VersionStage"] = version_stage_label
            
            response = self.client.get_secret_value(**kwargs)
            
            # Handle both string and binary secrets
            if "SecretString" in response:
                secret_value = response["SecretString"]
            elif "SecretBinary" in response:
                secret_value = response["SecretBinary"].decode("utf-8")
            else:
                return None
            
            # Cache the result (only for default version)
            if version_id is None and version_stage_label is None:
                self._cache[key_str] = secret_value
            
            return secret_value
            
        except self.client.exceptions.ResourceNotFoundException:
            return None
        except Exception:
            return None

    def get_json(
        self,
        key: Union[ConfigKey, str],
        version_id: Optional[str] = None,
        version_stage_label: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve a secret value as a JSON object from AWS Secrets Manager.
        
        Args:
            key: The secret ID to retrieve.
            version_id: Optional version ID of the secret.
            version_stage_label: Optional version stage label.
        
        Returns:
            The secret value as a dictionary if found and valid JSON, None otherwise.
        """
        secret_string = self.get(key, version_id, version_stage_label)
        if secret_string is None:
            return None
        
        try:
            return json.loads(secret_string)
        except json.JSONDecodeError:
            return None

    def clear_cache(self) -> None:
        """Clear the secret cache."""
        self._cache.clear()

    def __repr__(self) -> str:
        """Return a string representation of the loader."""
        return f"AWSSecretLoader(cached_secrets={len(self._cache)})"
