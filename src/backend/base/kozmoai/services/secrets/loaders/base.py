"""Base credential loader abstract class.

This module defines the abstract base class for credential loaders,
following the pattern from Mage AI's io/config.py.

Credential loaders provide a unified interface for loading credentials
from various sources (database, environment variables, config files,
AWS Secrets Manager, etc.).
"""

from abc import ABC, abstractmethod
from typing import Optional, Union

from kozmoai.services.secrets.constants import ConfigKey


class BaseCredentialLoader(ABC):
    """
    Base credential loader class.
    
    A credential loader is a read-only storage of configuration settings
    and secrets. The source of the credentials is dependent on the specific
    loader implementation.
    
    This follows the pattern established in Mage AI's BaseConfigLoader,
    providing a consistent interface for credential retrieval across
    different storage backends.
    
    Implementations:
        - DatabaseLoader: Loads from the Secret database table
        - EnvironmentLoader: Loads from environment variables
        - ConfigFileLoader: Loads from YAML config files with profile support
        - AWSSecretLoader: Loads from AWS Secrets Manager
    """

    @abstractmethod
    def contains(self, key: Union[ConfigKey, str]) -> bool:
        """
        Check if a credential with the given key exists.
        
        Args:
            key: The name of the credential to check. Can be a ConfigKey
                enum value or a string key name.
        
        Returns:
            True if the credential exists in this loader, False otherwise.
        
        Example:
            >>> loader = EnvironmentLoader()
            >>> loader.contains("AWS_ACCESS_KEY_ID")
            True
            >>> loader.contains(ConfigKey.AWS_ACCESS_KEY_ID)
            True
        """
        pass

    @abstractmethod
    def get(self, key: Union[ConfigKey, str]) -> Optional[str]:
        """
        Retrieve the credential value for the given key.
        
        Args:
            key: The name of the credential to retrieve. Can be a ConfigKey
                enum value or a string key name.
        
        Returns:
            The credential value as a string if found, None otherwise.
        
        Example:
            >>> loader = EnvironmentLoader()
            >>> loader.get("AWS_ACCESS_KEY_ID")
            'AKIAIOSFODNN7EXAMPLE'
            >>> loader.get("NONEXISTENT_KEY")
            None
        """
        pass

    def __contains__(self, key: Union[ConfigKey, str]) -> bool:
        """
        Support for the 'in' operator.
        
        Args:
            key: The credential key to check.
        
        Returns:
            True if the credential exists, False otherwise.
        
        Example:
            >>> loader = EnvironmentLoader()
            >>> "AWS_ACCESS_KEY_ID" in loader
            True
        """
        return self.contains(key)

    def __getitem__(self, key: Union[ConfigKey, str]) -> Optional[str]:
        """
        Support for bracket notation access.
        
        Args:
            key: The credential key to retrieve.
        
        Returns:
            The credential value if found, None otherwise.
        
        Example:
            >>> loader = EnvironmentLoader()
            >>> loader["AWS_ACCESS_KEY_ID"]
            'AKIAIOSFODNN7EXAMPLE'
        """
        return self.get(key)
