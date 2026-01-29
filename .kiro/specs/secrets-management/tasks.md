# Implementation Plan: Secrets Management

## Overview

This plan implements the Secrets Management feature in small, incremental steps. Each task builds on previous work and focuses on minimal code changes.

## Tasks

- [x] 1. Create database models and enumerations
  - [x] 1.1 Create constants file with SecretCategory, SecretProfile, AuditAction, ConfigKey enums
    - Create `src/backend/base/kozmoai/services/secrets/constants.py`
    - _Requirements: 1.5, 1.6, 5.6, 7.5_
  - [x] 1.2 Create Secret database model
    - Create `src/backend/base/kozmoai/services/database/models/secret/model.py`
    - Include SecretBase, Secret, SecretCreate, SecretRead, SecretDecrypted classes
    - _Requirements: 1.4_
  - [x] 1.3 Create AuditLog database model
    - Create `src/backend/base/kozmoai/services/database/models/audit_log/model.py`
    - _Requirements: 10.2_
  - [x] 1.4 Register models in database models __init__.py
    - Update `src/backend/base/kozmoai/services/database/models/__init__.py`
    - _Requirements: 1.4_

- [x] 2. Implement encryption service
  - [x] 2.1 Create EncryptionService class with Fernet encryption
    - Create `src/backend/base/kozmoai/services/secrets/encryption.py`
    - Implement encrypt, decrypt methods
    - Validate key length >= 32 chars on init
    - _Requirements: 1.1, 1.2, 10.5, 10.6_
  - [x] 2.2 Write property test for encryption round-trip
    - **Property 1: Encryption Round-Trip**
    - **Validates: Requirements 1.1, 1.2, 2.1**
  - [x] 2.3 Write property test for encryption key validation
    - **Property 8: Encryption Key Validation**
    - **Validates: Requirements 10.5, 10.6**

- [x] 3. Checkpoint - Ensure encryption tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement credential loaders
  - [x] 4.1 Create BaseCredentialLoader abstract class
    - Create `src/backend/base/kozmoai/services/secrets/loaders/base.py`
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 4.2 Create EnvironmentLoader
    - Create `src/backend/base/kozmoai/services/secrets/loaders/environment.py`
    - _Requirements: 5.1_
  - [x] 4.3 Create ConfigFileLoader with profile support
    - Create `src/backend/base/kozmoai/services/secrets/loaders/config_file.py`
    - _Requirements: 5.2, 5.5_
  - [x] 4.4 Create DatabaseLoader
    - Create `src/backend/base/kozmoai/services/secrets/loaders/database.py`
    - _Requirements: 5.4_
  - [x] 4.5 Create AWSSecretLoader
    - Create `src/backend/base/kozmoai/services/secrets/loaders/aws.py`
    - _Requirements: 5.3_
  - [x] 4.6 Write property test for loader priority order
    - **Property 5: Loader Priority Order**
    - **Validates: Requirements 5.4**

- [x] 5. Implement SecretsService
  - [x] 5.1 Create SecretsService with CRUD operations
    - Create `src/backend/base/kozmoai/services/secrets/service.py`
    - Implement create_secret, get_secret, list_secrets, update_secret, delete_secret
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 5.2 Add decrypt_secret method with admin check
    - _Requirements: 2.1, 2.2_
  - [x] 5.3 Add audit logging to all operations
    - _Requirements: 2.5, 10.1_
  - [x] 5.4 Add rate limiting to decrypt endpoint
    - _Requirements: 10.3, 10.4_
  - [x] 5.5 Write property test for masked values on retrieval
    - **Property 2: Masked Values on Retrieval**
    - **Validates: Requirements 1.3, 4.1**
  - [x] 5.6 Write property test for non-admin rejection
    - **Property 3: Non-Admin Rejection**
    - **Validates: Requirements 2.2, 3.6**
  - [x] 5.7 Write property test for audit logging completeness
    - **Property 6: Audit Logging Completeness**
    - **Validates: Requirements 2.5, 3.3, 10.1, 10.2**
  - [x] 5.8 Write property test for rate limiting
    - **Property 7: Rate Limiting on Decrypt**
    - **Validates: Requirements 10.3, 10.4**
  - [x] 5.9 Write property test for unique name validation
    - **Property 10: Unique Name Validation**
    - **Validates: Requirements 3.1**

- [x] 6. Checkpoint - Ensure service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement YAML import functionality
  - [x] 7.1 Add import_yaml method to SecretsService
    - Parse YAML, validate structure, encrypt values, upsert secrets
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 7.2 Write property test for YAML import upsert behavior
    - **Property 9: YAML Import Upsert Behavior**
    - **Validates: Requirements 6.4**

- [x] 8. Implement API endpoints
  - [x] 8.1 Create secrets router with list and get endpoints
    - Create `src/backend/base/kozmoai/api/v1/secrets.py`
    - GET /api/v1/secrets, GET /api/v1/secrets/{id}
    - _Requirements: 8.1, 8.2_
  - [x] 8.2 Add create, update, delete endpoints (admin only)
    - POST /api/v1/secrets, PUT /api/v1/secrets/{id}, DELETE /api/v1/secrets/{id}
    - _Requirements: 8.3, 8.4, 8.5_
  - [x] 8.3 Add decrypt endpoint (admin only)
    - POST /api/v1/secrets/{id}/decrypt
    - _Requirements: 8.6_
  - [x] 8.4 Add profiles and import endpoints
    - GET /api/v1/secrets/profiles, POST /api/v1/secrets/import
    - _Requirements: 8.7, 8.8_
  - [x] 8.5 Register secrets router in API router
    - Update `src/backend/base/kozmoai/api/v1/endpoints.py`
    - _Requirements: 8.1-8.8_
  - [x] 8.6 Write property test for filtering
    - **Property 4: Filtering Returns Matching Results**
    - **Validates: Requirements 4.3, 4.4, 4.5**

- [x] 9. Checkpoint - Ensure API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement frontend SecretsPage
  - [x] 10.1 Create SecretsPage component with secrets table
    - Create `src/frontend/src/pages/SecretsPage/index.tsx`
    - Display table with name, key, category, profile, masked_value, created_at, actions
    - _Requirements: 4.2_
  - [x] 10.2 Add search and filter functionality
    - Search by name/key, category dropdown, profile dropdown
    - _Requirements: 4.3, 4.4, 4.5_
  - [x] 10.3 Add create/edit modal form
    - Fields: name, key, value, category, profile
    - _Requirements: 3.4_
  - [x] 10.4 Add delete confirmation dialog
    - _Requirements: 3.5_
  - [x] 10.5 Add decrypt button with auto-hide (admin only)
    - Show decrypt button only for admins, auto-hide value after 30 seconds
    - _Requirements: 2.3, 2.4, 4.6_
  - [x] 10.6 Add YAML import button and summary display
    - _Requirements: 6.5, 6.6_

- [x] 11. Update left dock navigation
  - [x] 11.1 Add Secrets button to LeftDockComponent
    - Add Key icon button between Catalog and Settings
    - Navigate to /secrets route
    - Show active state when on /secrets
    - Add "Secrets" tooltip
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [x] 11.2 Add /secrets route to router configuration
    - _Requirements: 9.2_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks including property-based tests are required
- Each task references specific requirements for traceability
- Backend uses Python with FastAPI, frontend uses TypeScript with React
- Follow existing patterns from Variable model and API for consistency
