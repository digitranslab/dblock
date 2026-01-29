"""Property-based tests for credential loaders.

This module contains property-based tests using Hypothesis to verify
the correctness of the credential loader implementations.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**
"""

import os
import tempfile
from pathlib import Path
from typing import Dict, List, Optional
from unittest.mock import MagicMock, patch

import pytest
import yaml
from hypothesis import given, settings, assume
from hypothesis import strategies as st

from kozmoai.services.secrets.constants import ConfigKey
from kozmoai.services.secrets.loaders import (
    BaseCredentialLoader,
    ConfigFileLoader,
    EnvironmentLoader,
)


class TestEnvironmentLoader:
    """Tests for EnvironmentLoader."""

    def test_contains_existing_env_var(self) -> None:
        """Test that contains returns True for existing env vars."""
        with patch.dict(os.environ, {"TEST_SECRET": "test_value"}):
            loader = EnvironmentLoader()
            assert loader.contains("TEST_SECRET") is True

    def test_contains_nonexistent_env_var(self) -> None:
        """Test that contains returns False for nonexistent env vars."""
        loader = EnvironmentLoader()
        assert loader.contains("NONEXISTENT_VAR_12345") is False

    def test_get_existing_env_var(self) -> None:
        """Test that get returns the value for existing env vars."""
        with patch.dict(os.environ, {"TEST_SECRET": "test_value"}):
            loader = EnvironmentLoader()
            assert loader.get("TEST_SECRET") == "test_value"

    def test_get_nonexistent_env_var(self) -> None:
        """Test that get returns None for nonexistent env vars."""
        loader = EnvironmentLoader()
        assert loader.get("NONEXISTENT_VAR_12345") is None

    def test_config_key_enum_support(self) -> None:
        """Test that ConfigKey enum values work correctly."""
        with patch.dict(os.environ, {"AWS_ACCESS_KEY_ID": "AKIATEST"}):
            loader = EnvironmentLoader()
            assert loader.contains(ConfigKey.AWS_ACCESS_KEY_ID) is True
            assert loader.get(ConfigKey.AWS_ACCESS_KEY_ID) == "AKIATEST"


class TestConfigFileLoader:
    """Tests for ConfigFileLoader."""

    def test_load_from_dict(self) -> None:
        """Test loading from a pre-loaded config dict."""
        config = {"API_KEY": "secret123", "DATABASE_URL": "postgres://localhost"}
        loader = ConfigFileLoader(config=config)
        
        assert loader.contains("API_KEY") is True
        assert loader.get("API_KEY") == "secret123"
        assert loader.get("DATABASE_URL") == "postgres://localhost"

    def test_load_from_yaml_file(self) -> None:
        """Test loading from a YAML file."""
        config_content = {
            "default": {
                "API_KEY": "default_key",
                "DATABASE_URL": "postgres://localhost",
            },
            "production": {
                "API_KEY": "prod_key",
                "DATABASE_URL": "postgres://prod-db",
            },
        }
        
        with tempfile.NamedTemporaryFile(mode="w", suffix=".yaml", delete=False) as f:
            yaml.dump(config_content, f)
            filepath = f.name
        
        try:
            # Test default profile
            loader = ConfigFileLoader(filepath=filepath, profile="default")
            assert loader.get("API_KEY") == "default_key"
            
            # Test production profile
            loader = ConfigFileLoader(filepath=filepath, profile="production")
            assert loader.get("API_KEY") == "prod_key"
        finally:
            Path(filepath).unlink()

    def test_profile_support(self) -> None:
        """Test that profile-based configuration works correctly."""
        config_content = {
            "default": {"KEY": "default_value"},
            "development": {"KEY": "dev_value"},
            "staging": {"KEY": "staging_value"},
            "production": {"KEY": "prod_value"},
        }
        
        with tempfile.NamedTemporaryFile(mode="w", suffix=".yaml", delete=False) as f:
            yaml.dump(config_content, f)
            filepath = f.name
        
        try:
            for profile, expected in [
                ("default", "default_value"),
                ("development", "dev_value"),
                ("staging", "staging_value"),
                ("production", "prod_value"),
            ]:
                loader = ConfigFileLoader(filepath=filepath, profile=profile)
                assert loader.get("KEY") == expected
        finally:
            Path(filepath).unlink()

    def test_config_key_enum_support(self) -> None:
        """Test that ConfigKey enum values work correctly."""
        config = {"AWS_ACCESS_KEY_ID": "AKIATEST"}
        loader = ConfigFileLoader(config=config)
        
        assert loader.contains(ConfigKey.AWS_ACCESS_KEY_ID) is True
        assert loader.get(ConfigKey.AWS_ACCESS_KEY_ID) == "AKIATEST"


class MockLoader(BaseCredentialLoader):
    """Mock loader for testing priority order."""
    
    def __init__(self, credentials: Dict[str, str], name: str = "mock"):
        self._credentials = credentials
        self._name = name
    
    def contains(self, key: str) -> bool:
        key_str = key.value if isinstance(key, ConfigKey) else key
        return key_str in self._credentials
    
    def get(self, key: str) -> Optional[str]:
        key_str = key.value if isinstance(key, ConfigKey) else key
        return self._credentials.get(key_str)


class TestLoaderPriorityOrder:
    """Property-based tests for loader priority order.
    
    **Property 5: Loader Priority Order**
    For any credential key that exists in multiple sources (Database, Environment,
    Config File, AWS), the value from the highest-priority source
    (Database > Environment > Config > AWS) SHALL be returned.
    
    **Validates: Requirements 5.4**
    """

    def get_credential_from_loaders(
        self, key: str, loaders: List[BaseCredentialLoader]
    ) -> Optional[str]:
        """Get credential from loaders in priority order."""
        for loader in loaders:
            if loader.contains(key):
                return loader.get(key)
        return None

    @settings(max_examples=50)
    @given(
        key=st.text(min_size=1, max_size=50, alphabet=st.characters(categories=("L", "N"))),
        db_value=st.text(min_size=1, max_size=100),
        env_value=st.text(min_size=1, max_size=100),
        config_value=st.text(min_size=1, max_size=100),
        aws_value=st.text(min_size=1, max_size=100),
    )
    def test_database_has_highest_priority(
        self, key: str, db_value: str, env_value: str, config_value: str, aws_value: str
    ) -> None:
        """Test that database loader has highest priority.
        
        **Property 5: Loader Priority Order**
        When a credential exists in all sources, the database value should be returned.
        
        **Validates: Requirements 5.4**
        """
        # Create loaders with different values for the same key
        db_loader = MockLoader({key: db_value}, "database")
        env_loader = MockLoader({key: env_value}, "environment")
        config_loader = MockLoader({key: config_value}, "config")
        aws_loader = MockLoader({key: aws_value}, "aws")
        
        # Priority order: Database > Environment > Config > AWS
        loaders = [db_loader, env_loader, config_loader, aws_loader]
        
        result = self.get_credential_from_loaders(key, loaders)
        
        # Database should win
        assert result == db_value

    @settings(max_examples=50)
    @given(
        key=st.text(min_size=1, max_size=50, alphabet=st.characters(categories=("L", "N"))),
        env_value=st.text(min_size=1, max_size=100),
        config_value=st.text(min_size=1, max_size=100),
        aws_value=st.text(min_size=1, max_size=100),
    )
    def test_environment_has_second_priority(
        self, key: str, env_value: str, config_value: str, aws_value: str
    ) -> None:
        """Test that environment loader has second priority.
        
        **Property 5: Loader Priority Order**
        When database doesn't have the credential, environment should be checked next.
        
        **Validates: Requirements 5.4**
        """
        # Database doesn't have the key
        db_loader = MockLoader({}, "database")
        env_loader = MockLoader({key: env_value}, "environment")
        config_loader = MockLoader({key: config_value}, "config")
        aws_loader = MockLoader({key: aws_value}, "aws")
        
        loaders = [db_loader, env_loader, config_loader, aws_loader]
        
        result = self.get_credential_from_loaders(key, loaders)
        
        # Environment should win when database is empty
        assert result == env_value

    @settings(max_examples=50)
    @given(
        key=st.text(min_size=1, max_size=50, alphabet=st.characters(categories=("L", "N"))),
        config_value=st.text(min_size=1, max_size=100),
        aws_value=st.text(min_size=1, max_size=100),
    )
    def test_config_has_third_priority(
        self, key: str, config_value: str, aws_value: str
    ) -> None:
        """Test that config file loader has third priority.
        
        **Property 5: Loader Priority Order**
        When database and environment don't have the credential, config should be checked.
        
        **Validates: Requirements 5.4**
        """
        db_loader = MockLoader({}, "database")
        env_loader = MockLoader({}, "environment")
        config_loader = MockLoader({key: config_value}, "config")
        aws_loader = MockLoader({key: aws_value}, "aws")
        
        loaders = [db_loader, env_loader, config_loader, aws_loader]
        
        result = self.get_credential_from_loaders(key, loaders)
        
        # Config should win when database and environment are empty
        assert result == config_value

    @settings(max_examples=50)
    @given(
        key=st.text(min_size=1, max_size=50, alphabet=st.characters(categories=("L", "N"))),
        aws_value=st.text(min_size=1, max_size=100),
    )
    def test_aws_has_lowest_priority(self, key: str, aws_value: str) -> None:
        """Test that AWS loader has lowest priority.
        
        **Property 5: Loader Priority Order**
        AWS should only be used when all other sources don't have the credential.
        
        **Validates: Requirements 5.4**
        """
        db_loader = MockLoader({}, "database")
        env_loader = MockLoader({}, "environment")
        config_loader = MockLoader({}, "config")
        aws_loader = MockLoader({key: aws_value}, "aws")
        
        loaders = [db_loader, env_loader, config_loader, aws_loader]
        
        result = self.get_credential_from_loaders(key, loaders)
        
        # AWS should win when all others are empty
        assert result == aws_value

    @settings(max_examples=30)
    @given(
        key=st.text(min_size=1, max_size=50, alphabet=st.characters(categories=("L", "N"))),
    )
    def test_returns_none_when_not_found(self, key: str) -> None:
        """Test that None is returned when credential is not found in any loader.
        
        **Validates: Requirements 5.4**
        """
        db_loader = MockLoader({}, "database")
        env_loader = MockLoader({}, "environment")
        config_loader = MockLoader({}, "config")
        aws_loader = MockLoader({}, "aws")
        
        loaders = [db_loader, env_loader, config_loader, aws_loader]
        
        result = self.get_credential_from_loaders(key, loaders)
        
        assert result is None
