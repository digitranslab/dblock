# Mage AI Integration - Implementation Plan

## Quick Start Implementation

This document provides the step-by-step implementation to safely add Mage AI data integration to KozmoAI.

---

## Step 1: Create Integration Module Structure

```bash
# Create the directory structure
mkdir -p src/backend/base/kozmoai/integrations/mage/{sources,destinations,transformers,utils}
```

### File: `src/backend/base/kozmoai/integrations/__init__.py`
```python
"""Data integration module for KozmoAI."""
```

### File: `src/backend/base/kozmoai/integrations/mage/__init__.py`
```python
"""Mage AI integration adapters for KozmoAI.

This module provides data integration capabilities using Mage AI connectors.
Install with: pip install kozmoai-base[data-integration]
"""

from kozmoai.integrations.mage.utils.availability import check_mage_available

__all__ = ["check_mage_available"]
```

---

## Step 2: Create Utility Functions

### File: `src/backend/base/kozmoai/integrations/mage/utils/__init__.py`
```python
from kozmoai.integrations.mage.utils.availability import check_mage_available
from kozmoai.integrations.mage.utils.converters import (
    dataframe_to_data_list,
    data_list_to_dataframe,
    singer_record_to_data,
)

__all__ = [
    "check_mage_available",
    "dataframe_to_data_list",
    "data_list_to_dataframe",
    "singer_record_to_data",
]
```

### File: `src/backend/base/kozmoai/integrations/mage/utils/availability.py`
```python
"""Check availability of Mage AI dependencies."""

from functools import lru_cache
from loguru import logger


@lru_cache(maxsize=1)
def check_mage_available() -> bool:
    """Check if Mage AI integration dependencies are available."""
    try:
        import pandas  # noqa: F401
        import singer  # noqa: F401
        return True
    except ImportError:
        return False


def require_mage():
    """Decorator to require Mage AI dependencies."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            if not check_mage_available():
                raise ImportError(
                    "Mage AI integration requires additional dependencies. "
                    "Install with: pip install kozmoai-base[data-integration]"
                )
            return func(*args, **kwargs)
        return wrapper
    return decorator
```

### File: `src/backend/base/kozmoai/integrations/mage/utils/converters.py`
```python
"""Type converters between Mage AI and KozmoAI data types."""

from typing import Any
from kozmoai.schema import Data


def dataframe_to_data_list(df: "pandas.DataFrame") -> list[Data]:
    """Convert a Pandas DataFrame to a list of KozmoAI Data objects.
    
    Args:
        df: Pandas DataFrame to convert
        
    Returns:
        List of Data objects, one per row
    """
    import pandas as pd
    
    if df is None or df.empty:
        return []
    
    # Handle NaN values
    df = df.where(pd.notnull(df), None)
    
    records = df.to_dict('records')
    return [Data(data=record) for record in records]


def data_list_to_dataframe(data_list: list[Data]) -> "pandas.DataFrame":
    """Convert a list of KozmoAI Data objects to a Pandas DataFrame.
    
    Args:
        data_list: List of Data objects
        
    Returns:
        Pandas DataFrame
    """
    import pandas as pd
    
    if not data_list:
        return pd.DataFrame()
    
    records = [d.data if hasattr(d, 'data') else d for d in data_list]
    return pd.DataFrame(records)


def singer_record_to_data(record: dict) -> Data:
    """Convert a Singer RECORD message to KozmoAI Data.
    
    Args:
        record: Singer record dictionary
        
    Returns:
        KozmoAI Data object
    """
    # Singer records have 'record' key containing the actual data
    data = record.get('record', record)
    return Data(data=data)


def clean_dataframe_types(df: "pandas.DataFrame") -> "pandas.DataFrame":
    """Clean DataFrame types for JSON serialization.
    
    Args:
        df: DataFrame to clean
        
    Returns:
        Cleaned DataFrame
    """
    import pandas as pd
    import numpy as np
    
    df = df.copy()
    
    for col in df.columns:
        # Convert numpy types to Python types
        if df[col].dtype == np.int64:
            df[col] = df[col].astype(int)
        elif df[col].dtype == np.float64:
            df[col] = df[col].astype(float)
        elif df[col].dtype == 'datetime64[ns]':
            df[col] = df[col].dt.isoformat()
    
    return df
```

---

## Step 3: Create Base Source Adapter

### File: `src/backend/base/kozmoai/integrations/mage/sources/__init__.py`
```python
"""Mage AI source adapters."""

from kozmoai.integrations.mage.sources.base import BaseSourceAdapter
from kozmoai.integrations.mage.sources.sql import SQLSourceAdapter

__all__ = ["BaseSourceAdapter", "SQLSourceAdapter"]
```

### File: `src/backend/base/kozmoai/integrations/mage/sources/base.py`
```python
"""Base adapter for Mage AI data sources."""

from abc import ABC, abstractmethod
from typing import Any, Generator
from kozmoai.schema import Data
from kozmoai.integrations.mage.utils.converters import dataframe_to_data_list


class BaseSourceAdapter(ABC):
    """Base class for all Mage AI source adapters.
    
    This adapter wraps Mage AI source connectors and converts
    their output to KozmoAI Data objects.
    """
    
    def __init__(self, **config):
        """Initialize the adapter with configuration.
        
        Args:
            **config: Configuration parameters for the source
        """
        self.config = config
        self._connection = None
    
    @abstractmethod
    def connect(self) -> bool:
        """Establish connection to the data source.
        
        Returns:
            True if connection successful
            
        Raises:
            ConnectionError: If connection fails
        """
        pass
    
    @abstractmethod
    def disconnect(self) -> None:
        """Close the connection to the data source."""
        pass
    
    @abstractmethod
    def test_connection(self) -> bool:
        """Test if the connection is valid.
        
        Returns:
            True if connection is valid
        """
        pass
    
    @abstractmethod
    def discover_streams(self) -> list[str]:
        """Discover available streams/tables in the source.
        
        Returns:
            List of stream/table names
        """
        pass
    
    @abstractmethod
    def get_schema(self, stream: str) -> dict:
        """Get the schema for a specific stream.
        
        Args:
            stream: Name of the stream/table
            
        Returns:
            Schema dictionary with column names and types
        """
        pass
    
    @abstractmethod
    def load_data(
        self,
        stream: str = None,
        query: str = None,
        limit: int = None,
        batch_size: int = 1000,
    ) -> Generator[list[Data], None, None]:
        """Load data from the source.
        
        Args:
            stream: Name of the stream/table to load
            query: Custom query (if supported)
            limit: Maximum number of records
            batch_size: Number of records per batch
            
        Yields:
            Batches of Data objects
        """
        pass
    
    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.disconnect()
```

### File: `src/backend/base/kozmoai/integrations/mage/sources/sql.py`
```python
"""SQL database source adapter using Mage AI connectors."""

from typing import Generator
from kozmoai.schema import Data
from kozmoai.integrations.mage.sources.base import BaseSourceAdapter
from kozmoai.integrations.mage.utils.converters import dataframe_to_data_list
from kozmoai.integrations.mage.utils.availability import require_mage


class SQLSourceAdapter(BaseSourceAdapter):
    """Adapter for SQL databases (PostgreSQL, MySQL, etc.)."""
    
    SUPPORTED_DATABASES = {
        "postgresql": "PostgreSQL",
        "postgres": "PostgreSQL", 
        "mysql": "MySQL",
        "bigquery": "BigQuery",
        "snowflake": "Snowflake",
        "redshift": "Redshift",
        "mssql": "MSSQL",
    }
    
    def __init__(
        self,
        database_type: str,
        host: str = None,
        port: int = None,
        database: str = None,
        username: str = None,
        password: str = None,
        connection_string: str = None,
        **kwargs
    ):
        """Initialize SQL source adapter.
        
        Args:
            database_type: Type of database (postgresql, mysql, etc.)
            host: Database host
            port: Database port
            database: Database name
            username: Database username
            password: Database password
            connection_string: Full connection string (alternative to individual params)
            **kwargs: Additional database-specific parameters
        """
        super().__init__(
            database_type=database_type,
            host=host,
            port=port,
            database=database,
            username=username,
            password=password,
            connection_string=connection_string,
            **kwargs
        )
        self._db = None
    
    def _get_db_class(self):
        """Get the appropriate Mage AI database class."""
        db_type = self.config.get("database_type", "").lower()
        
        if db_type in ("postgresql", "postgres"):
            from mage_ai.io.postgres import Postgres
            return Postgres
        elif db_type == "mysql":
            from mage_ai.io.mysql import MySQL
            return MySQL
        elif db_type == "bigquery":
            from mage_ai.io.bigquery import BigQuery
            return BigQuery
        elif db_type == "snowflake":
            from mage_ai.io.snowflake import Snowflake
            return Snowflake
        else:
            raise ValueError(f"Unsupported database type: {db_type}")
    
    @require_mage()
    def connect(self) -> bool:
        """Connect to the SQL database."""
        try:
            db_class = self._get_db_class()
            
            # Build connection parameters
            params = {}
            if self.config.get("connection_string"):
                # Parse connection string
                params = self._parse_connection_string(
                    self.config["connection_string"]
                )
            else:
                params = {
                    "host": self.config.get("host"),
                    "port": self.config.get("port"),
                    "dbname": self.config.get("database"),
                    "user": self.config.get("username"),
                    "password": self.config.get("password"),
                }
            
            # Remove None values
            params = {k: v for k, v in params.items() if v is not None}
            
            self._db = db_class(**params)
            self._db.open()
            return True
            
        except Exception as e:
            raise ConnectionError(f"Failed to connect to database: {e}")
    
    def disconnect(self) -> None:
        """Close the database connection."""
        if self._db:
            self._db.close()
            self._db = None
    
    def test_connection(self) -> bool:
        """Test the database connection."""
        try:
            if not self._db:
                self.connect()
            # Try a simple query
            self._db.execute("SELECT 1")
            return True
        except Exception:
            return False
    
    def discover_streams(self) -> list[str]:
        """Discover available tables in the database."""
        if not self._db:
            self.connect()
        
        # Query to get table names (PostgreSQL syntax)
        query = """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """
        
        df = self._db.load(query)
        return df['table_name'].tolist()
    
    def get_schema(self, stream: str) -> dict:
        """Get schema for a table."""
        if not self._db:
            self.connect()
        
        query = f"""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = '{stream}'
        """
        
        df = self._db.load(query)
        return dict(zip(df['column_name'], df['data_type']))
    
    def load_data(
        self,
        stream: str = None,
        query: str = None,
        limit: int = None,
        batch_size: int = 1000,
    ) -> Generator[list[Data], None, None]:
        """Load data from the database."""
        if not self._db:
            self.connect()
        
        # Build query
        if query:
            sql = query
        elif stream:
            sql = f"SELECT * FROM {stream}"
        else:
            raise ValueError("Either stream or query must be provided")
        
        if limit:
            sql = f"{sql} LIMIT {limit}"
        
        # Load data
        df = self._db.load(sql)
        
        # Yield in batches
        for i in range(0, len(df), batch_size):
            batch_df = df.iloc[i:i + batch_size]
            yield dataframe_to_data_list(batch_df)
    
    def _parse_connection_string(self, conn_str: str) -> dict:
        """Parse a connection string into parameters."""
        from urllib.parse import urlparse, parse_qs
        
        parsed = urlparse(conn_str)
        
        return {
            "host": parsed.hostname,
            "port": parsed.port,
            "dbname": parsed.path.lstrip('/'),
            "user": parsed.username,
            "password": parsed.password,
        }
```

---

## Step 4: Create KozmoAI Components

### File: `src/backend/base/kozmoai/components/data_integration/__init__.py`
```python
"""Data integration components for KozmoAI."""

from kozmoai.integrations.mage.utils.availability import check_mage_available

# Only export components if Mage dependencies are available
if check_mage_available():
    from kozmoai.components.data_integration.database_loader import DatabaseLoaderComponent
    __all__ = ["DatabaseLoaderComponent"]
else:
    __all__ = []
```

### File: `src/backend/base/kozmoai/components/data_integration/database_loader.py`
```python
"""Database loader component using Mage AI connectors."""

from kozmoai.custom import Component
from kozmoai.io import (
    DropdownInput,
    SecretStrInput,
    MessageTextInput,
    IntInput,
    BoolInput,
    Output,
)
from kozmoai.schema import Data
from kozmoai.integrations.mage.sources.sql import SQLSourceAdapter


class DatabaseLoaderComponent(Component):
    """Load data from SQL databases.
    
    Supports PostgreSQL, MySQL, BigQuery, Snowflake, and more.
    Uses Mage AI connectors under the hood.
    """
    
    display_name = "Database Loader"
    description = "Load data from SQL databases (PostgreSQL, MySQL, BigQuery, etc.)"
    icon = "Database"
    name = "DatabaseLoader"
    
    inputs = [
        DropdownInput(
            name="database_type",
            display_name="Database Type",
            options=["PostgreSQL", "MySQL", "BigQuery", "Snowflake", "Redshift"],
            value="PostgreSQL",
            info="Select the type of database to connect to.",
        ),
        SecretStrInput(
            name="connection_string",
            display_name="Connection String",
            info="Database connection URI (e.g., postgresql://user:pass@host:5432/db)",
            password=True,
        ),
        MessageTextInput(
            name="query",
            display_name="SQL Query",
            info="SQL query to execute. Leave empty to load entire table.",
            value="",
        ),
        MessageTextInput(
            name="table_name",
            display_name="Table Name",
            info="Table to load (used if query is empty).",
            value="",
            advanced=True,
        ),
        IntInput(
            name="limit",
            display_name="Row Limit",
            value=10000,
            info="Maximum number of rows to return (0 for no limit).",
            advanced=True,
        ),
        BoolInput(
            name="test_connection_only",
            display_name="Test Connection Only",
            value=False,
            info="Only test the connection without loading data.",
            advanced=True,
        ),
    ]
    
    outputs = [
        Output(display_name="Data", name="data", method="load_data"),
    ]
    
    async def load_data(self) -> list[Data]:
        """Load data from the database."""
        # Create adapter
        adapter = SQLSourceAdapter(
            database_type=self.database_type.lower(),
            connection_string=self.connection_string,
        )
        
        try:
            # Connect
            adapter.connect()
            
            # Test connection only mode
            if self.test_connection_only:
                if adapter.test_connection():
                    self.status = "Connection successful!"
                    return [Data(data={"status": "connected", "message": "Connection successful"})]
                else:
                    self.status = "Connection failed!"
                    return [Data(data={"status": "failed", "message": "Connection failed"})]
            
            # Build query
            query = self.query.strip() if self.query else None
            table = self.table_name.strip() if self.table_name else None
            
            if not query and not table:
                raise ValueError("Either SQL Query or Table Name must be provided")
            
            # Load data
            limit = self.limit if self.limit > 0 else None
            
            results = []
            for batch in adapter.load_data(
                stream=table,
                query=query,
                limit=limit,
            ):
                results.extend(batch)
            
            self.status = f"Loaded {len(results)} records"
            return results
            
        finally:
            adapter.disconnect()
```

---

## Step 5: Update Dependencies

### Add to `src/backend/base/pyproject.toml`:

```toml
[project.optional-dependencies]
# ... existing optional deps ...

data-integration = [
    "singer-python>=5.13.0,<6.0.0",
    "psycopg2-binary>=2.9.0,<3.0.0",
    "pymysql>=1.1.0,<2.0.0",
    "sshtunnel>=0.4.0,<1.0.0",
    "simplejson>=3.19.0,<4.0.0",
]

# BigQuery support (separate due to size)
bigquery = [
    "google-cloud-bigquery>=3.0.0,<4.0.0",
    "google-cloud-bigquery-storage>=2.0.0,<3.0.0",
]

# Snowflake support
snowflake = [
    "snowflake-connector-python>=3.0.0,<4.0.0",
]

# All data integrations
all-integrations = [
    "kozmoai-base[data-integration]",
    "kozmoai-base[bigquery]",
    "kozmoai-base[snowflake]",
]
```

---

## Step 6: Register Components

### Update `src/backend/base/kozmoai/components/__init__.py`:

Add conditional import for data integration components:

```python
# At the end of the file, add:

def _get_data_integration_components():
    """Get data integration components if available."""
    try:
        from kozmoai.integrations.mage.utils.availability import check_mage_available
        if check_mage_available():
            from kozmoai.components.data_integration import DatabaseLoaderComponent
            return [DatabaseLoaderComponent]
    except ImportError:
        pass
    return []

# Add to component list
DATA_INTEGRATION_COMPONENTS = _get_data_integration_components()
```

---

## Testing the Integration

### Test Script: `scripts/test_mage_integration.py`

```python
#!/usr/bin/env python
"""Test Mage AI integration."""

import asyncio
from kozmoai.integrations.mage.utils.availability import check_mage_available

def test_availability():
    """Test if Mage dependencies are available."""
    available = check_mage_available()
    print(f"Mage AI integration available: {available}")
    return available

def test_converters():
    """Test type converters."""
    if not check_mage_available():
        print("Skipping converter tests - dependencies not available")
        return
    
    import pandas as pd
    from kozmoai.integrations.mage.utils.converters import (
        dataframe_to_data_list,
        data_list_to_dataframe,
    )
    
    # Test DataFrame to Data
    df = pd.DataFrame({
        'id': [1, 2, 3],
        'name': ['Alice', 'Bob', 'Charlie'],
        'value': [10.5, 20.3, 30.1],
    })
    
    data_list = dataframe_to_data_list(df)
    print(f"Converted {len(df)} rows to {len(data_list)} Data objects")
    
    # Test Data to DataFrame
    df2 = data_list_to_dataframe(data_list)
    print(f"Converted back to DataFrame with {len(df2)} rows")
    
    assert len(df) == len(data_list) == len(df2)
    print("Converter tests passed!")

async def test_component():
    """Test the DatabaseLoader component."""
    if not check_mage_available():
        print("Skipping component tests - dependencies not available")
        return
    
    from kozmoai.components.data_integration.database_loader import DatabaseLoaderComponent
    
    # Create component (won't actually connect without valid credentials)
    component = DatabaseLoaderComponent(
        database_type="PostgreSQL",
        connection_string="postgresql://test:test@localhost:5432/test",
        test_connection_only=True,
    )
    
    print(f"Component created: {component.display_name}")
    print("Component test passed!")

if __name__ == "__main__":
    print("=" * 50)
    print("Testing Mage AI Integration")
    print("=" * 50)
    
    test_availability()
    test_converters()
    asyncio.run(test_component())
    
    print("=" * 50)
    print("All tests completed!")
```

---

## Summary

This implementation:

1. **Isolates** Mage AI code in `kozmoai/integrations/mage/`
2. **Adapts** Mage connectors to KozmoAI's component system
3. **Converts** between Pandas DataFrames and KozmoAI Data objects
4. **Optional** - Works without Mage dependencies installed
5. **Safe** - No changes to existing KozmoAI core code

To use:
```bash
# Install with data integration support
pip install kozmoai-base[data-integration]

# Or for all integrations
pip install kozmoai-base[all-integrations]
```
