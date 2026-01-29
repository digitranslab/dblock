"""Base adapter for Mage AI data sources."""

from abc import ABC, abstractmethod
from typing import Generator

from kozmoai.schema import Data


class BaseSourceAdapter(ABC):
    """Base class for all Mage AI source adapters.

    This adapter wraps Mage AI source connectors and converts
    their output to KozmoAI Data objects.
    """

    def __init__(self, **config):
        """Initialize the adapter with configuration.

        Args:
            **config: Configuration parameters for the source
        """
        self.config = config
        self._connection = None

    @abstractmethod
    def connect(self) -> bool:
        """Establish connection to the data source.

        Returns:
            True if connection successful

        Raises:
            ConnectionError: If connection fails
        """

    @abstractmethod
    def disconnect(self) -> None:
        """Close the connection to the data source."""

    @abstractmethod
    def test_connection(self) -> bool:
        """Test if the connection is valid.

        Returns:
            True if connection is valid
        """

    @abstractmethod
    def discover_streams(self) -> list[str]:
        """Discover available streams/tables in the source.

        Returns:
            List of stream/table names
        """

    @abstractmethod
    def get_schema(self, stream: str) -> dict:
        """Get the schema for a specific stream.

        Args:
            stream: Name of the stream/table

        Returns:
            Schema dictionary with column names and types
        """

    @abstractmethod
    def load_data(
        self,
        stream: str = None,
        query: str = None,
        limit: int = None,
        batch_size: int = 1000,
    ) -> Generator[list[Data], None, None]:
        """Load data from the source.

        Args:
            stream: Name of the stream/table to load
            query: Custom query (if supported)
            limit: Maximum number of records
            batch_size: Number of records per batch

        Yields:
            Batches of Data objects
        """

    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.disconnect()
