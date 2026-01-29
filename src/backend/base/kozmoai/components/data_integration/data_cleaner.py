"""Data cleaner component for cleaning and transforming data."""

from kozmoai.custom import Component
from kozmoai.inputs import (
    BoolInput,
    DataInput,
    DropdownInput,
    MessageTextInput,
)
from kozmoai.integrations.mage.transformers.cleaner import DataCleanerTransformer
from kozmoai.schema import Data
from kozmoai.template import Output


class DataCleanerComponent(Component):
    """Clean and transform data.

    Provides common data cleaning operations like removing nulls,
    dropping duplicates, type conversion, and more.
    """

    display_name = "Data Cleaner"
    description = "Clean and transform data with common operations"
    icon = "Sparkles"
    name = "DataCleaner"

    inputs = [
        DataInput(
            name="input_data",
            display_name="Input Data",
            info="Data to clean.",
            is_list=True,
        ),
        DropdownInput(
            name="operation",
            display_name="Operation",
            options=[
                "Drop Nulls",
                "Fill Nulls",
                "Drop Duplicates",
                "Drop Columns",
                "Trim Whitespace",
                "Lowercase",
                "Uppercase",
                "Filter Rows",
                "Sort",
                "Auto Clean",
            ],
            value="Drop Nulls",
            info="Select the cleaning operation to apply.",
        ),
        MessageTextInput(
            name="columns",
            display_name="Columns",
            info="Comma-separated list of columns to apply operation to (leave empty for all).",
            value="",
            advanced=True,
        ),
        MessageTextInput(
            name="fill_value",
            display_name="Fill Value",
            info="Value to fill nulls with (for Fill Nulls operation).",
            value="",
            advanced=True,
        ),
        DropdownInput(
            name="fill_method",
            display_name="Fill Method",
            options=["Value", "Mean", "Median", "Mode", "Forward Fill", "Backward Fill"],
            value="Value",
            info="Method to use for filling nulls.",
            advanced=True,
        ),
        MessageTextInput(
            name="filter_condition",
            display_name="Filter Condition",
            info="Pandas query condition for filtering (e.g., 'age > 18').",
            value="",
            advanced=True,
        ),
        BoolInput(
            name="ascending",
            display_name="Sort Ascending",
            value=True,
            info="Sort in ascending order (for Sort operation).",
            advanced=True,
        ),
        BoolInput(
            name="get_statistics",
            display_name="Get Statistics",
            value=False,
            info="Return data statistics instead of cleaned data.",
            advanced=True,
        ),
        BoolInput(
            name="get_suggestions",
            display_name="Get Suggestions",
            value=False,
            info="Return cleaning suggestions instead of cleaned data.",
            advanced=True,
        ),
    ]

    outputs = [
        Output(display_name="Data", name="data", method="clean_data"),
    ]

    def _parse_columns(self) -> list[str]:
        """Parse comma-separated column names."""
        if not self.columns:
            return []
        return [col.strip() for col in self.columns.split(",") if col.strip()]

    def _build_operation(self) -> dict:
        """Build operation dictionary from inputs."""
        columns = self._parse_columns()

        op_map = {
            "Drop Nulls": {"type": "drop_nulls", "columns": columns},
            "Fill Nulls": {
                "type": "fill_nulls",
                "columns": columns,
                "value": self.fill_value,
                "method": {
                    "Value": None,
                    "Mean": "mean",
                    "Median": "median",
                    "Mode": "mode",
                    "Forward Fill": "ffill",
                    "Backward Fill": "bfill",
                }.get(self.fill_method),
            },
            "Drop Duplicates": {"type": "drop_duplicates", "columns": columns},
            "Drop Columns": {"type": "drop_columns", "columns": columns},
            "Trim Whitespace": {"type": "trim_whitespace", "columns": columns},
            "Lowercase": {"type": "lowercase", "columns": columns},
            "Uppercase": {"type": "uppercase", "columns": columns},
            "Filter Rows": {"type": "filter", "condition": self.filter_condition},
            "Sort": {"type": "sort", "columns": columns, "ascending": self.ascending},
        }

        return op_map.get(self.operation, {})

    async def clean_data(self) -> list[Data]:
        """Clean the input data."""
        transformer = DataCleanerTransformer()

        # Return statistics if requested
        if self.get_statistics:
            stats = transformer.get_statistics(self.input_data)
            self.status = f"Generated statistics for {stats.get('row_count', 0)} rows"
            return [Data(data=stats)]

        # Return suggestions if requested
        if self.get_suggestions:
            suggestions = transformer.suggest_cleaning_operations(self.input_data)
            self.status = f"Generated {len(suggestions)} cleaning suggestions"
            return [Data(data={"suggestions": suggestions})]

        # Auto clean mode
        if self.operation == "Auto Clean":
            suggestions = transformer.suggest_cleaning_operations(self.input_data)
            operations = [
                {k: v for k, v in s.items() if k != "reason"} for s in suggestions
            ]
            result = transformer.clean(self.input_data, operations)
            self.status = f"Auto-cleaned data: {len(self.input_data)} → {len(result)} records"
            return result

        # Apply single operation
        operation = self._build_operation()
        if operation:
            result = transformer.clean(self.input_data, [operation])
            self.status = f"Cleaned data: {len(self.input_data)} → {len(result)} records"
            return result

        # No operation, return input unchanged
        return self.input_data
