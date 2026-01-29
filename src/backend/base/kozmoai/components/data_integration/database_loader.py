"""Database loader component using Mage AI connectors."""

from kozmoai.custom import Component
from kozmoai.inputs import (
    BoolInput,
    DropdownInput,
    IntInput,
    MessageTextInput,
    SecretStrInput,
)
from kozmoai.integrations.mage.sources.sql import SQLSourceAdapter
from kozmoai.schema import Data
from kozmoai.template import Output


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
