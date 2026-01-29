"""Database exporter component for writing data to SQL databases."""

from kozmoai.custom import Component
from kozmoai.inputs import (
    DataInput,
    DropdownInput,
    MessageTextInput,
    SecretStrInput,
)
from kozmoai.integrations.mage.destinations.sql import SQLDestinationAdapter
from kozmoai.schema import Data
from kozmoai.template import Output


class DatabaseExporterComponent(Component):
    """Export data to SQL databases.

    Supports PostgreSQL, MySQL, BigQuery, Snowflake, and more.
    """

    display_name = "Database Exporter"
    description = "Export data to SQL databases (PostgreSQL, MySQL, BigQuery, etc.)"
    icon = "Database"
    name = "DatabaseExporter"

    inputs = [
        DataInput(
            name="input_data",
            display_name="Input Data",
            info="Data to export to the database.",
            is_list=True,
        ),
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
            name="table_name",
            display_name="Table Name",
            info="Target table name for the data.",
            value="",
        ),
        MessageTextInput(
            name="schema_name",
            display_name="Schema Name",
            info="Database schema (optional).",
            value="",
            advanced=True,
        ),
        DropdownInput(
            name="write_mode",
            display_name="Write Mode",
            options=["Append", "Replace", "Fail if exists"],
            value="Append",
            info="How to handle existing data in the table.",
            advanced=True,
        ),
    ]

    outputs = [
        Output(display_name="Result", name="result", method="export_data"),
    ]

    async def export_data(self) -> list[Data]:
        """Export data to the database."""
        if not self.table_name:
            raise ValueError("Table name must be provided")

        # Create adapter
        adapter = SQLDestinationAdapter(
            database_type=self.database_type.lower(),
            connection_string=self.connection_string,
        )

        try:
            # Connect
            adapter.connect()

            # Map write mode
            mode_map = {
                "Append": "append",
                "Replace": "replace",
                "Fail if exists": "fail",
            }
            mode = mode_map.get(self.write_mode, "append")

            # Export data
            result = adapter.export_data(
                data=self.input_data,
                target=self.table_name,
                mode=mode,
                schema=self.schema_name if self.schema_name else None,
            )

            self.status = f"Exported {result.get('rows_written', 0)} records to {self.table_name}"
            return [Data(data=result)]

        finally:
            adapter.disconnect()
