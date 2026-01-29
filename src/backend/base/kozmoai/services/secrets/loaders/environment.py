"""Environment variable credential loader.

This module provides the EnvironmentLoader class for loading credentials
from environment variables, following the pattern from Mage AI's
EnvironmentVariableLoader in archive/mage-ai-master/mage_ai/io/config.py.

Environment variables are a common way to configure applications,
especially in containerized environments and CI/CD pipelines.
"""

import os
from typing import Optional, Union

from kozmoai.services.secrets.constants import ConfigKey
from kozmoai.services.secrets.loaders.base import BaseCredentialLoader


class EnvironmentLoader(BaseCredentialLoader):
    """
    Credential loader that reads from environment variables.
    
    This loader provides access to credentials stored in the system's
    environment variables. It's particularly useful for:
    - Local development with .env files
    - Container deployments (Docker, Kubernetes)
    - CI/CD pipelines
    - Cloud platform configurations (AWS ECS, Lambda, etc.)
    
    The loader is read-only and simply wraps os.environ access with
    the BaseCredentialLoader interface.
    
    Example:
        >>> loader = EnvironmentLoader()
        >>> if loader.contains("AWS_ACCESS_KEY_ID"):
        ...     key = loader.get("AWS_ACCESS_KEY_ID")
        ...     print(f"Found AWS key: {key[:4]}...")
        
        # Using ConfigKey enum
        >>> from kozmoai.services.secrets.constants import ConfigKey
        >>> loader.contains(ConfigKey.AWS_ACCESS_KEY_ID)
        True
        
        # Using bracket notation
        >>> loader["AWS_SECRET_ACCESS_KEY"]
        'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
        
        # Using 'in' operator
        >>> "DATABASE_URL" in loader
        True
    
    Attributes:
        None - This loader is stateless and reads directly from os.environ.
    
    Note:
        Environment variables are case-sensitive on Unix-like systems
        but case-insensitive on Windows. For portability, always use
        uppercase variable names.
    """

    def contains(self, key: Union[ConfigKey, str]) -> bool:
        """
        Check if an environment variable with the given key exists.
        
        Args:
            key: The name of the environment variable to check.
                Can be a ConfigKey enum value or a string key name.
        
        Returns:
            True if the environment variable is defined (even if empty),
            False otherwise.
        
        Example:
            >>> import os
            >>> os.environ["MY_SECRET"] = "secret_value"
            >>> loader = EnvironmentLoader()
            >>> loader.contains("MY_SECRET")
            True
            >>> loader.contains("NONEXISTENT_VAR")
            False
            >>> loader.contains(ConfigKey.AWS_ACCESS_KEY_ID)
            True  # If AWS_ACCESS_KEY_ID is set
        """
        # Convert ConfigKey enum to string value if necessary
        key_str = key.value if isinstance(key, ConfigKey) else key
        return key_str in os.environ

    def get(self, key: Union[ConfigKey, str]) -> Optional[str]:
        """
        Retrieve the value of an environment variable.
        
        Args:
            key: The name of the environment variable to retrieve.
                Can be a ConfigKey enum value or a string key name.
        
        Returns:
            The value of the environment variable as a string if it exists,
            None if the environment variable is not defined.
        
        Example:
            >>> import os
            >>> os.environ["DATABASE_URL"] = "postgresql://localhost/mydb"
            >>> loader = EnvironmentLoader()
            >>> loader.get("DATABASE_URL")
            'postgresql://localhost/mydb'
            >>> loader.get("UNDEFINED_VAR")
            None
            >>> loader.get(ConfigKey.AWS_REGION)
            'us-east-1'  # If AWS_REGION is set to 'us-east-1'
        
        Note:
            This method uses os.getenv() which returns None for undefined
            variables. If you need to distinguish between undefined and
            empty variables, use contains() first.
        """
        # Convert ConfigKey enum to string value if necessary
        key_str = key.value if isinstance(key, ConfigKey) else key
        return os.getenv(key_str)
