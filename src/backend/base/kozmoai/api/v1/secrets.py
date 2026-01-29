"""Secrets Management API endpoints.

This module provides RESTful API endpoints for managing secrets:
- GET /api/v1/secrets - List all secrets with masked values
- GET /api/v1/secrets/{id} - Get a single secret
- POST /api/v1/secrets - Create a new secret (admin only)
- PUT /api/v1/secrets/{id} - Update a secret (admin only)
- DELETE /api/v1/secrets/{id} - Delete a secret (admin only)
- POST /api/v1/secrets/{id}/decrypt - Decrypt a secret (admin only)
- GET /api/v1/secrets/profiles - List available profiles
- POST /api/v1/secrets/import - Import from YAML config (admin only)

Validates: Requirements 8.1-8.8
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, UploadFile, File
from pydantic import BaseModel

from kozmoai.api.utils import CurrentActiveUser, DbSession
from kozmoai.services.database.models.secret import (
    SecretCreate,
    SecretRead,
    SecretUpdate,
    SecretCategory,
    SecretProfile,
)
from kozmoai.services.deps import get_settings_service
from kozmoai.services.secrets import (
    AdminRequiredError,
    DuplicateSecretError,
    EncryptionService,
    RateLimitExceededError,
    SecretNotFoundError,
    SecretsService,
    YAMLImportError,
)

router = APIRouter(prefix="/secrets", tags=["Secrets"])


def get_secrets_service_instance() -> SecretsService:
    """Get the SecretsService instance.
    
    This function creates a SecretsService with the encryption key from settings.
    """
    settings_service = get_settings_service()
    encryption_key = settings_service.auth_settings.SECRET_KEY.get_secret_value()
    if not encryption_key or len(encryption_key) < 32:
        # Use a default key for development (should be configured in production)
        encryption_key = "kozmoai-default-encryption-key-32"
    encryption_service = EncryptionService(encryption_key)
    return SecretsService(encryption_service)


def get_client_ip(request: Request) -> str:
    """Get the client IP address from the request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class ImportResponse(BaseModel):
    """Response model for YAML import."""
    imported: int
    updated: int
    failed: int
    errors: list[str]


class ProfilesResponse(BaseModel):
    """Response model for profiles list."""
    profiles: list[str]


class DecryptedSecretResponse(BaseModel):
    """Response model for decrypted secret."""
    id: UUID
    name: str
    key: str
    value: str
    category: SecretCategory
    profile: SecretProfile


@router.get("/", response_model=list[SecretRead], status_code=200)
async def list_secrets(
    *,
    session: DbSession,
    current_user: CurrentActiveUser,
    category: Optional[SecretCategory] = None,
    profile: Optional[SecretProfile] = None,
    search: Optional[str] = None,
):
    """List all secrets with masked values.
    
    Validates: Requirements 8.1
    """
    secrets_service = get_secrets_service_instance()
    try:
        return await secrets_service.list_secrets(
            session, current_user.id, category=category, profile=profile, search=search
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/profiles", response_model=ProfilesResponse, status_code=200)
async def list_profiles():
    """List available profiles.
    
    Validates: Requirements 8.7
    """
    return ProfilesResponse(profiles=[p.value for p in SecretProfile])


@router.get("/{secret_id}", response_model=SecretRead, status_code=200)
async def get_secret(
    *,
    session: DbSession,
    secret_id: UUID,
    current_user: CurrentActiveUser,
):
    """Get a single secret with masked value.
    
    Validates: Requirements 8.2
    """
    secrets_service = get_secrets_service_instance()
    try:
        return await secrets_service.get_secret(session, current_user.id, secret_id)
    except SecretNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/", response_model=SecretRead, status_code=201)
async def create_secret(
    *,
    session: DbSession,
    request: Request,
    secret: SecretCreate,
    current_user: CurrentActiveUser,
):
    """Create a new secret (admin only).
    
    Validates: Requirements 8.3
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    secrets_service = get_secrets_service_instance()
    ip_address = get_client_ip(request)
    
    try:
        return await secrets_service.create_secret(
            session, current_user.id, secret, ip_address=ip_address
        )
    except DuplicateSecretError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.put("/{secret_id}", response_model=SecretRead, status_code=200)
async def update_secret(
    *,
    session: DbSession,
    request: Request,
    secret_id: UUID,
    secret: SecretUpdate,
    current_user: CurrentActiveUser,
):
    """Update a secret (admin only).
    
    Validates: Requirements 8.4
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    secrets_service = get_secrets_service_instance()
    ip_address = get_client_ip(request)
    
    try:
        return await secrets_service.update_secret(
            session, current_user.id, secret_id, secret, ip_address=ip_address
        )
    except SecretNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except DuplicateSecretError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.delete("/{secret_id}", status_code=204)
async def delete_secret(
    *,
    session: DbSession,
    request: Request,
    secret_id: UUID,
    current_user: CurrentActiveUser,
) -> None:
    """Delete a secret (admin only).
    
    Validates: Requirements 8.5
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    secrets_service = get_secrets_service_instance()
    ip_address = get_client_ip(request)
    
    try:
        await secrets_service.delete_secret(
            session, current_user.id, secret_id, ip_address=ip_address
        )
    except SecretNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e



@router.post("/{secret_id}/decrypt", response_model=DecryptedSecretResponse, status_code=200)
async def decrypt_secret(
    *,
    session: DbSession,
    request: Request,
    secret_id: UUID,
    current_user: CurrentActiveUser,
):
    """Decrypt a secret and return the plaintext value (admin only).
    
    Validates: Requirements 8.6
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    secrets_service = get_secrets_service_instance()
    ip_address = get_client_ip(request)
    
    try:
        decrypted = await secrets_service.decrypt_secret(
            session, current_user.id, secret_id, is_admin=True, ip_address=ip_address
        )
        return DecryptedSecretResponse(
            id=decrypted.id,
            name=decrypted.name,
            key=decrypted.key,
            value=decrypted.value,
            category=decrypted.category,
            profile=decrypted.profile,
        )
    except SecretNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except RateLimitExceededError as e:
        raise HTTPException(
            status_code=429,
            detail=str(e),
            headers={"Retry-After": str(e.retry_after)},
        ) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/import", response_model=ImportResponse, status_code=200)
async def import_yaml(
    *,
    session: DbSession,
    request: Request,
    file: UploadFile = File(...),
    current_user: CurrentActiveUser,
):
    """Import secrets from a YAML config file (admin only).
    
    Validates: Requirements 8.8
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    secrets_service = get_secrets_service_instance()
    ip_address = get_client_ip(request)
    
    try:
        # Read the file content
        content = await file.read()
        yaml_content = content.decode("utf-8")
        
        result = await secrets_service.import_yaml(
            session, current_user.id, yaml_content, ip_address=ip_address
        )
        
        return ImportResponse(
            imported=result.imported,
            updated=result.updated,
            failed=result.failed,
            errors=result.errors,
        )
    except YAMLImportError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
