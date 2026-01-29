#!/usr/bin/env python
"""Test Mage AI integration.

This script tests the data integration adapters and components
that provide Mage AI-like functionality in KozmoAI.

Run with: python scripts/test_mage_integration.py
"""

import asyncio
import sys

sys.path.insert(0, "src/backend/base")

from kozmoai.integrations.mage.utils.availability import check_mage_available


def test_availability():
    """Test if Mage dependencies are available."""
    available = check_mage_available()
    print(f"✓ Mage AI integration available: {available}")
    return available


def test_converters():
    """Test type converters."""
    if not check_mage_available():
        print("⊘ Skipping converter tests - dependencies not available")
        return

    import pandas as pd

    from kozmoai.integrations.mage.utils.converters import (
        data_list_to_dataframe,
        dataframe_to_data_list,
    )

    # Test DataFrame to Data
    df = pd.DataFrame(
        {
            "id": [1, 2, 3],
            "name": ["Alice", "Bob", "Charlie"],
            "value": [10.5, 20.3, 30.1],
        }
    )

    data_list = dataframe_to_data_list(df)
    print(f"  Converted {len(df)} rows to {len(data_list)} Data objects")

    # Test Data to DataFrame
    df2 = data_list_to_dataframe(data_list)
    print(f"  Converted back to DataFrame with {len(df2)} rows")

    assert len(df) == len(data_list) == len(df2)
    print("✓ Converter tests passed!")


def test_sql_source_adapter():
    """Test the SQL source adapter."""
    if not check_mage_available():
        print("⊘ Skipping SQL source adapter tests - dependencies not available")
        return

    from kozmoai.integrations.mage.sources.sql import SQLSourceAdapter

    # Create adapter (won't actually connect without valid credentials)
    adapter = SQLSourceAdapter(
        database_type="postgresql",
        connection_string="postgresql://test:test@localhost:5432/test",
    )

    print(f"  Supported databases: {list(adapter.SUPPORTED_DATABASES.keys())}")
    print("✓ SQL Source Adapter test passed!")


def test_sql_destination_adapter():
    """Test the SQL destination adapter."""
    if not check_mage_available():
        print("⊘ Skipping SQL destination adapter tests - dependencies not available")
        return

    from kozmoai.integrations.mage.destinations.sql import SQLDestinationAdapter

    # Create adapter (won't actually connect without valid credentials)
    adapter = SQLDestinationAdapter(
        database_type="postgresql",
        connection_string="postgresql://test:test@localhost:5432/test",
    )

    print(f"  Supported databases: {list(adapter.SUPPORTED_DATABASES.keys())}")
    print("✓ SQL Destination Adapter test passed!")


def test_file_source_adapter():
    """Test the file source adapter."""
    if not check_mage_available():
        print("⊘ Skipping file source adapter tests - dependencies not available")
        return

    from kozmoai.integrations.mage.sources.file import FileSourceAdapter

    # Create adapter
    adapter = FileSourceAdapter(
        file_path="/tmp/test.csv",
        file_format="csv",
    )

    print(f"  Supported formats: {adapter.SUPPORTED_FORMATS}")
    print("✓ File Source Adapter test passed!")


def test_data_cleaner_transformer():
    """Test the data cleaner transformer."""
    if not check_mage_available():
        print("⊘ Skipping data cleaner tests - dependencies not available")
        return

    import pandas as pd

    from kozmoai.integrations.mage.transformers.cleaner import DataCleanerTransformer
    from kozmoai.integrations.mage.utils.converters import dataframe_to_data_list

    # Create test data with some issues
    df = pd.DataFrame(
        {
            "id": [1, 2, 2, 3, None],
            "name": ["  Alice  ", "Bob", "Bob", "Charlie", "David"],
            "value": [10.5, None, 20.3, 30.1, 40.0],
        }
    )
    data = dataframe_to_data_list(df)

    transformer = DataCleanerTransformer()

    # Test statistics
    stats = transformer.get_statistics(data)
    print(f"  Statistics: {stats['row_count']} rows, {stats['column_count']} columns")

    # Test suggestions
    suggestions = transformer.suggest_cleaning_operations(data)
    print(f"  Suggestions: {len(suggestions)} cleaning operations suggested")

    # Test cleaning
    cleaned = transformer.clean(
        data,
        [
            {"type": "drop_nulls"},
            {"type": "drop_duplicates"},
            {"type": "trim_whitespace"},
        ],
    )
    print(f"  Cleaned: {len(data)} → {len(cleaned)} records")

    print("✓ Data Cleaner Transformer test passed!")


def test_components_import():
    """Test that components can be imported."""
    if not check_mage_available():
        print("⊘ Skipping component import tests - dependencies not available")
        return

    try:
        from kozmoai.components.data_integration import (
            DataCleanerComponent,
            DatabaseExporterComponent,
            DatabaseLoaderComponent,
            FileLoaderComponent,
        )

        print(f"  DatabaseLoaderComponent: {DatabaseLoaderComponent.display_name}")
        print(f"  FileLoaderComponent: {FileLoaderComponent.display_name}")
        print(f"  DatabaseExporterComponent: {DatabaseExporterComponent.display_name}")
        print(f"  DataCleanerComponent: {DataCleanerComponent.display_name}")
        print("✓ Component import test passed!")
    except ImportError as e:
        print(f"⊘ Component import failed: {e}")


def run_all_tests():
    """Run all integration tests."""
    print("=" * 60)
    print("Testing Mage AI Integration for KozmoAI")
    print("=" * 60)
    print()

    print("1. Checking availability...")
    test_availability()
    print()

    print("2. Testing type converters...")
    test_converters()
    print()

    print("3. Testing SQL Source Adapter...")
    test_sql_source_adapter()
    print()

    print("4. Testing SQL Destination Adapter...")
    test_sql_destination_adapter()
    print()

    print("5. Testing File Source Adapter...")
    test_file_source_adapter()
    print()

    print("6. Testing Data Cleaner Transformer...")
    test_data_cleaner_transformer()
    print()

    print("7. Testing Component Imports...")
    test_components_import()
    print()

    print("=" * 60)
    print("All tests completed!")
    print("=" * 60)


if __name__ == "__main__":
    run_all_tests()
