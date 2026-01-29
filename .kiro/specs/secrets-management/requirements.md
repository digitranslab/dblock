# Requirements Document

## Introduction

This document defines the requirements for a comprehensive Secrets Management system for KozmoAI. The system enables secure storage, retrieval, and management of sensitive credentials such as API keys, database passwords, SSH keys, and cloud provider credentials. It provides a dedicated UI for administrators to manage secrets, supports multiple credential sources (database, environment variables, YAML config files, AWS Secrets Manager), and integrates with the existing data integration components for secure database connections.

## Glossary

- **Secret**: A sensitive credential or configuration value that must be stored securely (e.g., API keys, passwords, connection strings)
- **Secrets_Service**: The backend service responsible for CRUD operations on secrets, encryption/decryption, and credential loading
- **Secrets_Page**: The frontend page component for viewing and managing secrets
- **Credential_Loader**: An abstraction for loading credentials from various sources (environment, config file, AWS Secrets Manager)
- **Config_Key**: An enumeration of supported credential key names for various services (AWS, Azure, GCP, databases, etc.)
- **Profile**: A named configuration set (e.g., default, development, staging, production) for organizing secrets by environment
- **Category**: A classification for secrets (AWS, Azure, GCP, Database, SSH, Custom)
- **Encryption_Service**: The component responsible for encrypting and decrypting secret values using Fernet symmetric encryption
- **SSH_Tunnel_Config**: Configuration for establishing SSH tunnels for secure database connections
- **Audit_Log**: A record of all access and modification events for secrets

## Requirements

### Requirement 1: Secret Storage and Encryption

**User Story:** As an admin, I want to securely store database credentials so that they are not exposed in flow configurations.

#### Acceptance Criteria

1. THE Secrets_Service SHALL store secrets in the database with encrypted values using Fernet symmetric encryption
2. WHEN a secret is created, THE Secrets_Service SHALL encrypt the value before persisting to the database
3. WHEN a secret is retrieved, THE Secrets_Service SHALL return the encrypted value by default (masked display)
4. THE Secret database model SHALL include fields: id, name, key, encrypted_value, category, profile, created_at, updated_at, user_id
5. THE Secrets_Service SHALL support categories: AWS, Azure, GCP, Database, SSH, Custom
6. THE Secrets_Service SHALL support profiles: default, development, staging, production

### Requirement 2: Secret Decryption (Admin Only)

**User Story:** As an admin, I want to view and decrypt secrets when needed for debugging.

#### Acceptance Criteria

1. WHEN an admin requests decryption of a secret, THE Secrets_Service SHALL decrypt and return the plaintext value
2. WHEN a non-admin user requests decryption, THE Secrets_Service SHALL reject the request with a 403 Forbidden response
3. THE Secrets_Page SHALL display a decrypt button only for users with admin privileges
4. WHEN a secret is decrypted, THE Secrets_Page SHALL display the value temporarily and auto-hide after 30 seconds
5. THE Secrets_Service SHALL log all decryption requests to the audit log with user_id, secret_id, and timestamp

### Requirement 3: Secret CRUD Operations

**User Story:** As an admin, I want to create, update, and delete secrets through a dedicated interface.

#### Acceptance Criteria

1. WHEN an admin creates a secret, THE Secrets_Service SHALL validate the name is unique within the user's scope and profile
2. WHEN an admin updates a secret, THE Secrets_Service SHALL re-encrypt the new value and update the updated_at timestamp
3. WHEN an admin deletes a secret, THE Secrets_Service SHALL remove the record and log the deletion to the audit log
4. THE Secrets_Page SHALL provide a modal form for creating and editing secrets with fields: name, key, value, category, profile
5. THE Secrets_Page SHALL display a confirmation dialog before deleting a secret
6. WHEN a non-admin user attempts to create, update, or delete a secret, THE Secrets_Service SHALL reject the request with a 403 Forbidden response

### Requirement 4: Secret Listing and Filtering

**User Story:** As a user, I want to see available secrets (masked) that I can reference in my flows.

#### Acceptance Criteria

1. WHEN a user requests the secrets list, THE Secrets_Service SHALL return all secrets with masked values (showing only metadata)
2. THE Secrets_Page SHALL display secrets in a table with columns: name, key, category, profile, masked_value, created_at, actions
3. THE Secrets_Page SHALL provide search functionality to filter secrets by name or key
4. THE Secrets_Page SHALL provide a category filter dropdown to filter secrets by category
5. THE Secrets_Page SHALL provide a profile selector dropdown to filter secrets by profile
6. THE Secrets_Page SHALL hide edit and delete action buttons for non-admin users

### Requirement 5: Multiple Credential Loaders

**User Story:** As a developer, I want to use different credential profiles for dev/staging/prod environments.

#### Acceptance Criteria

1. THE Secrets_Service SHALL support loading credentials from environment variables via Environment_Loader
2. THE Secrets_Service SHALL support loading credentials from YAML config files via Config_File_Loader
3. THE Secrets_Service SHALL support loading credentials from AWS Secrets Manager via AWS_Secret_Loader
4. WHEN a credential is requested, THE Secrets_Service SHALL check loaders in order: Database, Environment, Config File, AWS Secrets Manager
5. THE Config_File_Loader SHALL support profile-based configuration with sections for default, development, staging, production
6. THE Config_Key enumeration SHALL include keys for: AWS, Azure, GCP, PostgreSQL, MySQL, MongoDB, Snowflake, BigQuery, Redshift, SSH, and custom services

### Requirement 6: YAML Config Import

**User Story:** As an admin, I want to import credentials from a YAML config file.

#### Acceptance Criteria

1. WHEN an admin uploads a YAML config file, THE Secrets_Service SHALL parse the file and extract credentials
2. THE Secrets_Service SHALL validate the YAML structure matches the expected format with profile sections
3. WHEN importing credentials, THE Secrets_Service SHALL encrypt each value before storing in the database
4. IF a credential with the same name and profile already exists, THE Secrets_Service SHALL update the existing record
5. THE Secrets_Page SHALL provide an import button that opens a file upload dialog
6. WHEN import completes, THE Secrets_Page SHALL display a summary of imported, updated, and failed credentials

### Requirement 7: SSH Tunnel Support

**User Story:** As an admin, I want SSH tunnel credentials stored securely for database connections.

#### Acceptance Criteria

1. THE Secrets_Service SHALL support SSH tunnel configuration with fields: host, port, username, password, private_key
2. WHEN storing SSH credentials, THE Secrets_Service SHALL encrypt both password and private_key fields
3. THE SSH_Tunnel_Config SHALL be retrievable by database connectors for establishing secure connections
4. THE Secrets_Page SHALL provide a dedicated form section for SSH tunnel configuration when category is SSH
5. THE Config_Key enumeration SHALL include SSH-specific keys: SSH_HOST, SSH_PORT, SSH_USERNAME, SSH_PASSWORD, SSH_PRIVATE_KEY

### Requirement 8: API Endpoints

**User Story:** As a developer, I want RESTful API endpoints to programmatically manage secrets.

#### Acceptance Criteria

1. THE Secrets_Service SHALL expose GET /api/v1/secrets endpoint to list all secrets with masked values
2. THE Secrets_Service SHALL expose GET /api/v1/secrets/{id} endpoint to retrieve a single secret
3. THE Secrets_Service SHALL expose POST /api/v1/secrets endpoint to create a new secret (admin only)
4. THE Secrets_Service SHALL expose PUT /api/v1/secrets/{id} endpoint to update a secret (admin only)
5. THE Secrets_Service SHALL expose DELETE /api/v1/secrets/{id} endpoint to delete a secret (admin only)
6. THE Secrets_Service SHALL expose POST /api/v1/secrets/{id}/decrypt endpoint to decrypt a secret (admin only)
7. THE Secrets_Service SHALL expose GET /api/v1/secrets/profiles endpoint to list available profiles
8. THE Secrets_Service SHALL expose POST /api/v1/secrets/import endpoint to import from YAML config (admin only)

### Requirement 9: Left Dock Navigation

**User Story:** As a user, I want to access the Secrets Management page from the left dock navigation.

#### Acceptance Criteria

1. THE Left_Dock_Component SHALL include a Secrets Management button with a Key icon
2. WHEN the user clicks the Secrets Management button, THE application SHALL navigate to the /secrets route
3. THE Secrets Management button SHALL display an active state when the current route is /secrets
4. THE Secrets Management button SHALL display a tooltip with text "Secrets" on hover

### Requirement 10: Security and Audit

**User Story:** As a security administrator, I want all secret access and modifications logged for compliance.

#### Acceptance Criteria

1. THE Secrets_Service SHALL log all create, update, delete, and decrypt operations to the audit log
2. THE audit log entry SHALL include: user_id, action_type, secret_id, timestamp, ip_address
3. THE Secrets_Service SHALL implement rate limiting on the decrypt endpoint (maximum 10 requests per minute per user)
4. WHEN rate limit is exceeded, THE Secrets_Service SHALL return a 429 Too Many Requests response
5. THE Secrets_Service SHALL validate that the encryption key is at least 32 characters long
6. IF the encryption key is invalid, THE Secrets_Service SHALL raise a configuration error on startup
