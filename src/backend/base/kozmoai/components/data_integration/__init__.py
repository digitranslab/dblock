"""Data integration components for KozmoAI.

These components provide data loading, transformation, and export capabilities
using adapters inspired by Mage AI's data integration patterns.

Components are only available when the data-integration dependencies are installed:
    pip install kozmoai-base[data-integration]
"""

from kozmoai.integrations.mage.utils.availability import check_mage_available

# Only export components if dependencies are available
__all__ = []

if check_mage_available():
    from kozmoai.components.data_integration.data_cleaner import DataCleanerComponent
    from kozmoai.components.data_integration.database_exporter import DatabaseExporterComponent
    from kozmoai.components.data_integration.database_loader import DatabaseLoaderComponent
    from kozmoai.components.data_integration.file_loader import FileLoaderComponent

    __all__ = [
        "DatabaseLoaderComponent",
        "FileLoaderComponent",
        "DatabaseExporterComponent",
        "DataCleanerComponent",
    ]
