"""Encryption service for the Secrets Management system.

This module provides the EncryptionService class that handles encryption and decryption
of secret values using Fernet symmetric encryption from the cryptography library.

Validates: Requirements 1.1, 1.2, 10.5, 10.6
"""

import base64

from cryptography.fernet import Fernet, InvalidToken


class ConfigurationError(Exception):
    """Exception raised when there is a configuration error.
    
    This exception is raised when the encryption key is invalid,
    such as when it is shorter than the minimum required length.
    
    Validates: Requirements 10.5, 10.6
    """

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class DecryptionError(Exception):
    """Exception raised when decryption fails.
    
    This exception is raised when the encrypted value cannot be decrypted,
    such as when the value is corrupted or was encrypted with a different key.
    """

    def __init__(self, message: str = "Failed to decrypt secret"):
        self.message = message
        super().__init__(message)


# Minimum key length required for encryption
MINIMUM_KEY_LENGTH = 32


class EncryptionService:
    """Service for encrypting and decrypting secret values using Fernet symmetric encryption.
    
    This service provides secure encryption and decryption of sensitive data using
    the Fernet symmetric encryption algorithm from the cryptography library.
    Fernet guarantees that a message encrypted using it cannot be manipulated or
    read without the key.
    
    Attributes:
        _fernet: The Fernet cipher instance used for encryption/decryption.
    
    Validates: Requirements 1.1, 1.2, 10.5, 10.6
    
    Example:
        >>> service = EncryptionService("my-super-secret-key-that-is-32-chars")
        >>> encrypted = service.encrypt("my-api-key")
        >>> decrypted = service.decrypt(encrypted)
        >>> assert decrypted == "my-api-key"
    """

    def __init__(self, encryption_key: str) -> None:
        """Initialize the EncryptionService with an encryption key.
        
        The encryption key must be at least 32 characters long. The key is
        processed to create a valid Fernet key by encoding it and padding
        it to the required length for base64 URL-safe encoding.
        
        Args:
            encryption_key: The encryption key to use. Must be at least 32 characters.
        
        Raises:
            ConfigurationError: If the encryption key is shorter than 32 characters.
        
        Validates: Requirements 10.5, 10.6
        """
        if len(encryption_key) < MINIMUM_KEY_LENGTH:
            raise ConfigurationError(
                f"Encryption key must be at least {MINIMUM_KEY_LENGTH} characters long. "
                f"Provided key has {len(encryption_key)} characters."
            )
        
        # Create a valid Fernet key from the provided encryption key
        # Fernet requires a 32-byte key that is base64 URL-safe encoded
        self._fernet = Fernet(self._derive_fernet_key(encryption_key))

    def _derive_fernet_key(self, key: str) -> bytes:
        """Derive a valid Fernet key from the provided encryption key.
        
        Fernet requires a 32-byte key that is base64 URL-safe encoded (44 characters).
        This method takes the first 32 bytes of the key and encodes it properly.
        
        Args:
            key: The encryption key string.
        
        Returns:
            A valid base64 URL-safe encoded key for Fernet.
        """
        # Take the first 32 bytes of the key (or pad if needed, though we've validated length)
        key_bytes = key.encode("utf-8")[:32]
        # Pad to 32 bytes if needed (shouldn't happen due to validation, but defensive)
        if len(key_bytes) < 32:
            key_bytes = key_bytes.ljust(32, b"\0")
        # Fernet requires base64 URL-safe encoded 32-byte key
        return base64.urlsafe_b64encode(key_bytes)

    def encrypt(self, plaintext: str) -> str:
        """Encrypt a plaintext string and return the base64-encoded encrypted value.
        
        The plaintext is encoded to UTF-8 bytes, encrypted using Fernet,
        and the resulting encrypted bytes are decoded to a UTF-8 string
        (which is base64-encoded by Fernet).
        
        Args:
            plaintext: The plaintext string to encrypt.
        
        Returns:
            The base64-encoded encrypted value as a string.
        
        Validates: Requirements 1.1, 1.2
        
        Example:
            >>> service = EncryptionService("my-super-secret-key-that-is-32-chars")
            >>> encrypted = service.encrypt("my-secret-password")
            >>> # encrypted is a base64-encoded string
        """
        plaintext_bytes = plaintext.encode("utf-8")
        encrypted_bytes = self._fernet.encrypt(plaintext_bytes)
        return encrypted_bytes.decode("utf-8")

    def decrypt(self, encrypted_value: str) -> str:
        """Decrypt a base64-encoded encrypted value and return the plaintext.
        
        The encrypted value (base64-encoded string) is encoded to bytes,
        decrypted using Fernet, and the resulting plaintext bytes are
        decoded to a UTF-8 string.
        
        Args:
            encrypted_value: The base64-encoded encrypted value to decrypt.
        
        Returns:
            The decrypted plaintext string.
        
        Raises:
            DecryptionError: If the encrypted value cannot be decrypted
                (e.g., corrupted data or wrong key).
        
        Validates: Requirements 2.1
        
        Example:
            >>> service = EncryptionService("my-super-secret-key-that-is-32-chars")
            >>> encrypted = service.encrypt("my-secret-password")
            >>> decrypted = service.decrypt(encrypted)
            >>> assert decrypted == "my-secret-password"
        """
        try:
            encrypted_bytes = encrypted_value.encode("utf-8")
            decrypted_bytes = self._fernet.decrypt(encrypted_bytes)
            return decrypted_bytes.decode("utf-8")
        except InvalidToken as e:
            raise DecryptionError("Failed to decrypt secret: invalid token or corrupted data") from e
        except Exception as e:
            raise DecryptionError(f"Failed to decrypt secret: {e}") from e
