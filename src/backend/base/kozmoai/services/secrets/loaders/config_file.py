"""YAML configuration file credential loader.

This module provides the ConfigFileLoader class for loading credentials
from YAML configuration files with profile support, following the pattern
from Mage AI's ConfigFileLoader in archive/mage-ai-master/mage_ai/io/config.py.

YAML config files allow organizing credentials by environment profiles
(default, development, staging, production) and provide a convenient way
to manage credentials during local development and testing.

Validates: Requirements 5.2, 5.5
"""

from pathlib import Path
from typing import Any, Dict, Optional, Union

import yaml

from kozmoai.services.secrets.constants import ConfigKey, SecretProfile
from kozmoai.services.secrets.loaders.base import BaseCredentialLoader


class ConfigFileLoader(BaseCredentialLoader):
    """
    Credential loader that reads from YAML configuration files.
    
    This loader provides access to credentials stored in YAML files with
    support for profile-based configuration. Profiles allow organizing
    credentials by environment (default, development, staging, production).
    
    The YAML file structure should follow this format:
    
    ```yaml
    default:
      AWS_ACCESS_KEY_ID: "your-access-key"
      AWS_SECRET_ACCESS_KEY: "your-secret-key"
      POSTGRES_HOST: "localhost"
      POSTGRES_PORT: "5432"
    
    development:
      AWS_ACCESS_KEY_ID: "dev-access-key"
      POSTGRES_HOST: "dev-db.example.com"
    
    staging:
      AWS_ACCESS_KEY_ID: "staging-access-key"
      POSTGRES_HOST: "staging-db.example.com"
    
    production:
      AWS_ACCESS_KEY_ID: "prod-access-key"
      POSTGRES_HOST: "prod-db.example.com"
    ```
    
    The loader can be initialized in two ways:
    1. With a filepath - loads and parses the YAML file
    2. With a pre-loaded config dict - uses the provided configuration
    
    Example:
        # Load from file with default profile
        >>> loader = ConfigFileLoader(filepath="config/secrets.yaml")
        >>> loader.get("AWS_ACCESS_KEY_ID")
        'your-access-key'
        
        # Load from file with specific profile
        >>> loader = ConfigFileLoader(
        ...     filepath="config/secrets.yaml",
        ...     profile="production"
        ... )
        >>> loader.get("POSTGRES_HOST")
        'prod-db.example.com'
        
        # Load from pre-loaded config dict
        >>> config = {"AWS_ACCESS_KEY_ID": "test-key"}
        >>> loader = ConfigFileLoader(config=config)
        >>> loader.get("AWS_ACCESS_KEY_ID")
        'test-key'
        
        # Using ConfigKey enum
        >>> from kozmoai.services.secrets.constants import ConfigKey
        >>> loader.get(ConfigKey.AWS_ACCESS_KEY_ID)
        'your-access-key'
        
        # Using bracket notation
        >>> loader["AWS_SECRET_ACCESS_KEY"]
        'your-secret-key'
        
        # Using 'in' operator
        >>> "POSTGRES_HOST" in loader
        True
    
    Attributes:
        filepath (Path | None): Path to the YAML configuration file.
        profile (str): The profile name to load credentials from.
        config (dict): The loaded configuration dictionary for the profile.
    
    Note:
        If both `filepath` and `config` are provided, `config` takes precedence
        and the file will not be loaded.
    
    Validates: Requirements 5.2, 5.5
    """

    def __init__(
        self,
        filepath: Optional[str] = None,
        profile: str = "default",
        config: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Initialize the ConfigFileLoader.
        
        Args:
            filepath: Path to the YAML configuration file. If not provided
                and config is None, the loader will have an empty configuration.
            profile: The profile name to load credentials from. Must be one of:
                'default', 'development', 'staging', 'production'.
                Defaults to 'default'.
            config: Pre-loaded configuration dictionary. If provided, this
                takes precedence over filepath and the file will not be loaded.
                This is useful for testing or when the config is already parsed.
        
        Raises:
            FileNotFoundError: If filepath is provided but the file doesn't exist.
            yaml.YAMLError: If the YAML file is malformed.
            KeyError: If the specified profile doesn't exist in the config file.
        
        Example:
            # Load from file
            >>> loader = ConfigFileLoader(filepath="secrets.yaml", profile="development")
            
            # Load from pre-loaded config
            >>> loader = ConfigFileLoader(config={"API_KEY": "secret123"})
        """
        self.filepath: Optional[Path] = None
        self.profile: str = profile
        self.config: Dict[str, Any] = {}
        
        if config is not None:
            # Use pre-loaded config directly
            self.config = config
        elif filepath is not None:
            # Load from YAML file
            self.filepath = Path(filepath)
            self._load_from_file()
    
    def _load_from_file(self) -> None:
        """
        Load configuration from the YAML file.
        
        This method reads the YAML file, parses it, and extracts the
        configuration for the specified profile.
        
        Raises:
            FileNotFoundError: If the file doesn't exist.
            yaml.YAMLError: If the YAML is malformed.
            KeyError: If the profile doesn't exist in the config.
        """
        if self.filepath is None:
            return
        
        if not self.filepath.exists():
            raise FileNotFoundError(
                f"Configuration file not found: {self.filepath}"
            )
        
        with self.filepath.open("r", encoding="utf-8") as f:
            full_config = yaml.safe_load(f)
        
        if full_config is None:
            # Empty YAML file
            self.config = {}
            return
        
        if not isinstance(full_config, dict):
            raise ValueError(
                f"Invalid YAML structure: expected a dictionary at root level, "
                f"got {type(full_config).__name__}"
            )
        
        # Check if the config has profile sections or is a flat structure
        if self.profile in full_config:
            profile_config = full_config[self.profile]
            if profile_config is None:
                self.config = {}
            elif isinstance(profile_config, dict):
                self.config = profile_config
            else:
                raise ValueError(
                    f"Invalid profile configuration: expected a dictionary for "
                    f"profile '{self.profile}', got {type(profile_config).__name__}"
                )
        else:
            # Check if any valid profile exists in the config
            valid_profiles = {p.value for p in SecretProfile}
            has_profile_structure = any(
                key in valid_profiles for key in full_config.keys()
            )
            
            if has_profile_structure:
                # Config has profile structure but requested profile doesn't exist
                raise KeyError(
                    f"Profile '{self.profile}' not found in configuration file. "
                    f"Available profiles: {list(full_config.keys())}"
                )
            else:
                # Flat config structure (no profiles), use as-is
                self.config = full_config

    def contains(self, key: Union[ConfigKey, str]) -> bool:
        """
        Check if a credential with the given key exists in the loaded config.
        
        Args:
            key: The name of the credential to check. Can be a ConfigKey
                enum value or a string key name.
        
        Returns:
            True if the credential exists in the loaded configuration,
            False otherwise.
        
        Example:
            >>> loader = ConfigFileLoader(config={"API_KEY": "secret"})
            >>> loader.contains("API_KEY")
            True
            >>> loader.contains("NONEXISTENT")
            False
            >>> loader.contains(ConfigKey.AWS_ACCESS_KEY_ID)
            False
        """
        # Convert ConfigKey enum to string value if necessary
        key_str = key.value if isinstance(key, ConfigKey) else key
        return key_str in self.config

    def get(self, key: Union[ConfigKey, str]) -> Optional[str]:
        """
        Retrieve the credential value for the given key from the loaded config.
        
        Args:
            key: The name of the credential to retrieve. Can be a ConfigKey
                enum value or a string key name.
        
        Returns:
            The credential value as a string if found, None otherwise.
            Non-string values are converted to strings.
        
        Example:
            >>> loader = ConfigFileLoader(config={
            ...     "API_KEY": "secret123",
            ...     "PORT": 5432
            ... })
            >>> loader.get("API_KEY")
            'secret123'
            >>> loader.get("PORT")
            '5432'
            >>> loader.get("NONEXISTENT")
            None
        """
        # Convert ConfigKey enum to string value if necessary
        key_str = key.value if isinstance(key, ConfigKey) else key
        value = self.config.get(key_str)
        
        if value is None:
            return None
        
        # Convert non-string values to strings for consistency
        if not isinstance(value, str):
            return str(value)
        
        return value

    def get_all_keys(self) -> list[str]:
        """
        Get all available credential keys in the loaded configuration.
        
        Returns:
            A list of all key names in the current profile's configuration.
        
        Example:
            >>> loader = ConfigFileLoader(config={
            ...     "API_KEY": "secret",
            ...     "DATABASE_URL": "postgres://..."
            ... })
            >>> loader.get_all_keys()
            ['API_KEY', 'DATABASE_URL']
        """
        return list(self.config.keys())

    @property
    def is_empty(self) -> bool:
        """
        Check if the configuration is empty.
        
        Returns:
            True if no credentials are loaded, False otherwise.
        """
        return len(self.config) == 0

    def __repr__(self) -> str:
        """Return a string representation of the loader."""
        if self.filepath:
            return (
                f"ConfigFileLoader(filepath='{self.filepath}', "
                f"profile='{self.profile}', keys={len(self.config)})"
            )
        return f"ConfigFileLoader(config=<dict>, keys={len(self.config)})"
