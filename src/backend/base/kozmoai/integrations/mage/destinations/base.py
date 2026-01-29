"""Base adapter for Mage AI data destinations."""

from abc import ABC, abstractmethod
from typing import Any

from kozmoai.schema import Data


class BaseDestinationAdapter(ABC):
    """Base class for all Mage AI destination adapters.

    This adapter wraps Mage AI destination connectors and converts
    KozmoAI Data objects to the appropriate format for export.
    """

    def __init__(self, **config):
        """Initialize the adapter with configuration.

        Args:
            **config: Configuration parameters for the destination
        """
        self.config = config
        self._connection = None

    @abstractmethod
    def connect(self) -> bool:
        """Establish connection to the data destination.

        Returns:
            True if connection successful

        Raises:
            ConnectionError: If connection fails
        """

    @abstractmethod
    def disconnect(self) -> None:
        """Close the connection to the data destination."""

    @abstractmethod
    def test_connection(self) -> bool:
        """Test if the connection is valid.

        Returns:
            True if connection is valid
        """

    @abstractmethod
    def export_data(
        self,
        data: list[Data],
        target: str = None,
        mode: str = "append",
        **kwargs,
    ) -> dict[str, Any]:
        """Export data to the destination.

        Args:
            data: List of Data objects to export
            target: Target table/file/stream name
            mode: Write mode ('append', 'replace', 'fail')
            **kwargs: Additional export options

        Returns:
            Dictionary with export results (rows_written, etc.)
        """

    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.disconnect()
