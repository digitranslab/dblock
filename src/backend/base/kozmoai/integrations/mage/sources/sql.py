"""SQL database source adapter using Mage AI connectors."""

from typing import Generator
from urllib.parse import urlparse

from kozmoai.integrations.mage.sources.base import BaseSourceAdapter
from kozmoai.integrations.mage.utils.availability import require_mage
from kozmoai.integrations.mage.utils.converters import dataframe_to_data_list
from kozmoai.schema import Data


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
        **kwargs,
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
            **kwargs,
        )
        self._db = None
        self._engine = None

    def _get_connection_params(self) -> dict:
        """Get connection parameters from config or connection string."""
        if self.config.get("connection_string"):
            return self._parse_connection_string(self.config["connection_string"])

        return {
            "host": self.config.get("host"),
            "port": self.config.get("port"),
            "database": self.config.get("database"),
            "user": self.config.get("username"),
            "password": self.config.get("password"),
        }

    @require_mage()
    def connect(self) -> bool:
        """Connect to the SQL database using SQLAlchemy."""
        try:
            from sqlalchemy import create_engine

            db_type = self.config.get("database_type", "").lower()
            params = self._get_connection_params()

            # Build connection URL
            if db_type in ("postgresql", "postgres"):
                driver = "postgresql+psycopg2"
            elif db_type == "mysql":
                driver = "mysql+pymysql"
            else:
                driver = db_type

            # Build URL from params
            user = params.get("user", "")
            password = params.get("password", "")
            host = params.get("host", "localhost")
            port = params.get("port", 5432)
            database = params.get("database", "")

            if user and password:
                url = f"{driver}://{user}:{password}@{host}:{port}/{database}"
            else:
                url = f"{driver}://{host}:{port}/{database}"

            self._engine = create_engine(url)
            # Test connection
            with self._engine.connect():
                pass
            return True

        except Exception as e:
            raise ConnectionError(f"Failed to connect to database: {e}") from e

    def disconnect(self) -> None:
        """Close the database connection."""
        if self._engine:
            self._engine.dispose()
            self._engine = None

    def test_connection(self) -> bool:
        """Test the database connection."""
        try:
            from sqlalchemy import text

            if not self._engine:
                self.connect()
            with self._engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except Exception:
            return False

    def discover_streams(self) -> list[str]:
        """Discover available tables in the database."""
        import pandas as pd

        if not self._engine:
            self.connect()

        query = """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        """

        df = pd.read_sql(query, self._engine)
        return df["table_name"].tolist()

    def get_schema(self, stream: str) -> dict:
        """Get schema for a table."""
        import pandas as pd

        if not self._engine:
            self.connect()

        query = f"""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = '{stream}'
        """

        df = pd.read_sql(query, self._engine)
        return dict(zip(df["column_name"], df["data_type"]))

    def load_data(
        self,
        stream: str = None,
        query: str = None,
        limit: int = None,
        batch_size: int = 1000,
    ) -> Generator[list[Data], None, None]:
        """Load data from the database."""
        import pandas as pd

        if not self._engine:
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
        df = pd.read_sql(sql, self._engine)

        # Yield in batches
        for i in range(0, len(df), batch_size):
            batch_df = df.iloc[i : i + batch_size]
            yield dataframe_to_data_list(batch_df)

    def _parse_connection_string(self, conn_str: str) -> dict:
        """Parse a connection string into parameters."""
        parsed = urlparse(conn_str)

        return {
            "host": parsed.hostname,
            "port": parsed.port,
            "database": parsed.path.lstrip("/"),
            "user": parsed.username,
            "password": parsed.password,
        }
