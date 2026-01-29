"""SQL database destination adapter."""

from typing import Any
from urllib.parse import urlparse

from kozmoai.integrations.mage.destinations.base import BaseDestinationAdapter
from kozmoai.integrations.mage.utils.availability import require_mage
from kozmoai.integrations.mage.utils.converters import data_list_to_dataframe
from kozmoai.schema import Data


class SQLDestinationAdapter(BaseDestinationAdapter):
    """Adapter for SQL database destinations (PostgreSQL, MySQL, etc.)."""

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
        """Initialize SQL destination adapter.

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

    @require_mage()
    def export_data(
        self,
        data: list[Data],
        target: str = None,
        mode: str = "append",
        schema: str = None,
        **kwargs,
    ) -> dict[str, Any]:
        """Export data to the database.

        Args:
            data: List of Data objects to export
            target: Target table name
            mode: Write mode ('append', 'replace', 'fail')
            schema: Database schema (optional)
            **kwargs: Additional pandas to_sql options

        Returns:
            Dictionary with export results
        """
        if not target:
            raise ValueError("Target table name must be provided")

        if not self._engine:
            self.connect()

        # Convert Data objects to DataFrame
        df = data_list_to_dataframe(data)

        if df.empty:
            return {"rows_written": 0, "status": "empty"}

        # Map mode to pandas if_exists parameter
        if_exists_map = {
            "append": "append",
            "replace": "replace",
            "fail": "fail",
        }
        if_exists = if_exists_map.get(mode, "append")

        # Export to database
        rows_written = df.to_sql(
            name=target,
            con=self._engine,
            schema=schema,
            if_exists=if_exists,
            index=False,
            **kwargs,
        )

        return {
            "rows_written": rows_written if rows_written else len(df),
            "status": "success",
            "table": target,
            "schema": schema,
        }

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
