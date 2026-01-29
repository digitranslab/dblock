# Mage AI Integration Analysis for DBlock/KozmoAI

## Executive Summary

This document provides a deep analysis of how to safely integrate Mage AI's data integration and processing capabilities into the DBlock (KozmoAI) backend without causing regressions.

## Implementation Status ✅

### Completed Components

The following components have been implemented and are ready for use:

#### Integration Layer (`src/backend/base/kozmoai/integrations/mage/`)

| Module | File | Status | Description |
|--------|------|--------|-------------|
| Sources | `sources/base.py` | ✅ | Base adapter class for all sources |
| Sources | `sources/sql.py` | ✅ | SQL database adapter (PostgreSQL, MySQL, etc.) |
| Sources | `sources/file.py` | ✅ | File adapter (CSV, JSON, Parquet, Excel, S3) |
| Destinations | `destinations/base.py` | ✅ | Base adapter class for all destinations |
| Destinations | `destinations/sql.py` | ✅ | SQL database destination adapter |
| Transformers | `transformers/cleaner.py` | ✅ | Data cleaning transformer |
| Utils | `utils/availability.py` | ✅ | Dependency availability checker |
| Utils | `utils/converters.py` | ✅ | Type converters (DataFrame ↔ Data) |

#### KozmoAI Components (`src/backend/base/kozmoai/components/data_integration/`)

| Component | File | Status | Description |
|-----------|------|--------|-------------|
| DatabaseLoaderComponent | `database_loader.py` | ✅ | Load data from SQL databases |
| FileLoaderComponent | `file_loader.py` | ✅ | Load data from files (local/S3) |
| DatabaseExporterComponent | `database_exporter.py` | ✅ | Export data to SQL databases |
| DataCleanerComponent | `data_cleaner.py` | ✅ | Clean and transform data |

#### Dependencies (`src/backend/base/pyproject.toml`)

| Extra | Status | Packages |
|-------|--------|----------|
| `data-integration` | ✅ | psycopg2-binary, pymysql, sqlalchemy |
| `bigquery` | ✅ | google-cloud-bigquery |
| `snowflake` | ✅ | snowflake-connector-python |
| `all-integrations` | ✅ | All of the above |

### How to Install

```bash
# Basic data integration (PostgreSQL, MySQL)
pip install kozmoai-base[data-integration]

# With BigQuery support
pip install kozmoai-base[bigquery]

# With Snowflake support
pip install kozmoai-base[snowflake]

# All integrations
pip install kozmoai-base[all-integrations]
```

### How to Test

```bash
# Run the integration test script
python scripts/test_mage_integration.py
```

## Architecture Comparison

### DBlock/KozmoAI Architecture
- **Framework**: FastAPI-based web application
- **Component System**: Custom `Component` class with inputs/outputs
- **Data Flow**: Graph-based flow execution with vertices and edges
- **Data Types**: `Message`, `Data`, `Text` as primary data types
- **Execution**: Async-first with `asyncio` support

### Mage AI Architecture
- **Framework**: Tornado-based web server with REST API
- **Block System**: Pipeline blocks (data loaders, transformers, exporters)
- **Data Flow**: DAG-based pipeline execution
- **Data Types**: Pandas DataFrames, Singer messages (RECORD, SCHEMA, STATE)
- **Execution**: Sync-first with some async support

## Key Mage AI Modules to Integrate

### 1. Data Integrations (`mage_integrations`)
**Purpose**: ETL connectors for 50+ data sources and destinations

**Sources** (data loaders):
- Databases: PostgreSQL, MySQL, MongoDB, BigQuery, Snowflake, Redshift
- APIs: Salesforce, HubSpot, Stripe, GitHub, Google Analytics
- Files: S3, GCS, Azure Blob, SFTP
- Streaming: Kafka (via streaming module)

**Destinations** (data exporters):
- Same databases as sources
- Data lakes: Delta Lake, Elasticsearch
- Message queues: Kafka

### 2. Data Cleaner (`mage_ai/data_cleaner`)
**Purpose**: Automated data quality and cleaning

**Features**:
- Column type detection
- Statistics calculation
- Data analysis and insights
- Cleaning rule suggestions
- Automated transformations

### 3. IO Module (`mage_ai/io`)
**Purpose**: Direct database/storage connections

**Connectors**:
- SQL databases (Postgres, MySQL, BigQuery, Snowflake, etc.)
- NoSQL (MongoDB, DuckDB)
- Cloud storage (S3, GCS, Azure)
- Vector stores (Chroma, Qdrant, Weaviate)

## Integration Strategy

### Phase 1: Create Isolated Integration Layer (SAFE)

Create a new module `src/backend/base/kozmoai/integrations/mage/` that wraps Mage AI functionality:

```
src/backend/base/kozmoai/integrations/
├── __init__.py
├── mage/
│   ├── __init__.py
│   ├── sources/           # Wrapped source connectors
│   │   ├── __init__.py
│   │   ├── base.py        # Base adapter class
│   │   ├── postgresql.py
│   │   ├── mysql.py
│   │   ├── bigquery.py
│   │   └── ...
│   ├── destinations/      # Wrapped destination connectors
│   │   ├── __init__.py
│   │   ├── base.py
│   │   └── ...
│   ├── transformers/      # Data transformation utilities
│   │   ├── __init__.py
│   │   ├── cleaner.py     # Wraps data_cleaner
│   │   └── ...
│   └── utils/
│       ├── __init__.py
│       └── converters.py  # Convert between Mage/KozmoAI types
```

### Phase 2: Create KozmoAI Components

Create new components that use the Mage integration layer:

```
src/backend/base/kozmoai/components/data_integration/
├── __init__.py
├── sources/
│   ├── __init__.py
│   ├── database_source.py      # Generic SQL source
│   ├── api_source.py           # Generic API source
│   └── file_source.py          # S3/GCS/Azure source
├── destinations/
│   ├── __init__.py
│   ├── database_destination.py
│   └── file_destination.py
└── transformers/
    ├── __init__.py
    ├── data_cleaner.py         # Auto data cleaning
    └── type_converter.py       # Type transformations
```

## Type Conversion Strategy

### Mage AI → KozmoAI

```python
# mage_integrations/utils/converters.py

from kozmoai.schema import Data
from kozmoai.schema.dataframe import DataFrame as KozmoDataFrame
import pandas as pd

def mage_df_to_kozmo_data(df: pd.DataFrame) -> list[Data]:
    """Convert Mage DataFrame to KozmoAI Data objects."""
    records = df.to_dict('records')
    return [Data(data=record) for record in records]

def mage_df_to_kozmo_dataframe(df: pd.DataFrame) -> KozmoDataFrame:
    """Convert Mage DataFrame to KozmoAI DataFrame."""
    return KozmoDataFrame(data=df)

def singer_record_to_kozmo_data(record: dict) -> Data:
    """Convert Singer RECORD message to KozmoAI Data."""
    return Data(data=record.get('record', record))
```

### KozmoAI → Mage AI

```python
def kozmo_data_to_df(data: list[Data]) -> pd.DataFrame:
    """Convert KozmoAI Data objects to Pandas DataFrame."""
    records = [d.data for d in data]
    return pd.DataFrame(records)
```

## Safe Integration Patterns

### Pattern 1: Adapter Pattern for Sources

```python
# src/backend/base/kozmoai/integrations/mage/sources/base.py

from abc import ABC, abstractmethod
from typing import Generator, List, Dict, Any
from kozmoai.schema import Data
import pandas as pd

class MageSourceAdapter(ABC):
    """Base adapter for Mage AI sources."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self._mage_source = None
    
    @abstractmethod
    def _create_mage_source(self):
        """Create the underlying Mage source instance."""
        pass
    
    def connect(self) -> bool:
        """Test connection to the source."""
        try:
            self._mage_source = self._create_mage_source()
            self._mage_source.test_connection()
            return True
        except Exception as e:
            raise ConnectionError(f"Failed to connect: {e}")
    
    def discover_streams(self) -> List[str]:
        """Discover available streams/tables."""
        if not self._mage_source:
            self._create_mage_source()
        return self._mage_source.get_stream_ids()
    
    def load_data(
        self, 
        stream: str, 
        limit: int = None
    ) -> Generator[List[Data], None, None]:
        """Load data from the source as KozmoAI Data objects."""
        for batch in self._mage_source.load_data(stream=stream):
            df = pd.DataFrame(batch)
            if limit:
                df = df.head(limit)
            yield [Data(data=record) for record in df.to_dict('records')]
```

### Pattern 2: Component Wrapper

```python
# src/backend/base/kozmoai/components/data_integration/sources/database_source.py

from kozmoai.custom import Component
from kozmoai.io import (
    DropdownInput,
    SecretStrInput,
    MessageTextInput,
    IntInput,
    Output,
)
from kozmoai.schema import Data
from kozmoai.integrations.mage.sources import PostgreSQLAdapter, MySQLAdapter

class DatabaseSourceComponent(Component):
    """Load data from SQL databases using Mage AI connectors."""
    
    display_name = "Database Source"
    description = "Connect to SQL databases and load data."
    icon = "Database"
    name = "DatabaseSource"
    
    inputs = [
        DropdownInput(
            name="database_type",
            display_name="Database Type",
            options=["PostgreSQL", "MySQL", "BigQuery", "Snowflake"],
            value="PostgreSQL",
            info="Select the database type.",
        ),
        SecretStrInput(
            name="connection_string",
            display_name="Connection String",
            info="Database connection string or URI.",
        ),
        MessageTextInput(
            name="query",
            display_name="Query",
            info="SQL query to execute.",
        ),
        IntInput(
            name="limit",
            display_name="Row Limit",
            value=1000,
            info="Maximum rows to return.",
            advanced=True,
        ),
    ]
    
    outputs = [
        Output(display_name="Data", name="data", method="load_data"),
    ]
    
    def _get_adapter(self):
        adapters = {
            "PostgreSQL": PostgreSQLAdapter,
            "MySQL": MySQLAdapter,
            # ... more adapters
        }
        adapter_class = adapters.get(self.database_type)
        if not adapter_class:
            raise ValueError(f"Unsupported database: {self.database_type}")
        return adapter_class(connection_string=self.connection_string)
    
    async def load_data(self) -> list[Data]:
        """Load data from the database."""
        adapter = self._get_adapter()
        adapter.connect()
        
        results = []
        for batch in adapter.execute_query(self.query, limit=self.limit):
            results.extend(batch)
        
        self.status = f"Loaded {len(results)} records"
        return results
```

## Dependency Management

### New Dependencies to Add

```toml
# Add to src/backend/base/pyproject.toml [project.optional-dependencies]

[project.optional-dependencies]
# ... existing ...

data-integration = [
    "singer-python>=5.13.0",      # Singer protocol support
    "psycopg2-binary>=2.9.0",     # PostgreSQL
    "pymysql>=1.1.0",             # MySQL
    "google-cloud-bigquery>=3.0", # BigQuery
    "snowflake-connector-python>=3.0",  # Snowflake
    "boto3>=1.28.0",              # AWS S3
    "google-cloud-storage>=2.0",  # GCS
    "azure-storage-blob>=12.0",   # Azure Blob
    "pymongo>=4.0",               # MongoDB
    "sshtunnel>=0.4.0",           # SSH tunneling
]
```

### Isolated Installation

The data integration features should be optional:
- Core KozmoAI works without Mage dependencies
- Users opt-in by installing `kozmoai-base[data-integration]`

## Risk Mitigation

### 1. No Direct Mage AI Import in Core

```python
# WRONG - Direct import in core module
from mage_ai.io.postgres import Postgres  # ❌

# RIGHT - Lazy import in integration layer
def get_postgres_adapter():
    try:
        from mage_integrations.sources.postgresql import PostgreSQL
        return PostgreSQL
    except ImportError:
        raise ImportError(
            "PostgreSQL support requires: pip install kozmoai-base[data-integration]"
        )
```

### 2. Feature Flags

```python
# src/backend/base/kozmoai/settings.py

class Settings:
    # ... existing settings ...
    
    # Data Integration Features
    ENABLE_MAGE_INTEGRATIONS: bool = False
    MAGE_INTEGRATION_TIMEOUT: int = 300
```

### 3. Graceful Degradation

```python
# Component registration with fallback
def register_data_integration_components():
    try:
        from kozmoai.components.data_integration import (
            DatabaseSourceComponent,
            DataCleanerComponent,
        )
        return [DatabaseSourceComponent, DataCleanerComponent]
    except ImportError:
        logger.warning("Data integration components not available")
        return []
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
1. Create `kozmoai/integrations/mage/` module structure
2. Implement base adapter classes
3. Add type converters
4. Add optional dependencies

### Phase 2: Core Connectors (Week 3-4)
1. PostgreSQL source/destination
2. MySQL source/destination
3. S3 file source/destination
4. Basic data cleaner component

### Phase 3: Extended Connectors (Week 5-6)
1. BigQuery, Snowflake, Redshift
2. MongoDB, DynamoDB
3. API sources (Salesforce, HubSpot)
4. Streaming sources (Kafka)

### Phase 4: Advanced Features (Week 7-8)
1. Schema discovery UI
2. Incremental sync support
3. Data preview functionality
4. Connection testing UI

## Testing Strategy

### Unit Tests
```python
# tests/unit/integrations/mage/test_adapters.py

def test_postgres_adapter_connection():
    adapter = PostgreSQLAdapter(config={...})
    assert adapter.connect() == True

def test_data_conversion():
    df = pd.DataFrame({'a': [1, 2], 'b': ['x', 'y']})
    data = mage_df_to_kozmo_data(df)
    assert len(data) == 2
    assert data[0].data == {'a': 1, 'b': 'x'}
```

### Integration Tests
```python
# tests/integration/test_database_source.py

@pytest.mark.integration
def test_database_source_component():
    component = DatabaseSourceComponent(
        database_type="PostgreSQL",
        connection_string="postgresql://...",
        query="SELECT * FROM test LIMIT 10"
    )
    result = await component.load_data()
    assert len(result) <= 10
```

## Files to Copy from Mage AI

### Essential Files (Copy and Adapt)
1. `mage_integrations/mage_integrations/sources/base.py` → Adapter base
2. `mage_integrations/mage_integrations/destinations/base.py` → Destination base
3. `mage_ai/io/base.py` → IO utilities
4. `mage_ai/data_cleaner/data_cleaner.py` → Data cleaning logic
5. `mage_ai/shared/logger.py` → Logging utilities

### Files to Reference (Don't Copy)
1. Individual source implementations (PostgreSQL, MySQL, etc.)
2. Singer protocol handlers
3. Schema discovery logic

## Conclusion

The safest approach is to:

1. **Isolate** - Keep Mage AI code in a separate `integrations/mage/` module
2. **Adapt** - Create adapter classes that convert between type systems
3. **Optional** - Make data integration an optional feature
4. **Test** - Comprehensive testing before each phase
5. **Gradual** - Roll out connectors incrementally

This approach ensures:
- Zero regression risk to existing KozmoAI functionality
- Clean separation of concerns
- Easy maintenance and updates
- Optional installation for users who need it


---

## Next Steps (Future Enhancements)

### Phase 2: Extended Connectors
1. **Cloud Storage Destinations**
   - S3 destination adapter
   - GCS destination adapter
   - Azure Blob destination adapter

2. **NoSQL Sources/Destinations**
   - MongoDB adapter
   - DynamoDB adapter
   - Redis adapter

3. **API Sources**
   - Salesforce adapter
   - HubSpot adapter
   - Stripe adapter
   - GitHub adapter

### Phase 3: Advanced Features
1. **Schema Discovery**
   - Auto-detect table schemas
   - Preview data before loading
   - Column type inference

2. **Incremental Sync**
   - Track last sync timestamp
   - Support for CDC (Change Data Capture)
   - Bookmark management

3. **Streaming Support**
   - Kafka source/destination
   - Real-time data processing
   - Event-driven pipelines

### Phase 4: UI Enhancements
1. **Connection Testing UI**
   - Visual connection status
   - Error message display
   - Credential validation

2. **Data Preview**
   - Sample data display
   - Schema visualization
   - Row count estimation

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        KozmoAI Frontend                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     KozmoAI Components                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Database    │  │ File        │  │ Data        │              │
│  │ Loader      │  │ Loader      │  │ Cleaner     │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Integration Layer (Adapters)                    ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          ││
│  │  │ SQL Source  │  │ File Source │  │ SQL Dest    │          ││
│  │  │ Adapter     │  │ Adapter     │  │ Adapter     │          ││
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          ││
│  │         │                │                │                  ││
│  │         └────────────────┼────────────────┘                  ││
│  │                          │                                   ││
│  │                          ▼                                   ││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │                  Type Converters                        │││
│  │  │  DataFrame ←→ Data  │  Singer Record ←→ Data            │││
│  │  └─────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Data Sources                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ PostgreSQL  │  │ MySQL       │  │ S3/Files    │              │
│  │ BigQuery    │  │ Snowflake   │  │ GCS/Azure   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

1. **Adapter Pattern**: All Mage AI functionality is wrapped in adapter classes that convert between Mage (Pandas DataFrame) and KozmoAI (Data objects) types.

2. **Isolation**: All Mage-related code is isolated in `integrations/mage/` directory, ensuring no impact on existing KozmoAI functionality.

3. **Optional Dependencies**: Data integration features are optional via `[data-integration]` extras in pyproject.toml.

4. **Lazy Imports**: Dependencies are imported lazily so KozmoAI works without Mage dependencies installed.

5. **No Core Modifications**: No changes to existing KozmoAI core code - only additions.
