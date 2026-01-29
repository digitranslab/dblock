"""Property-based tests for the EncryptionService.

This module contains property-based tests using Hypothesis to verify
the correctness of the encryption service implementation.

**Validates: Requirements 1.1, 1.2, 2.1, 10.5, 10.6**
"""

import pytest
from hypothesis import given, settings, HealthCheck
from hypothesis import strategies as st

from kozmoai.services.secrets.encryption import EncryptionService, ConfigurationError


# Create a module-level encryption service for property-based tests
# This is safe because EncryptionService is stateless after initialization
VALID_ENCRYPTION_KEY = "this-is-a-valid-encryption-key-32"


def get_encryption_service() -> EncryptionService:
    """Create an EncryptionService with a valid key (>= 32 chars)."""
    return EncryptionService(VALID_ENCRYPTION_KEY)


class TestEncryptionRoundTrip:
    """Property-based tests for encryption round-trip behavior.
    
    **Property 1: Encryption Round-Trip**
    For any plaintext secret value, encrypting it and then decrypting it
    SHALL return the original plaintext value.
    
    **Validates: Requirements 1.1, 1.2, 2.1**
    """

    @pytest.fixture
    def encryption_service(self) -> EncryptionService:
        """Create an EncryptionService with a valid key (>= 32 chars)."""
        return get_encryption_service()

    @settings(max_examples=100, suppress_health_check=[HealthCheck.function_scoped_fixture])
    @given(plaintext=st.text(min_size=0, max_size=1000))
    def test_encryption_round_trip_with_random_strings(
        self, encryption_service: EncryptionService, plaintext: str
    ) -> None:
        """Test that encrypting and decrypting returns the original plaintext.
        
        **Property 1: Encryption Round-Trip**
        For any plaintext secret value, encrypting it and then decrypting it
        SHALL return the original plaintext value.
        
        **Validates: Requirements 1.1, 1.2, 2.1**
        """
        # Encrypt the plaintext
        encrypted = encryption_service.encrypt(plaintext)
        
        # Decrypt the encrypted value
        decrypted = encryption_service.decrypt(encrypted)
        
        # Assert the decrypted value equals the original plaintext
        assert decrypted == plaintext, (
            f"Round-trip failed: original='{plaintext}', decrypted='{decrypted}'"
        )

    @settings(max_examples=50, suppress_health_check=[HealthCheck.function_scoped_fixture])
    @given(plaintext=st.text(alphabet=st.characters(categories=("L", "N", "P", "S")), min_size=1, max_size=500))
    def test_encryption_round_trip_with_printable_strings(
        self, encryption_service: EncryptionService, plaintext: str
    ) -> None:
        """Test round-trip with printable characters (letters, numbers, punctuation, symbols).
        
        **Validates: Requirements 1.1, 1.2, 2.1**
        """
        encrypted = encryption_service.encrypt(plaintext)
        decrypted = encryption_service.decrypt(encrypted)
        assert decrypted == plaintext

    @settings(max_examples=50, suppress_health_check=[HealthCheck.function_scoped_fixture])
    @given(plaintext=st.text(alphabet=st.characters(categories=("Cs", "Co", "Cn")), min_size=1, max_size=100))
    def test_encryption_round_trip_with_unicode_strings(
        self, encryption_service: EncryptionService, plaintext: str
    ) -> None:
        """Test round-trip with various Unicode characters including surrogates.
        
        **Validates: Requirements 1.1, 1.2, 2.1**
        """
        encrypted = encryption_service.encrypt(plaintext)
        decrypted = encryption_service.decrypt(encrypted)
        assert decrypted == plaintext

    @settings(max_examples=30, suppress_health_check=[HealthCheck.function_scoped_fixture])
    @given(plaintext=st.binary(min_size=0, max_size=500).map(lambda b: b.decode("utf-8", errors="replace")))
    def test_encryption_round_trip_with_binary_derived_strings(
        self, encryption_service: EncryptionService, plaintext: str
    ) -> None:
        """Test round-trip with strings derived from binary data.
        
        **Validates: Requirements 1.1, 1.2, 2.1**
        """
        encrypted = encryption_service.encrypt(plaintext)
        decrypted = encryption_service.decrypt(encrypted)
        assert decrypted == plaintext

    def test_encryption_round_trip_empty_string(self, encryption_service: EncryptionService) -> None:
        """Test round-trip with an empty string.
        
        **Validates: Requirements 1.1, 1.2, 2.1**
        """
        plaintext = ""
        encrypted = encryption_service.encrypt(plaintext)
        decrypted = encryption_service.decrypt(encrypted)
        assert decrypted == plaintext

    def test_encryption_round_trip_typical_api_key(self, encryption_service: EncryptionService) -> None:
        """Test round-trip with a typical API key format.
        
        **Validates: Requirements 1.1, 1.2, 2.1**
        """
        plaintext = "sk-1234567890abcdefghijklmnopqrstuvwxyz"
        encrypted = encryption_service.encrypt(plaintext)
        decrypted = encryption_service.decrypt(encrypted)
        assert decrypted == plaintext

    def test_encryption_round_trip_json_string(self, encryption_service: EncryptionService) -> None:
        """Test round-trip with a JSON string (common for credentials).
        
        **Validates: Requirements 1.1, 1.2, 2.1**
        """
        plaintext = '{"access_key": "AKIAIOSFODNN7EXAMPLE", "secret_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"}'
        encrypted = encryption_service.encrypt(plaintext)
        decrypted = encryption_service.decrypt(encrypted)
        assert decrypted == plaintext

    def test_encryption_round_trip_multiline_string(self, encryption_service: EncryptionService) -> None:
        """Test round-trip with a multiline string (e.g., SSH private key).
        
        **Validates: Requirements 1.1, 1.2, 2.1**
        """
        plaintext = """-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGy0AHB7MmE
-----END RSA PRIVATE KEY-----"""
        encrypted = encryption_service.encrypt(plaintext)
        decrypted = encryption_service.decrypt(encrypted)
        assert decrypted == plaintext

    def test_encryption_produces_different_output(self, encryption_service: EncryptionService) -> None:
        """Test that encryption produces output different from the plaintext.
        
        **Validates: Requirements 1.1, 1.2**
        """
        plaintext = "my-secret-password"
        encrypted = encryption_service.encrypt(plaintext)
        
        # Encrypted value should be different from plaintext
        assert encrypted != plaintext
        
        # Encrypted value should be a non-empty string
        assert len(encrypted) > 0
        assert isinstance(encrypted, str)

    @settings(max_examples=20)
    @given(key_suffix=st.text(min_size=0, max_size=50))
    def test_encryption_round_trip_with_different_valid_keys(self, key_suffix: str) -> None:
        """Test round-trip works with different valid encryption keys.
        
        **Validates: Requirements 1.1, 1.2, 2.1**
        """
        # Create a valid key (at least 32 chars)
        base_key = "this-is-a-valid-encryption-key-"
        valid_key = base_key + key_suffix[:32]  # Ensure we have at least 32 chars
        if len(valid_key) < 32:
            valid_key = valid_key.ljust(32, "x")
        
        service = EncryptionService(valid_key)
        plaintext = "test-secret-value"
        
        encrypted = service.encrypt(plaintext)
        decrypted = service.decrypt(encrypted)
        
        assert decrypted == plaintext


class TestEncryptionKeyValidation:
    """Property-based tests for encryption key validation.
    
    **Property 8: Encryption Key Validation**
    For any encryption key shorter than 32 characters, the EncryptionService
    initialization SHALL raise a ConfigurationError.
    
    **Validates: Requirements 10.5, 10.6**
    """

    @settings(max_examples=100)
    @given(short_key=st.text(min_size=0, max_size=31))
    def test_short_key_raises_configuration_error(self, short_key: str) -> None:
        """Test that encryption keys shorter than 32 characters raise ConfigurationError.
        
        **Property 8: Encryption Key Validation**
        For any encryption key shorter than 32 characters, the EncryptionService
        initialization SHALL raise a ConfigurationError.
        
        **Validates: Requirements 10.5, 10.6**
        """
        with pytest.raises(ConfigurationError):
            EncryptionService(short_key)

    @settings(max_examples=50)
    @given(short_key=st.text(alphabet=st.characters(categories=("L", "N", "P", "S")), min_size=0, max_size=31))
    def test_short_printable_key_raises_configuration_error(self, short_key: str) -> None:
        """Test that short printable keys raise ConfigurationError.
        
        **Validates: Requirements 10.5, 10.6**
        """
        with pytest.raises(ConfigurationError):
            EncryptionService(short_key)

    def test_empty_key_raises_configuration_error(self) -> None:
        """Test that an empty encryption key raises ConfigurationError.
        
        **Validates: Requirements 10.5, 10.6**
        """
        with pytest.raises(ConfigurationError):
            EncryptionService("")

    def test_key_with_31_characters_raises_configuration_error(self) -> None:
        """Test that a key with exactly 31 characters raises ConfigurationError.
        
        **Validates: Requirements 10.5, 10.6**
        """
        key_31_chars = "a" * 31
        assert len(key_31_chars) == 31
        with pytest.raises(ConfigurationError):
            EncryptionService(key_31_chars)

    def test_key_with_32_characters_does_not_raise(self) -> None:
        """Test that a key with exactly 32 characters does NOT raise ConfigurationError.
        
        This is a boundary test to ensure the validation is >= 32, not > 32.
        
        **Validates: Requirements 10.5, 10.6**
        """
        key_32_chars = "a" * 32
        assert len(key_32_chars) == 32
        # Should not raise - 32 chars is valid
        service = EncryptionService(key_32_chars)
        assert service is not None

    def test_key_with_33_characters_does_not_raise(self) -> None:
        """Test that a key with more than 32 characters does NOT raise ConfigurationError.
        
        **Validates: Requirements 10.5, 10.6**
        """
        key_33_chars = "a" * 33
        assert len(key_33_chars) == 33
        # Should not raise - 33 chars is valid
        service = EncryptionService(key_33_chars)
        assert service is not None

    def test_configuration_error_message_contains_key_length(self) -> None:
        """Test that the ConfigurationError message contains useful information.
        
        **Validates: Requirements 10.5, 10.6**
        """
        short_key = "short"
        with pytest.raises(ConfigurationError) as exc_info:
            EncryptionService(short_key)
        
        error_message = str(exc_info.value)
        # Error message should mention the minimum required length
        assert "32" in error_message
        # Error message should mention the actual key length
        assert str(len(short_key)) in error_message

    @settings(max_examples=30)
    @given(key_length=st.integers(min_value=0, max_value=31))
    def test_any_key_length_below_32_raises_configuration_error(self, key_length: int) -> None:
        """Test that any key length from 0 to 31 raises ConfigurationError.
        
        **Property 8: Encryption Key Validation**
        For any encryption key shorter than 32 characters, the EncryptionService
        initialization SHALL raise a ConfigurationError.
        
        **Validates: Requirements 10.5, 10.6**
        """
        short_key = "x" * key_length
        assert len(short_key) == key_length
        assert key_length < 32
        
        with pytest.raises(ConfigurationError):
            EncryptionService(short_key)
