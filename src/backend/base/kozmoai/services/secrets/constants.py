"""Constants and enumerations for the Secrets Management service.

This module defines the core enumerations used throughout the secrets management system:
- SecretCategory: Classification of secrets (AWS, Azure, GCP, Database, SSH, Custom)
- SecretProfile: Environment profiles (default, development, staging, production)
- AuditAction: Types of audit log actions (CREATE, UPDATE, DELETE, DECRYPT)
- ConfigKey: Supported credential key names for various services
"""

from enum import Enum

# Re-export enums from their canonical locations to avoid circular imports
from kozmoai.services.database.models.audit_log.model import AuditAction
from kozmoai.services.database.models.secret.model import SecretCategory, SecretProfile


class ConfigKey(str, Enum):
    """Enumeration of supported credential key names for various services.
    
    This enumeration includes keys for:
    - AWS credentials
    - Azure credentials
    - GCP credentials
    - PostgreSQL database credentials
    - MySQL database credentials
    - MongoDB database credentials
    - Snowflake data warehouse credentials
    - BigQuery credentials
    - Redshift credentials
    - SSH tunnel credentials
    
    Validates: Requirements 5.6, 7.5
    """
    # AWS credentials
    AWS_ACCESS_KEY_ID = "AWS_ACCESS_KEY_ID"
    AWS_SECRET_ACCESS_KEY = "AWS_SECRET_ACCESS_KEY"
    AWS_REGION = "AWS_REGION"
    AWS_SESSION_TOKEN = "AWS_SESSION_TOKEN"
    
    # Azure credentials
    AZURE_CLIENT_ID = "AZURE_CLIENT_ID"
    AZURE_CLIENT_SECRET = "AZURE_CLIENT_SECRET"
    AZURE_TENANT_ID = "AZURE_TENANT_ID"
    AZURE_STORAGE_ACCOUNT_NAME = "AZURE_STORAGE_ACCOUNT_NAME"
    
    # GCP credentials
    GOOGLE_SERVICE_ACC_KEY = "GOOGLE_SERVICE_ACC_KEY"
    GOOGLE_SERVICE_ACC_KEY_FILEPATH = "GOOGLE_SERVICE_ACC_KEY_FILEPATH"
    GOOGLE_LOCATION = "GOOGLE_LOCATION"
    
    # PostgreSQL credentials
    POSTGRES_HOST = "POSTGRES_HOST"
    POSTGRES_PORT = "POSTGRES_PORT"
    POSTGRES_DBNAME = "POSTGRES_DBNAME"
    POSTGRES_USER = "POSTGRES_USER"
    POSTGRES_PASSWORD = "POSTGRES_PASSWORD"
    POSTGRES_SCHEMA = "POSTGRES_SCHEMA"
    POSTGRES_CONNECTION_METHOD = "POSTGRES_CONNECTION_METHOD"
    POSTGRES_CONNECT_TIMEOUT = "POSTGRES_CONNECT_TIMEOUT"
    
    # MySQL credentials
    MYSQL_HOST = "MYSQL_HOST"
    MYSQL_PORT = "MYSQL_PORT"
    MYSQL_DATABASE = "MYSQL_DATABASE"
    MYSQL_USER = "MYSQL_USER"
    MYSQL_PASSWORD = "MYSQL_PASSWORD"
    MYSQL_CONNECTION_METHOD = "MYSQL_CONNECTION_METHOD"
    
    # MongoDB credentials
    MONGODB_HOST = "MONGODB_HOST"
    MONGODB_PORT = "MONGODB_PORT"
    MONGODB_DATABASE = "MONGODB_DATABASE"
    MONGODB_USER = "MONGODB_USER"
    MONGODB_PASSWORD = "MONGODB_PASSWORD"
    MONGODB_CONNECTION_STRING = "MONGODB_CONNECTION_STRING"
    MONGODB_COLLECTION = "MONGODB_COLLECTION"
    
    # Snowflake credentials
    SNOWFLAKE_ACCOUNT = "SNOWFLAKE_ACCOUNT"
    SNOWFLAKE_USER = "SNOWFLAKE_USER"
    SNOWFLAKE_PASSWORD = "SNOWFLAKE_PASSWORD"
    SNOWFLAKE_DEFAULT_DB = "SNOWFLAKE_DEFAULT_DB"
    SNOWFLAKE_DEFAULT_SCHEMA = "SNOWFLAKE_DEFAULT_SCHEMA"
    SNOWFLAKE_DEFAULT_WH = "SNOWFLAKE_DEFAULT_WH"
    SNOWFLAKE_ROLE = "SNOWFLAKE_ROLE"
    SNOWFLAKE_PRIVATE_KEY_PATH = "SNOWFLAKE_PRIVATE_KEY_PATH"
    SNOWFLAKE_PRIVATE_KEY_PASSPHRASE = "SNOWFLAKE_PRIVATE_KEY_PASSPHRASE"
    SNOWFLAKE_TIMEOUT = "SNOWFLAKE_TIMEOUT"
    
    # BigQuery credentials
    BIGQUERY_PROJECT_ID = "BIGQUERY_PROJECT_ID"
    BIGQUERY_DATASET = "BIGQUERY_DATASET"
    BIGQUERY_CREDENTIALS_PATH = "BIGQUERY_CREDENTIALS_PATH"
    
    # Redshift credentials
    REDSHIFT_HOST = "REDSHIFT_HOST"
    REDSHIFT_PORT = "REDSHIFT_PORT"
    REDSHIFT_DBNAME = "REDSHIFT_DBNAME"
    REDSHIFT_DBUSER = "REDSHIFT_DBUSER"
    REDSHIFT_SCHEMA = "REDSHIFT_SCHEMA"
    REDSHIFT_CLUSTER_ID = "REDSHIFT_CLUSTER_ID"
    REDSHIFT_IAM_PROFILE = "REDSHIFT_IAM_PROFILE"
    REDSHIFT_TEMP_CRED_USER = "REDSHIFT_TEMP_CRED_USER"
    REDSHIFT_TEMP_CRED_PASSWORD = "REDSHIFT_TEMP_CRED_PASSWORD"
    
    # SSH tunnel credentials (Validates: Requirements 7.5)
    SSH_HOST = "SSH_HOST"
    SSH_PORT = "SSH_PORT"
    SSH_USERNAME = "SSH_USERNAME"
    SSH_PASSWORD = "SSH_PASSWORD"
    SSH_PRIVATE_KEY = "SSH_PRIVATE_KEY"
