# Mage AI Comprehensive Integration Analysis

## Executive Summary

This document provides a **DEEP** analysis of Mage AI's data integration capabilities and identifies ALL gaps in the current KozmoAI implementation. The analysis covers I/O connectors, data transformations, streaming capabilities, cloud services, and credential management.

**Analysis Date:** January 29, 2026
**Mage AI Version:** Latest from archive/mage-ai-master/
**KozmoAI Version:** Current implementation

---

## CRITICAL FINDINGS SUMMARY

| Category | Mage AI Features | KozmoAI Implemented | Gap |
|----------|-----------------|---------------------|-----|
| Database Connectors | 25+ | 4 (basic) | **21+ missing** |
| Cloud Storage | 3 (S3, GCS, Azure) | 1 (S3 basic) | **2 missing** |
| Credential Loaders | 3 (Env, Config, AWS Secrets) | 0 | **3 missing** |
| Imputation Strategies | 7 | 4 (basic) | **3 missing** |
| Column Transformations | 20+ | 9 | **11+ missing** |
| Row Transformations | 5 | 4 | **1 missing** |
| Streaming Sources | 14 | 0 | **14 missing** |
| Streaming Sinks | 20 | 0 | **20 missing** |
| SSH Tunnel Support | Yes | No | **Missing** |
| Statistics Calculator | Full | Basic | **Partial** |
| Column Type Detection | Full | None | **Missing** |

## 1. Mage AI I/O Connectors (25+ Connectors)

### 1.1 Currently Implemented in KozmoAI
| Connector | Status | Implementation | Gaps |
|-----------|--------|----------------|------|
| PostgreSQL | ✅ Basic | SQLAlchemy | Missing SSH tunnel, connection pooling |
| MySQL | ✅ Basic | SQLAlchemy | Missing SSH tunnel, SSL config |
| S3 | ✅ Basic | boto3/pandas | Missing presigned URLs, multipart upload |
| Local Files | ✅ Basic | pandas | CSV, JSON, Parquet, Excel supported |

### 1.2 Missing Database Connectors (HIGH PRIORITY)

#### BigQuery (`archive/mage-ai-master/mage_ai/io/bigquery.py`)
**Features in Mage AI:**
- Google Cloud authentication (service account key file OR inline credentials)
- Dataset auto-creation
- MERGE operations for upserts with unique constraints
- Schema inference and column type mapping
- Automatic table creation
- Write disposition control (APPEND, TRUNCATE, FAIL)
- Query execution with row limits
- Column type detection and conversion

**Key Implementation Pattern:**
```python
class BigQuery(BaseSQLDatabase):
    def __init__(self, **kwargs):
        # Supports: credentials_mapping (dict), path_to_credentials (file path)
        # Or GOOGLE_APPLICATION_CREDENTIALS env var
        
    @classmethod
    def with_config(cls, config: BaseConfigLoader) -> 'BigQuery':
        # Load from ConfigKey.GOOGLE_SERVICE_ACC_KEY or GOOGLE_SERVICE_ACC_KEY_FILEPATH
```

#### Snowflake (`archive/mage-ai-master/mage_ai/io/snowflake.py`)
**Features in Mage AI:**
- Password authentication
- Private key authentication (PEM format with optional passphrase)
- Role-based access control
- Warehouse/database/schema management
- MERGE operations for upserts
- Temp table creation for upserts
- Auto table creation
- Network timeout configuration

**Key Implementation Pattern:**
```python
class Snowflake(BaseSQLConnection):
    @classmethod
    def with_config(cls, config: BaseConfigLoader) -> 'Snowflake':
        # Supports: SNOWFLAKE_PASSWORD or SNOWFLAKE_PRIVATE_KEY_PATH
        # With optional SNOWFLAKE_PRIVATE_KEY_PASSPHRASE
```

#### Other Missing Connectors
| Connector | File | Key Features |
|-----------|------|--------------|
| **Redshift** | `io/redshift.py` | IAM auth, cluster management, COPY commands, temp credentials |
| **MongoDB** | `io/mongodb.py` | Connection string, collection CRUD, aggregation pipelines |
| **ClickHouse** | `io/clickhouse.py` | HTTP/Native interface, batch inserts |
| **DuckDB** | `io/duckdb.py` | MotherDuck cloud, in-memory/persistent |
| **MSSQL** | `io/mssql.py` | Windows auth, Azure AD, TDS protocol |
| **Oracle** | `io/oracledb.py` | TNS, wallet auth, thick/thin client |
| **Trino** | `io/trino.py` | Catalog/schema management, distributed queries |
| **Spark** | `io/spark.py` | Databricks integration, cluster management |
| **Druid** | `io/druid.py` | Real-time analytics, SQL interface |
| **Pinot** | `io/pinot.py` | Real-time OLAP, broker queries |
| **Google Sheets** | `io/google_sheets.py` | OAuth, service account, sheet management |
| **Airtable** | `io/airtable.py` | API token auth, base/table operations |

### 1.3 Missing Cloud Storage Connectors

#### Azure Blob Storage (`io/azure_blob_storage.py`)
- SAS token authentication
- Managed identity support
- Container management
- Blob upload/download with streaming

#### Google Cloud Storage (`io/google_cloud_storage.py`)
- Service account authentication
- Bucket management
- Object upload/download
- Presigned URL generation

### 1.4 Vector Database Connectors (for AI/ML workflows)
| Connector | File | Features |
|-----------|------|----------|
| **Chroma** | `io/chroma.py` | Local/persistent collections, embedding storage |
| **Qdrant** | `io/qdrant.py` | Vector search, filtering, payload storage |
| **Weaviate** | `io/weaviate.py` | GraphQL API, hybrid search, schema management |
| **Algolia** | `io/algolia.py` | Search-as-a-service, faceting, ranking |

---

## 2. Credential Management System (CRITICAL GAP)

### 2.1 Mage AI's Credential Architecture (`io/config.py`)

Mage AI has a sophisticated credential management system with **150+ credential keys** and **3 credential loaders**.

#### ConfigKey Enum (Complete List)
```python
class ConfigKey(StrEnum):
    # AWS Credentials
    AWS_ACCESS_KEY_ID = 'AWS_ACCESS_KEY_ID'
    AWS_SECRET_ACCESS_KEY = 'AWS_SECRET_ACCESS_KEY'
    AWS_SESSION_TOKEN = 'AWS_SESSION_TOKEN'
    AWS_REGION = 'AWS_REGION'
    AWS_ENDPOINT = 'AWS_ENDPOINT'
    
    # Azure Credentials
    AZURE_CLIENT_ID = 'AZURE_CLIENT_ID'
    AZURE_CLIENT_SECRET = 'AZURE_CLIENT_SECRET'
    AZURE_TENANT_ID = 'AZURE_TENANT_ID'
    AZURE_STORAGE_ACCOUNT_NAME = 'AZURE_STORAGE_ACCOUNT_NAME'
    
    # Google Cloud Credentials
    GOOGLE_SERVICE_ACC_KEY = 'GOOGLE_SERVICE_ACC_KEY'  # Inline JSON
    GOOGLE_SERVICE_ACC_KEY_FILEPATH = 'GOOGLE_SERVICE_ACC_KEY_FILEPATH'
    GOOGLE_LOCATION = 'GOOGLE_LOCATION'
    
    # PostgreSQL (with SSH Tunnel Support)
    POSTGRES_HOST = 'POSTGRES_HOST'
    POSTGRES_PORT = 'POSTGRES_PORT'
    POSTGRES_DBNAME = 'POSTGRES_DBNAME'
    POSTGRES_USER = 'POSTGRES_USER'
    POSTGRES_PASSWORD = 'POSTGRES_PASSWORD'
    POSTGRES_SCHEMA = 'POSTGRES_SCHEMA'
    POSTGRES_CONNECTION_METHOD = 'POSTGRES_CONNECTION_METHOD'
    POSTGRES_CONNECT_TIMEOUT = 'POSTGRES_CONNECT_TIMEOUT'
    # SSH Tunnel credentials
    POSTGRES_SSH_HOST = 'POSTGRES_SSH_HOST'
    POSTGRES_SSH_PORT = 'POSTGRES_SSH_PORT'
    POSTGRES_SSH_USERNAME = 'POSTGRES_SSH_USERNAME'
    POSTGRES_SSH_PASSWORD = 'POSTGRES_SSH_PASSWORD'
    POSTGRES_SSH_PKEY = 'POSTGRES_SSH_PKEY'
    
    # MySQL
    MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD
    MYSQL_CONNECTION_METHOD, MYSQL_ALLOW_LOCAL_INFILE
    
    # Snowflake
    SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD
    SNOWFLAKE_DEFAULT_DB, SNOWFLAKE_DEFAULT_SCHEMA, SNOWFLAKE_DEFAULT_WH
    SNOWFLAKE_ROLE, SNOWFLAKE_TIMEOUT
    SNOWFLAKE_PRIVATE_KEY_PATH, SNOWFLAKE_PRIVATE_KEY_PASSPHRASE
    
    # Redshift
    REDSHIFT_HOST, REDSHIFT_PORT, REDSHIFT_DBNAME, REDSHIFT_DBUSER
    REDSHIFT_CLUSTER_ID, REDSHIFT_IAM_PROFILE, REDSHIFT_SCHEMA
    REDSHIFT_TEMP_CRED_USER, REDSHIFT_TEMP_CRED_PASSWORD
    
    # MongoDB
    MONGODB_HOST, MONGODB_PORT, MONGODB_DATABASE, MONGODB_COLLECTION
    MONGODB_USER, MONGODB_PASSWORD, MONGODB_CONNECTION_STRING
    
    # ClickHouse
    CLICKHOUSE_HOST, CLICKHOUSE_PORT, CLICKHOUSE_DATABASE
    CLICKHOUSE_USERNAME, CLICKHOUSE_PASSWORD, CLICKHOUSE_INTERFACE
    
    # DuckDB
    DUCKDB_DATABASE, DUCKDB_SCHEMA, MOTHERDUCK_TOKEN
    
    # MSSQL
    MSSQL_HOST, MSSQL_PORT, MSSQL_DATABASE, MSSQL_USER, MSSQL_PASSWORD
    MSSQL_DRIVER, MSSQL_SCHEMA, MSSQL_AUTHENTICATION
    
    # Oracle
    ORACLEDB_HOST, ORACLEDB_PORT, ORACLEDB_SERVICE
    ORACLEDB_USER, ORACLEDB_PASSWORD, ORACLEDB_MODE
    
    # Trino
    TRINO_HOST, TRINO_PORT, TRINO_CATALOG, TRINO_SCHEMA
    TRINO_USER, TRINO_PASSWORD
    
    # Spark/Databricks
    SPARK_HOST, SPARK_PORT, SPARK_ENDPOINT, SPARK_TOKEN
    SPARK_CLUSTER, SPARK_ORGANIZATION, SPARK_SCHEMA
    SPARK_DRIVER, SPARK_METHOD, SPARK_USER, SPARK_SERVER_SIDE_PARAMETERS
    
    # Druid
    DRUID_HOST, DRUID_PORT, DRUID_PATH, DRUID_SCHEME
    DRUID_USER, DRUID_PASSWORD
    
    # Pinot
    PINOT_HOST, PINOT_PORT, PINOT_PATH, PINOT_SCHEME
    PINOT_USER, PINOT_PASSWORD
    
    # Vector DBs
    CHROMA_COLLECTION, CHROMA_PATH
    QDRANT_COLLECTION, QDRANT_PATH
    WEAVIATE_ENDPOINT, WEAVIATE_COLLECTION
    WEAVIATE_INSTANCE_API_KEY, WEAVIATE_INFERENCE_API_KEY
    ALGOLIA_APP_ID, ALGOLIA_API_KEY, ALGOLIA_INDEX_NAME
    
    # Airtable
    AIRTABLE_ACCESS_TOKEN
```

### 2.2 Credential Loaders

#### 1. EnvironmentVariableLoader
```python
class EnvironmentVariableLoader(BaseConfigLoader):
    def contains(self, env_var: Union[ConfigKey, str]) -> bool:
        return env_var in os.environ

    def get(self, env_var: Union[ConfigKey, str]) -> Any:
        return os.getenv(env_var)
```

#### 2. ConfigFileLoader (YAML-based)
```python
class ConfigFileLoader(BaseConfigLoader):
    def __init__(self, filepath=None, profile='default', config=None):
        # Loads from io_config.yaml with profile support
        # Supports Jinja2 templating for dynamic values
        # Supports both standard and verbose config formats
```

**Example io_config.yaml:**
```yaml
version: 1.0

default:
  AWS_ACCESS_KEY_ID: "{{ env_var('AWS_ACCESS_KEY_ID') }}"
  AWS_SECRET_ACCESS_KEY: "{{ env_var('AWS_SECRET_ACCESS_KEY') }}"
  
  POSTGRES_HOST: localhost
  POSTGRES_PORT: 5432
  POSTGRES_DBNAME: mydb
  POSTGRES_USER: "{{ env_var('POSTGRES_USER') }}"
  POSTGRES_PASSWORD: "{{ env_var('POSTGRES_PASSWORD') }}"
  
  # SSH Tunnel for secure database access
  POSTGRES_SSH_HOST: bastion.example.com
  POSTGRES_SSH_PORT: 22
  POSTGRES_SSH_USERNAME: ubuntu
  POSTGRES_SSH_PKEY: ~/.ssh/id_rsa

production:
  # Production-specific overrides
  POSTGRES_HOST: prod-db.example.com
```

#### 3. AWSSecretLoader
```python
class AWSSecretLoader(BaseConfigLoader):
    def __init__(self, **kwargs):
        import boto3
        self.client = boto3.client('secretsmanager', **kwargs)

    def get(self, secret_id, version_id=None, version_stage_label=None):
        # Retrieves secrets from AWS Secrets Manager
        # Supports versioning and staging labels
        # Returns SecretBinary or SecretString
```

### 2.3 KozmoAI Gap: NO Unified Credential Management

**Current State:**
- Credentials passed directly to components as input parameters
- No centralized credential store
- No support for AWS Secrets Manager
- No support for config file profiles
- No SSH tunnel support for database connections

**Impact:**
- Security risk: credentials exposed in flow configurations
- No credential rotation support
- No multi-environment support (dev/staging/prod)
- Cannot connect to databases behind firewalls

---

## 3. Data Transformation Actions (DETAILED ANALYSIS)

### 3.1 Imputation Strategies (`data_cleaner/cleaning_rules/impute_values.py`)

Mage AI has **7 imputation strategies** with intelligent auto-selection based on data analysis:

| Strategy | Description | KozmoAI Status | Auto-Selection Logic |
|----------|-------------|----------------|---------------------|
| `AVERAGE` | Fill with column mean | ✅ Implemented | Numeric columns with low skew (<0.7) |
| `MEDIAN` | Fill with column median | ✅ Implemented | Numeric columns with high skew |
| `MODE` | Fill with most frequent value | ✅ Implemented | Categorical columns with mode ratio >40% |
| `CONSTANT` | Fill with placeholder value | ✅ Implemented | Fallback when other strategies don't fit |
| `RANDOM` | Fill with random sample from column | ❌ Missing | Categorical columns with null rate <30% |
| `SEQUENTIAL` (ffill) | Forward fill for time series | ✅ Implemented | Time series data with max null sequence ≤4 |
| `COLUMN` | Fill from another column | ❌ Missing | User-specified column mapping |
| `ROW_RM` | Remove rows with nulls | ❌ Missing | When >70% rows would be kept |

**Mage AI's Intelligent Imputation Selection:**
```python
class NumericalImputeSubRule:
    SKEW_UB = 0.7  # Skewness upper bound
    AVG_OR_MED_EMPTY_UB = {'small': 0.3, 'large': 0.5}  # Null rate thresholds
    
    def evaluate(self, column):
        if null_rate == 0:
            return NOOP
        elif is_timeseries and max_null_seq <= 4:
            return SEQUENTIAL
        elif null_rate <= threshold:
            if abs(skew) < 0.7:
                return AVERAGE
            else:
                return MEDIAN
        return CONSTANT

class CategoricalImputeSubRule:
    MODE_PROP_LB = 0.4  # Mode proportion lower bound
    RAND_EMPTY_UB = 0.3  # Random imputation null rate upper bound
    
    def evaluate(self, column):
        if null_rate == 0:
            return NOOP
        elif is_timeseries and max_null_seq <= 4:
            return SEQUENTIAL
        elif mode_ratio >= 0.4:
            return MODE
        elif null_rate <= 0.3:
            return RANDOM
        return CONSTANT
```

### 3.2 Column Transformations (`data_cleaner/transformer_actions/column.py`)

| Action | Description | KozmoAI Status | Mage AI Implementation |
|--------|-------------|----------------|----------------------|
| `add_column` | Add computed column via UDF | ❌ Missing | Supports custom UDFs with type conversion |
| `remove_column` | Remove columns | ✅ Implemented | `df.drop(columns=cols)` |
| `select` | Select specific columns | ✅ Implemented | `df[columns]` |
| `clean_column_names` | Standardize column names | ❌ Missing | Removes special chars, spaces |
| `impute` | Fill missing values | ✅ Partial | 7 strategies (see above) |
| `normalize` | Min-max normalization | ❌ Missing | `(x - min) / (max - min)` |
| `standardize` | Z-score standardization | ❌ Missing | `(x - mean) / std` |
| `reformat` | Caps, currency, date formatting | ❌ Missing | Multiple sub-actions |
| `fix_syntax_errors` | Fix data type syntax errors | ❌ Missing | Type-specific error correction |
| `remove_outliers` | Statistical outlier removal | ❌ Missing | IQR, Z-score, Isolation Forest |
| `diff` | Calculate differences | ❌ Missing | `df[col].diff()` |
| `shift_up/down` | Shift values | ❌ Missing | `df[col].shift(periods)` |
| `average/sum/min/max/median` | Aggregations | ❌ Missing | With optional groupby |
| `count/count_distinct` | Counting | ❌ Missing | With optional groupby |
| `first/last` | Get first/last values | ❌ Missing | With optional groupby |

**Mage AI Normalize Implementation:**
```python
def normalize(df, action, **kwargs):
    columns = action['action_arguments']
    for col in columns:
        data_min = np.nanmin(df[col], axis=0)
        data_max = np.nanmax(df[col], axis=0)
        data_range = data_max - data_min
        df[col] = (df[col] - data_min) / data_range
    return df
```

**Mage AI Standardize Implementation:**
```python
def standardize(df, action, **kwargs):
    columns = action['action_arguments']
    for col in columns:
        data_mean = np.mean(df[col], axis=0)
        data_std = np.std(df[col], axis=0)
        df[col] = (df[col] - data_mean) / data_std
    return df
```

**Mage AI Outlier Removal:**
```python
def remove_outliers(df, action, **kwargs):
    # Uses OutlierRemover estimator with configurable method
    # Methods: 'itree' (Isolation Forest), 'lof', 'auto'
    method = action['action_options']['method']
    remover = OutlierRemover(method=method)
    outlier_mask = remover.fit_transform(numeric_df.to_numpy())
    return df[~outlier_mask]
```

### 3.3 Row Transformations (`data_cleaner/transformer_actions/row.py`)

| Action | Description | KozmoAI Status | Mage AI Implementation |
|--------|-------------|----------------|----------------------|
| `filter_rows` | Filter by condition | ✅ Implemented | Uses action_code with query |
| `drop_duplicates` | Remove duplicates | ✅ Implemented | With keep='first'/'last' option |
| `sort_rows` | Sort by columns | ✅ Implemented | With ascending/descending per column |
| `remove_row` | Remove specific rows | ❌ Missing | By row indices |
| `custom` | Custom row transformation | ❌ Missing | Execute custom Python code |

### 3.4 KozmoAI Current Implementation Analysis

**File:** `src/backend/base/kozmoai/integrations/mage/transformers/cleaner.py`

**Implemented Operations:**
- `drop_nulls` - Basic null removal
- `fill_nulls` - With mean, median, mode, ffill, bfill, constant
- `drop_duplicates` - With keep option
- `drop_columns` - Remove columns
- `rename_columns` - Column renaming
- `convert_type` - Type conversion (datetime, numeric)
- `trim_whitespace` - String trimming
- `lowercase/uppercase` - Case conversion
- `replace` - Value replacement with regex support
- `filter` - Pandas query filtering
- `sort` - Column sorting

**Missing Operations:**
- Normalize (min-max)
- Standardize (z-score)
- Random imputation
- Column-based imputation
- Row removal by index
- Outlier removal
- Column name cleaning
- Syntax error fixing
- Aggregations (sum, avg, count, etc.)
- Shift operations
- Diff operations
- Custom UDF execution

---

## 4. Streaming Capabilities (COMPLETE GAP)

KozmoAI has **ZERO** streaming capabilities. Mage AI has comprehensive streaming support.

### 4.1 Streaming Sources (`streaming/sources/`)

| Source | File | Features | Config Class |
|--------|------|----------|--------------|
| **Kafka** | `kafka.py` | Consumer groups, SSL, SASL (PLAIN, SCRAM, OAUTHBEARER), batch/single read, offset management, Protobuf/Avro/JSON deserialization | `KafkaConfig` |
| **Kafka OAuth** | `kafka_oauth.py` | OAuth token provider for OAUTHBEARER mechanism | - |
| **AWS Kinesis** | `kinesis.py` | Shard management, checkpoint tracking | `KinesisConfig` |
| **AWS SQS** | `amazon_sqs.py` | Queue polling, message deletion | `SQSConfig` |
| **Azure Event Hub** | `azure_event_hub.py` | Consumer groups, partition management | `AzureEventHubConfig` |
| **Google Pub/Sub** | `google_cloud_pubsub.py` | Subscriptions, acknowledgment | `PubSubConfig` |
| **RabbitMQ** | `rabbitmq.py` | AMQP protocol, queue binding | `RabbitMQConfig` |
| **ActiveMQ** | `activemq.py` | JMS compatible, STOMP protocol | `ActiveMQConfig` |
| **MongoDB** | `mongodb.py` | Change streams, resume tokens | `MongoDBConfig` |
| **InfluxDB** | `influxdb.py` | Time series queries, Flux language | `InfluxDBConfig` |
| **NATS JetStream** | `nats_js.py` | Durable consumers, replay policies | `NATSConfig` |

**Kafka Source Implementation Pattern:**
```python
@dataclass
class KafkaConfig(BaseConfig):
    bootstrap_server: str
    consumer_group: str
    api_version: str = '0.10.2'
    batch_size: int = DEFAULT_BATCH_SIZE
    timeout_ms: int = DEFAULT_TIMEOUT_MS
    auto_offset_reset: str = 'latest'
    include_metadata: bool = False
    security_protocol: SecurityProtocol = None  # SSL, SASL_SSL, SASL_PLAINTEXT
    ssl_config: SSLConfig = None
    sasl_config: SASLConfig = None
    serde_config: SerDeConfig = None  # JSON, Protobuf, Avro, RAW_VALUE
    topic: str = None
    topics: List = field(default_factory=list)
    offset: Dict = None  # type: int/timestamp/beginning/end

class KafkaSource(BaseSource):
    def read(self, handler: Callable):
        # Single message consumption
        for message in self.consumer:
            handler(self._convert_message(message))
    
    async def read_async(self, handler: Callable):
        # Async message consumption
        
    def batch_read(self, handler: Callable):
        # Batch consumption with configurable batch_size and timeout
        msg_pack = self.consumer.poll(max_records=batch_size, timeout_ms=timeout_ms)
```

### 4.2 Streaming Sinks (`streaming/sinks/`)

| Sink | File | Features | Config Class |
|------|------|----------|--------------|
| **Kafka** | `kafka.py` | Producer, partitioning, key serialization | `KafkaConfig` |
| **AWS Kinesis** | `kinesis.py` | Put records, partition keys | `KinesisConfig` |
| **AWS S3** | `amazon_s3.py` | Object storage, partitioned writes | `S3Config` |
| **Azure Data Lake** | `azure_data_lake.py` | ADLS Gen2, hierarchical namespace | `ADLSConfig` |
| **Google Cloud Storage** | `google_cloud_storage.py` | GCS buckets, object writes | `GCSConfig` |
| **Google Pub/Sub** | `google_cloud_pubsub.py` | Topic publishing | `PubSubConfig` |
| **Elasticsearch** | `elasticsearch.py` | Indexing, bulk operations | `ElasticsearchConfig` |
| **OpenSearch** | `opensearch.py` | AWS OpenSearch compatible | `OpenSearchConfig` |
| **MongoDB** | `mongodb.py` | Collection inserts, upserts | `MongoDBConfig` |
| **PostgreSQL** | `postgres.py` | Table inserts, upserts | `PostgresConfig` |
| **Oracle** | `oracledb.py` | Table inserts | `OracleConfig` |
| **InfluxDB** | `influxdb.py` | Time series writes | `InfluxDBConfig` |
| **RabbitMQ** | `rabbitmq.py` | Queue publishing | `RabbitMQConfig` |
| **ActiveMQ** | `activemq.py` | Queue publishing | `ActiveMQConfig` |

**Kafka Sink Implementation Pattern:**
```python
class KafkaSink(BaseSink):
    def init_client(self):
        self.producer = KafkaProducer(
            bootstrap_servers=self.config.bootstrap_server,
            value_serializer=lambda x: json.dumps(x).encode('utf-8'),
            key_serializer=lambda x: x.encode('utf-8') if x else None,
            # SSL/SASL configuration...
        )
    
    def write(self, message: Dict):
        data = message.get('data', message)
        metadata = message.get('metadata', {})
        self.producer.send(
            topic=metadata.get('dest_topic', self.config.topic),
            value=data,
            key=metadata.get('key'),
            timestamp_ms=metadata.get('time'),
        )
    
    def batch_write(self, messages: List[Dict]):
        for message in messages:
            self.write(message)
```

---

## 5. Cloud Services Integration

### 5.1 AWS Services (`services/aws/`)

| Service | Directory | Features | KozmoAI Status |
|---------|-----------|----------|----------------|
| **S3** | `services/aws/s3/s3.py` | Bucket operations, upload/download, list objects, delete, presigned URLs | ❌ Missing (only basic boto3) |
| **Secrets Manager** | `services/aws/secrets_manager/` | Secret retrieval with caching, versioning | ❌ Missing |
| **ECS** | `services/aws/ecs/` | Container task management, service deployment | ❌ Missing |
| **EMR** | `services/aws/emr/` | Spark cluster creation, job submission, resource management | ❌ Missing |
| **EventBridge** | `services/aws/events/` | Event scheduling, rule management | ❌ Missing |

**AWS S3 Client Implementation:**
```python
class Client:
    def __init__(self, bucket, **kwargs):
        self.bucket = bucket
        self.client = boto3.client('s3',
            aws_access_key_id=kwargs.get('aws_access_key_id'),
            aws_secret_access_key=kwargs.get('aws_secret_access_key'),
            config=botocore.client.Config(max_pool_connections=100),
            endpoint_url=kwargs.get('endpoint_url'),
        )
        self.transfer_config = s3transfer.TransferConfig(
            use_threads=True,
            max_concurrency=100,
        )
    
    def read(self, object_key: str):
        return self.get_object(object_key).read()
    
    def upload(self, object_key: str, content):
        return self.client.put_object(Body=content, Bucket=self.bucket, Key=object_key)
    
    def list_objects(self, prefix: str, max_keys: int = 10000, suffix: str = None):
        # List with filtering by suffix
    
    def delete_objects(self, prefix: str):
        # Batch delete by prefix
```

**AWS Secrets Manager Implementation:**
```python
class SecretsManager:
    def __init__(self):
        from aws_secretsmanager_caching import SecretCache, SecretCacheConfig
        client = get_aws_boto3_client('secretsmanager')
        cache_config = SecretCacheConfig()
        self.cache = SecretCache(config=cache_config, client=client)

def get_secret(secret_id: str, cached=True) -> str:
    if cached:
        return secrets_manager.cache.get_secret_string(secret_id)
    else:
        return get_secret_force(secret_id)
```

### 5.2 Other Cloud Services

| Service | Directory | Purpose | KozmoAI Status |
|---------|-----------|---------|----------------|
| **Azure** | `services/azure/` | Blob storage, Azure AD | ❌ Missing |
| **GCP** | `services/gcp/` | BigQuery, Cloud Storage, Pub/Sub | ❌ Missing |

### 5.3 Notification Services

| Service | Directory | Purpose | KozmoAI Status |
|---------|-----------|---------|----------------|
| **Slack** | `services/slack/` | Webhook notifications | ❌ Missing |
| **Discord** | `services/discord/` | Webhook notifications | ❌ Missing |
| **Email** | `services/email/` | SMTP notifications | ❌ Missing |
| **Teams** | `services/teams/` | MS Teams notifications | ❌ Missing |
| **Telegram** | `services/telegram/` | Bot notifications | ❌ Missing |

### 5.4 Infrastructure Services

| Service | Directory | Purpose | KozmoAI Status |
|---------|-----------|---------|----------------|
| **Redis** | `services/redis/` | Caching, pub/sub | ❌ Missing |
| **Kubernetes** | `services/k8s/` | Container orchestration | ❌ Missing |
| **Spark** | `services/spark/` | Distributed processing | ❌ Missing |
| **dbt** | `services/dbt/` | Data transformation | ❌ Missing |
| **Airbyte** | `services/airbyte/` | ELT integration | ❌ Missing |

---

## 6. Implementation Roadmap (REVISED)

### Phase 1: Credential Management Foundation (Week 1)
**Priority: CRITICAL - Blocks all other work**

1. **Create Unified Credential Store**
   - `src/backend/base/kozmoai/integrations/mage/credentials/`
   - `base.py` - BaseConfigLoader abstract class
   - `env_loader.py` - EnvironmentVariableLoader
   - `config_loader.py` - ConfigFileLoader (YAML with profiles)
   - `aws_secrets.py` - AWSSecretLoader
   - `config_keys.py` - ConfigKey enum with all credential keys

2. **SSH Tunnel Support**
   - `src/backend/base/kozmoai/integrations/mage/utils/ssh_tunnel.py`
   - SSHTunnelForwarder integration for database connections

### Phase 2: Core Database Connectors (Week 2-3)
**Priority: HIGH**

1. **BigQuery Connector**
   - Service account authentication (file + inline)
   - Dataset management
   - MERGE operations for upserts
   - Schema inference

2. **Snowflake Connector**
   - Password + private key authentication
   - Role-based access
   - Warehouse management
   - MERGE operations

3. **MongoDB Connector**
   - Connection string support
   - Collection CRUD operations
   - Aggregation pipelines

4. **Redshift Connector**
   - IAM authentication
   - COPY commands
   - Temp credentials

### Phase 3: Cloud Storage Enhancement (Week 3-4)
**Priority: HIGH**

1. **Azure Blob Storage**
   - SAS token authentication
   - Managed identity support
   - Container management

2. **Google Cloud Storage**
   - Service account authentication
   - Bucket management
   - Presigned URLs

3. **Enhanced S3**
   - Presigned URL generation
   - Multipart upload
   - Batch operations

### Phase 4: Data Transformations (Week 4-5)
**Priority: HIGH**

1. **Missing Imputation Strategies**
   - Random imputation
   - Column-based imputation
   - Row removal strategy

2. **Normalization/Standardization**
   - Min-max normalization
   - Z-score standardization

3. **Outlier Removal**
   - IQR method
   - Z-score method
   - Isolation Forest

4. **Column Operations**
   - Clean column names
   - Fix syntax errors
   - Aggregations with groupby
   - Shift/diff operations

### Phase 5: Streaming (Week 5-7)
**Priority: MEDIUM**

1. **Kafka Source/Sink**
   - Consumer/producer with SSL/SASL
   - Protobuf/Avro/JSON serialization
   - Batch and single message modes

2. **AWS Kinesis Source/Sink**
   - Shard management
   - Checkpoint tracking

3. **Google Pub/Sub Source/Sink**
   - Subscription management
   - Acknowledgment handling

### Phase 6: Additional Connectors (Week 7-8)
**Priority: MEDIUM**

1. **ClickHouse** - HTTP/Native interface
2. **DuckDB** - MotherDuck cloud support
3. **MSSQL** - Windows/Azure AD auth
4. **Oracle** - TNS/wallet auth
5. **Trino** - Distributed queries

### Phase 7: Vector DBs & Services (Week 8+)
**Priority: LOW**

1. **Vector Database Connectors**
   - Chroma, Qdrant, Weaviate integration

2. **Notification Services**
   - Slack, Email, Teams webhooks

3. **Infrastructure Services**
   - Redis caching
   - dbt integration

---

## 7. Proposed Architecture

### 7.1 Directory Structure

```
src/backend/base/kozmoai/integrations/mage/
├── __init__.py
├── credentials/                    # NEW: Credential Management
│   ├── __init__.py
│   ├── base.py                    # BaseConfigLoader abstract class
│   ├── config_keys.py             # ConfigKey enum (150+ keys)
│   ├── env_loader.py              # EnvironmentVariableLoader
│   ├── config_loader.py           # ConfigFileLoader (YAML)
│   └── aws_secrets.py             # AWSSecretLoader
├── connectors/                     # NEW: Database Connectors
│   ├── __init__.py
│   ├── base.py                    # BaseSQLDatabase, BaseSQLConnection
│   ├── bigquery.py                # BigQuery connector
│   ├── snowflake.py               # Snowflake connector
│   ├── redshift.py                # Redshift connector
│   ├── mongodb.py                 # MongoDB connector
│   ├── clickhouse.py              # ClickHouse connector
│   ├── duckdb.py                  # DuckDB connector
│   ├── mssql.py                   # MSSQL connector
│   ├── oracle.py                  # Oracle connector
│   └── trino.py                   # Trino connector
├── storage/                        # NEW: Cloud Storage
│   ├── __init__.py
│   ├── base.py                    # BaseStorageClient
│   ├── s3.py                      # Enhanced S3 client
│   ├── azure_blob.py              # Azure Blob Storage
│   └── gcs.py                     # Google Cloud Storage
├── streaming/                      # NEW: Streaming
│   ├── __init__.py
│   ├── sources/
│   │   ├── __init__.py
│   │   ├── base.py                # BaseSource
│   │   ├── kafka.py               # Kafka consumer
│   │   ├── kinesis.py             # Kinesis consumer
│   │   └── pubsub.py              # Pub/Sub subscriber
│   └── sinks/
│       ├── __init__.py
│       ├── base.py                # BaseSink
│       ├── kafka.py               # Kafka producer
│       ├── kinesis.py             # Kinesis producer
│       └── pubsub.py              # Pub/Sub publisher
├── transformers/
│   ├── __init__.py
│   ├── cleaner.py                 # ENHANCED: Full transformation support
│   ├── imputer.py                 # NEW: All imputation strategies
│   ├── normalizer.py              # NEW: Normalize/standardize
│   ├── outlier_remover.py         # NEW: Outlier detection/removal
│   └── column_ops.py              # NEW: Column operations
├── utils/
│   ├── __init__.py
│   ├── availability.py            # Existing
│   ├── converters.py              # Existing
│   └── ssh_tunnel.py              # NEW: SSH tunnel support
├── sources/                        # Existing (enhanced)
│   ├── __init__.py
│   ├── base.py
│   ├── sql.py                     # ENHANCED: Use new connectors
│   └── file.py                    # ENHANCED: Use new storage
└── destinations/                   # Existing (enhanced)
    ├── __init__.py
    ├── base.py
    ├── sql.py                     # ENHANCED: Use new connectors
    └── file.py                    # ENHANCED: Use new storage
```

### 7.2 Component Architecture

```
src/backend/base/kozmoai/components/data_integration/
├── __init__.py
├── loaders/
│   ├── database_loader.py         # ENHANCED: All DB types via connectors
│   ├── file_loader.py             # ENHANCED: S3, GCS, Azure
│   ├── bigquery_loader.py         # NEW: Dedicated BigQuery component
│   ├── snowflake_loader.py        # NEW: Dedicated Snowflake component
│   ├── mongodb_loader.py          # NEW: MongoDB component
│   └── streaming_loader.py        # NEW: Kafka, Kinesis, etc.
├── exporters/
│   ├── database_exporter.py       # ENHANCED: All DB types
│   ├── file_exporter.py           # ENHANCED: S3, GCS, Azure
│   ├── bigquery_exporter.py       # NEW: BigQuery export
│   ├── snowflake_exporter.py      # NEW: Snowflake export
│   └── streaming_exporter.py      # NEW: Streaming sinks
├── transformers/
│   ├── data_cleaner.py            # ENHANCED: All operations
│   ├── imputer.py                 # NEW: Imputation component
│   ├── normalizer.py              # NEW: Normalization component
│   └── outlier_remover.py         # NEW: Outlier removal component
└── credentials/
    └── credential_manager.py      # NEW: Credential management component
```

---

## 8. Credential Configuration Schema

### 8.1 Proposed `io_config.yaml` Format

```yaml
version: 1.0

# Default profile
default:
  # AWS Credentials
  AWS_ACCESS_KEY_ID: "{{ env_var('AWS_ACCESS_KEY_ID') }}"
  AWS_SECRET_ACCESS_KEY: "{{ env_var('AWS_SECRET_ACCESS_KEY') }}"
  AWS_REGION: us-east-1
  
  # PostgreSQL with SSH Tunnel
  POSTGRES_HOST: localhost
  POSTGRES_PORT: 5432
  POSTGRES_DBNAME: mydb
  POSTGRES_USER: "{{ env_var('POSTGRES_USER') }}"
  POSTGRES_PASSWORD: "{{ env_var('POSTGRES_PASSWORD') }}"
  POSTGRES_SCHEMA: public
  # SSH Tunnel (optional)
  POSTGRES_SSH_HOST: bastion.example.com
  POSTGRES_SSH_PORT: 22
  POSTGRES_SSH_USERNAME: ubuntu
  POSTGRES_SSH_PKEY: ~/.ssh/id_rsa
  
  # BigQuery
  GOOGLE_SERVICE_ACC_KEY_FILEPATH: /path/to/service-account.json
  GOOGLE_LOCATION: US
  
  # Snowflake
  SNOWFLAKE_ACCOUNT: xy12345.us-east-1
  SNOWFLAKE_USER: "{{ env_var('SNOWFLAKE_USER') }}"
  SNOWFLAKE_PASSWORD: "{{ env_var('SNOWFLAKE_PASSWORD') }}"
  SNOWFLAKE_DEFAULT_WH: COMPUTE_WH
  SNOWFLAKE_DEFAULT_DB: MY_DB
  SNOWFLAKE_DEFAULT_SCHEMA: PUBLIC
  SNOWFLAKE_ROLE: ANALYST
  
  # MongoDB
  MONGODB_CONNECTION_STRING: "{{ env_var('MONGODB_URI') }}"
  MONGODB_DATABASE: mydb
  MONGODB_COLLECTION: mycollection

# Production profile
production:
  # Use IAM role (no explicit credentials)
  AWS_REGION: us-east-1
  
  POSTGRES_HOST: prod-db.example.com
  POSTGRES_SSH_HOST: prod-bastion.example.com
  
  # Use AWS Secrets Manager for sensitive values
  SNOWFLAKE_PASSWORD: "{{ aws_secret('prod/snowflake/password') }}"

# Staging profile
staging:
  POSTGRES_HOST: staging-db.example.com
  SNOWFLAKE_DEFAULT_DB: STAGING_DB
```

### 8.2 Verbose Config Format (Backward Compatible)

```yaml
version: 1.0

default:
  AWS:
    access_key_id: "{{ env_var('AWS_ACCESS_KEY_ID') }}"
    secret_access_key: "{{ env_var('AWS_SECRET_ACCESS_KEY') }}"
    region: us-east-1
    Redshift:
      host: redshift-cluster.xxx.us-east-1.redshift.amazonaws.com
      port: 5439
      database: dev
      db_user: admin
      schema: public
  
  BigQuery:
    path_to_credentials: /path/to/service-account.json
    location: US
  
  PostgreSQL:
    host: localhost
    port: 5432
    database: mydb
    user: "{{ env_var('POSTGRES_USER') }}"
    password: "{{ env_var('POSTGRES_PASSWORD') }}"
    schema: public
  
  Snowflake:
    account: xy12345.us-east-1
    user: "{{ env_var('SNOWFLAKE_USER') }}"
    password: "{{ env_var('SNOWFLAKE_PASSWORD') }}"
    warehouse: COMPUTE_WH
    database: MY_DB
    schema: PUBLIC
    role: ANALYST
```

---

## 9. Priority Matrix (REVISED)

| Feature | Business Value | Implementation Effort | Dependencies | Priority |
|---------|---------------|----------------------|--------------|----------|
| **Credential Management** | CRITICAL | MEDIUM | None | **P0** |
| SSH Tunnel Support | HIGH | LOW | Credential Mgmt | **P0** |
| BigQuery Connector | HIGH | MEDIUM | Credential Mgmt | **P0** |
| Snowflake Connector | HIGH | MEDIUM | Credential Mgmt | **P0** |
| MongoDB Connector | HIGH | LOW | Credential Mgmt | **P1** |
| Redshift Connector | MEDIUM | MEDIUM | Credential Mgmt | **P1** |
| Azure Blob Storage | MEDIUM | LOW | Credential Mgmt | **P1** |
| GCS Connector | MEDIUM | LOW | Credential Mgmt | **P1** |
| Normalize/Standardize | HIGH | LOW | None | **P1** |
| Outlier Removal | MEDIUM | MEDIUM | None | **P1** |
| Random Imputation | MEDIUM | LOW | None | **P1** |
| Kafka Streaming | MEDIUM | HIGH | None | **P2** |
| Kinesis Streaming | MEDIUM | MEDIUM | None | **P2** |
| ClickHouse Connector | LOW | MEDIUM | Credential Mgmt | **P2** |
| DuckDB Connector | LOW | LOW | None | **P2** |
| Vector DB Connectors | MEDIUM | MEDIUM | None | **P3** |
| Notification Services | LOW | LOW | None | **P3** |

---

## 10. Risk Assessment

### 10.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing functionality | HIGH | Comprehensive test suite, feature flags |
| Credential security vulnerabilities | CRITICAL | Security review, encryption at rest |
| Performance degradation | MEDIUM | Benchmarking, connection pooling |
| Dependency conflicts | MEDIUM | Optional dependencies, lazy imports |

### 10.2 Implementation Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | HIGH | Phased implementation, clear priorities |
| Integration complexity | MEDIUM | Modular architecture, clear interfaces |
| Testing coverage | MEDIUM | Unit tests, integration tests, PBT |

---

## 11. Success Metrics

1. **Connector Coverage**: Support for 15+ database types (currently 4)
2. **Credential Security**: Zero hardcoded credentials in flows
3. **Transformation Coverage**: 25+ transformation operations (currently 12)
4. **Streaming Support**: At least 3 streaming sources/sinks
5. **Test Coverage**: >80% code coverage for new modules
6. **Performance**: No regression in existing functionality

---

## 12. Login Credentials (Reference)

**Current KozmoAI Login:**
- Username: `admin`
- Password: `123456`
- Auto-login: Enabled (`KOZMOAI_AUTO_LOGIN=true`)

---

## Appendix A: Mage AI File Reference

### I/O Connectors
- `archive/mage-ai-master/mage_ai/io/config.py` - Credential management
- `archive/mage-ai-master/mage_ai/io/bigquery.py` - BigQuery connector
- `archive/mage-ai-master/mage_ai/io/snowflake.py` - Snowflake connector
- `archive/mage-ai-master/mage_ai/io/redshift.py` - Redshift connector
- `archive/mage-ai-master/mage_ai/io/mongodb.py` - MongoDB connector

### Data Cleaner
- `archive/mage-ai-master/mage_ai/data_cleaner/data_cleaner.py` - Main cleaner
- `archive/mage-ai-master/mage_ai/data_cleaner/cleaning_rules/impute_values.py` - Imputation
- `archive/mage-ai-master/mage_ai/data_cleaner/transformer_actions/column.py` - Column ops
- `archive/mage-ai-master/mage_ai/data_cleaner/transformer_actions/row.py` - Row ops

### Streaming
- `archive/mage-ai-master/mage_ai/streaming/sources/kafka.py` - Kafka source
- `archive/mage-ai-master/mage_ai/streaming/sinks/kafka.py` - Kafka sink

### AWS Services
- `archive/mage-ai-master/mage_ai/services/aws/s3/s3.py` - S3 client
- `archive/mage-ai-master/mage_ai/services/aws/secrets_manager/secrets_manager.py` - Secrets

---

## Appendix B: Current KozmoAI Implementation Reference

### Data Integration Components
- `src/backend/base/kozmoai/components/data_integration/__init__.py`
- `src/backend/base/kozmoai/components/data_integration/data_cleaner.py`
- `src/backend/base/kozmoai/components/data_integration/database_loader.py`
- `src/backend/base/kozmoai/components/data_integration/database_exporter.py`
- `src/backend/base/kozmoai/components/data_integration/file_loader.py`

### Mage Integration Layer
- `src/backend/base/kozmoai/integrations/mage/transformers/cleaner.py`
- `src/backend/base/kozmoai/integrations/mage/sources/sql.py`
- `src/backend/base/kozmoai/integrations/mage/sources/file.py`
- `src/backend/base/kozmoai/integrations/mage/destinations/sql.py`

### Processing Components
- `src/backend/base/kozmoai/components/processing/dataframe_operations.py`
