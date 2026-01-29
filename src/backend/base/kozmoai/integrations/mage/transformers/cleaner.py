"""Data cleaning transformer using pandas operations."""

from typing import Any

from kozmoai.integrations.mage.utils.availability import require_mage
from kozmoai.integrations.mage.utils.converters import data_list_to_dataframe, dataframe_to_data_list
from kozmoai.schema import Data


class DataCleanerTransformer:
    """Data cleaning transformer that provides common data cleaning operations.

    This transformer wraps pandas operations to provide data cleaning
    capabilities similar to Mage AI's data cleaner.
    """

    def __init__(self, **config):
        """Initialize the transformer with configuration.

        Args:
            **config: Configuration parameters for cleaning operations
        """
        self.config = config

    @require_mage()
    def clean(
        self,
        data: list[Data],
        operations: list[dict[str, Any]] = None,
    ) -> list[Data]:
        """Apply cleaning operations to data.

        Args:
            data: List of Data objects to clean
            operations: List of cleaning operations to apply

        Returns:
            Cleaned list of Data objects
        """
        if not data:
            return []

        df = data_list_to_dataframe(data)

        if operations:
            for op in operations:
                df = self._apply_operation(df, op)

        return dataframe_to_data_list(df)

    def _apply_operation(self, df, operation: dict):
        """Apply a single cleaning operation to the DataFrame."""
        import pandas as pd

        op_type = operation.get("type")
        column = operation.get("column")
        columns = operation.get("columns", [column] if column else [])

        if op_type == "drop_nulls":
            if columns:
                df = df.dropna(subset=columns)
            else:
                df = df.dropna()

        elif op_type == "fill_nulls":
            value = operation.get("value", "")
            method = operation.get("method")  # 'ffill', 'bfill', 'mean', 'median', 'mode'

            if method == "mean":
                for col in columns or df.columns:
                    if df[col].dtype in ["int64", "float64"]:
                        df[col] = df[col].fillna(df[col].mean())
            elif method == "median":
                for col in columns or df.columns:
                    if df[col].dtype in ["int64", "float64"]:
                        df[col] = df[col].fillna(df[col].median())
            elif method == "mode":
                for col in columns or df.columns:
                    mode_val = df[col].mode()
                    if len(mode_val) > 0:
                        df[col] = df[col].fillna(mode_val[0])
            elif method == "ffill":
                df = df.ffill()
            elif method == "bfill":
                df = df.bfill()
            else:
                if columns:
                    df[columns] = df[columns].fillna(value)
                else:
                    df = df.fillna(value)

        elif op_type == "drop_duplicates":
            keep = operation.get("keep", "first")  # 'first', 'last', False
            if columns:
                df = df.drop_duplicates(subset=columns, keep=keep)
            else:
                df = df.drop_duplicates(keep=keep)

        elif op_type == "drop_columns":
            df = df.drop(columns=columns, errors="ignore")

        elif op_type == "rename_columns":
            mapping = operation.get("mapping", {})
            df = df.rename(columns=mapping)

        elif op_type == "convert_type":
            dtype = operation.get("dtype")
            for col in columns:
                if col in df.columns:
                    try:
                        if dtype == "datetime":
                            df[col] = pd.to_datetime(df[col], errors="coerce")
                        elif dtype == "numeric":
                            df[col] = pd.to_numeric(df[col], errors="coerce")
                        else:
                            df[col] = df[col].astype(dtype)
                    except Exception:
                        pass  # Skip columns that can't be converted

        elif op_type == "trim_whitespace":
            for col in columns or df.select_dtypes(include=["object"]).columns:
                if col in df.columns and df[col].dtype == "object":
                    df[col] = df[col].str.strip()

        elif op_type == "lowercase":
            for col in columns or df.select_dtypes(include=["object"]).columns:
                if col in df.columns and df[col].dtype == "object":
                    df[col] = df[col].str.lower()

        elif op_type == "uppercase":
            for col in columns or df.select_dtypes(include=["object"]).columns:
                if col in df.columns and df[col].dtype == "object":
                    df[col] = df[col].str.upper()

        elif op_type == "replace":
            old_value = operation.get("old_value")
            new_value = operation.get("new_value")
            regex = operation.get("regex", False)
            if columns:
                for col in columns:
                    if col in df.columns:
                        df[col] = df[col].replace(old_value, new_value, regex=regex)
            else:
                df = df.replace(old_value, new_value, regex=regex)

        elif op_type == "filter":
            condition = operation.get("condition")
            if condition:
                df = df.query(condition)

        elif op_type == "sort":
            ascending = operation.get("ascending", True)
            if columns:
                df = df.sort_values(by=columns, ascending=ascending)

        return df

    @require_mage()
    def get_statistics(self, data: list[Data]) -> dict[str, Any]:
        """Get statistics about the data.

        Args:
            data: List of Data objects

        Returns:
            Dictionary with statistics for each column
        """
        if not data:
            return {}

        df = data_list_to_dataframe(data)

        stats = {
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": {},
        }

        for col in df.columns:
            col_stats = {
                "dtype": str(df[col].dtype),
                "null_count": int(df[col].isnull().sum()),
                "null_percentage": float(df[col].isnull().mean() * 100),
                "unique_count": int(df[col].nunique()),
            }

            # Add numeric statistics
            if df[col].dtype in ["int64", "float64"]:
                col_stats.update(
                    {
                        "min": float(df[col].min()) if not df[col].isnull().all() else None,
                        "max": float(df[col].max()) if not df[col].isnull().all() else None,
                        "mean": float(df[col].mean()) if not df[col].isnull().all() else None,
                        "median": float(df[col].median()) if not df[col].isnull().all() else None,
                        "std": float(df[col].std()) if not df[col].isnull().all() else None,
                    }
                )

            stats["columns"][col] = col_stats

        return stats

    @require_mage()
    def suggest_cleaning_operations(self, data: list[Data]) -> list[dict[str, Any]]:
        """Suggest cleaning operations based on data analysis.

        Args:
            data: List of Data objects

        Returns:
            List of suggested cleaning operations
        """
        if not data:
            return []

        df = data_list_to_dataframe(data)
        suggestions = []

        for col in df.columns:
            # Check for null values
            null_pct = df[col].isnull().mean() * 100
            if null_pct > 0:
                if null_pct > 50:
                    suggestions.append(
                        {
                            "type": "drop_columns",
                            "columns": [col],
                            "reason": f"Column '{col}' has {null_pct:.1f}% null values",
                        }
                    )
                elif df[col].dtype in ["int64", "float64"]:
                    suggestions.append(
                        {
                            "type": "fill_nulls",
                            "columns": [col],
                            "method": "median",
                            "reason": f"Fill {null_pct:.1f}% null values in '{col}' with median",
                        }
                    )
                else:
                    suggestions.append(
                        {
                            "type": "fill_nulls",
                            "columns": [col],
                            "value": "",
                            "reason": f"Fill {null_pct:.1f}% null values in '{col}' with empty string",
                        }
                    )

            # Check for duplicates
            if col == df.columns[0]:  # Only check once
                dup_count = df.duplicated().sum()
                if dup_count > 0:
                    suggestions.append(
                        {
                            "type": "drop_duplicates",
                            "reason": f"Found {dup_count} duplicate rows",
                        }
                    )

            # Check for whitespace in string columns
            if df[col].dtype == "object":
                has_whitespace = df[col].dropna().str.contains(r"^\s|\s$", regex=True).any()
                if has_whitespace:
                    suggestions.append(
                        {
                            "type": "trim_whitespace",
                            "columns": [col],
                            "reason": f"Column '{col}' has leading/trailing whitespace",
                        }
                    )

        return suggestions
