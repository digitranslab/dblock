"""Type converters between Mage AI and KozmoAI data types."""

from typing import TYPE_CHECKING

from kozmoai.schema import Data

if TYPE_CHECKING:
    import pandas


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

    records = df.to_dict("records")
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

    records = [d.data if hasattr(d, "data") else d for d in data_list]
    return pd.DataFrame(records)


def singer_record_to_data(record: dict) -> Data:
    """Convert a Singer RECORD message to KozmoAI Data.

    Args:
        record: Singer record dictionary

    Returns:
        KozmoAI Data object
    """
    # Singer records have 'record' key containing the actual data
    data = record.get("record", record)
    return Data(data=data)


def clean_dataframe_types(df: "pandas.DataFrame") -> "pandas.DataFrame":
    """Clean DataFrame types for JSON serialization.

    Args:
        df: DataFrame to clean

    Returns:
        Cleaned DataFrame
    """
    import numpy as np

    df = df.copy()

    for col in df.columns:
        # Convert numpy types to Python types
        if df[col].dtype == np.int64:
            df[col] = df[col].astype(int)
        elif df[col].dtype == np.float64:
            df[col] = df[col].astype(float)
        elif df[col].dtype == "datetime64[ns]":
            df[col] = df[col].dt.isoformat()

    return df
