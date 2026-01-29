"""File source adapters for S3, GCS, and local files."""

from typing import Generator

from kozmoai.integrations.mage.sources.base import BaseSourceAdapter
from kozmoai.integrations.mage.utils.availability import require_mage
from kozmoai.integrations.mage.utils.converters import dataframe_to_data_list
from kozmoai.schema import Data


class FileSourceAdapter(BaseSourceAdapter):
    """Adapter for file-based data sources (CSV, JSON, Parquet, Excel)."""

    SUPPORTED_FORMATS = ["csv", "json", "parquet", "excel", "xml"]

    def __init__(
        self,
        file_path: str,
        file_format: str = None,
        **kwargs,
    ):
        """Initialize file source adapter.

        Args:
            file_path: Path to the file (local, s3://, gs://, etc.)
            file_format: File format (csv, json, parquet, excel). Auto-detected if not provided.
            **kwargs: Additional pandas read options
        """
        super().__init__(
            file_path=file_path,
            file_format=file_format,
            **kwargs,
        )

    def _detect_format(self, path: str) -> str:
        """Detect file format from extension."""
        path_lower = path.lower()
        if path_lower.endswith(".csv"):
            return "csv"
        if path_lower.endswith(".json") or path_lower.endswith(".jsonl"):
            return "json"
        if path_lower.endswith(".parquet"):
            return "parquet"
        if path_lower.endswith((".xls", ".xlsx")):
            return "excel"
        if path_lower.endswith(".xml"):
            return "xml"
        return "csv"  # Default

    @require_mage()
    def connect(self) -> bool:
        """Verify file exists and is accessible."""
        import os

        file_path = self.config.get("file_path", "")

        # For local files, check existence
        if not file_path.startswith(("s3://", "gs://", "az://", "http://", "https://")):
            if not os.path.exists(file_path):
                raise ConnectionError(f"File not found: {file_path}")

        return True

    def disconnect(self) -> None:
        """No persistent connection for files."""
        pass

    def test_connection(self) -> bool:
        """Test if file is accessible."""
        try:
            self.connect()
            return True
        except Exception:
            return False

    def discover_streams(self) -> list[str]:
        """Return the file path as the only stream."""
        return [self.config.get("file_path", "")]

    def get_schema(self, stream: str) -> dict:
        """Get schema by reading first few rows."""
        import pandas as pd

        file_path = self.config.get("file_path", "")
        file_format = self.config.get("file_format") or self._detect_format(file_path)

        # Read just the header/first row to get schema
        df = self._read_file(file_path, file_format, nrows=1)

        return {col: str(df[col].dtype) for col in df.columns}

    @require_mage()
    def load_data(
        self,
        stream: str = None,
        query: str = None,
        limit: int = None,
        batch_size: int = 1000,
    ) -> Generator[list[Data], None, None]:
        """Load data from the file."""
        file_path = self.config.get("file_path", "")
        file_format = self.config.get("file_format") or self._detect_format(file_path)

        df = self._read_file(file_path, file_format, nrows=limit)

        # Yield in batches
        for i in range(0, len(df), batch_size):
            batch_df = df.iloc[i : i + batch_size]
            yield dataframe_to_data_list(batch_df)

    def _read_file(self, file_path: str, file_format: str, **kwargs):
        """Read file into DataFrame."""
        import pandas as pd

        readers = {
            "csv": pd.read_csv,
            "json": pd.read_json,
            "parquet": pd.read_parquet,
            "excel": pd.read_excel,
            "xml": pd.read_xml,
        }

        reader = readers.get(file_format)
        if not reader:
            raise ValueError(f"Unsupported file format: {file_format}")

        # Merge config kwargs with method kwargs
        read_kwargs = {k: v for k, v in self.config.items() if k not in ("file_path", "file_format")}
        read_kwargs.update(kwargs)

        return reader(file_path, **read_kwargs)


class S3SourceAdapter(FileSourceAdapter):
    """Adapter for AWS S3 files."""

    def __init__(
        self,
        bucket: str,
        key: str,
        aws_access_key_id: str = None,
        aws_secret_access_key: str = None,
        region_name: str = None,
        file_format: str = None,
        **kwargs,
    ):
        """Initialize S3 source adapter.

        Args:
            bucket: S3 bucket name
            key: Object key (path within bucket)
            aws_access_key_id: AWS access key (optional, uses default credentials if not provided)
            aws_secret_access_key: AWS secret key
            region_name: AWS region
            file_format: File format (auto-detected if not provided)
            **kwargs: Additional pandas read options
        """
        file_path = f"s3://{bucket}/{key}"
        super().__init__(
            file_path=file_path,
            file_format=file_format,
            bucket=bucket,
            key=key,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=region_name,
            **kwargs,
        )

    @require_mage()
    def connect(self) -> bool:
        """Verify S3 object exists."""
        try:
            import boto3

            # Create S3 client
            client_kwargs = {}
            if self.config.get("aws_access_key_id"):
                client_kwargs["aws_access_key_id"] = self.config["aws_access_key_id"]
                client_kwargs["aws_secret_access_key"] = self.config["aws_secret_access_key"]
            if self.config.get("region_name"):
                client_kwargs["region_name"] = self.config["region_name"]

            s3 = boto3.client("s3", **client_kwargs)

            # Check if object exists
            s3.head_object(Bucket=self.config["bucket"], Key=self.config["key"])
            return True

        except Exception as e:
            raise ConnectionError(f"Failed to access S3 object: {e}") from e

    def _read_file(self, file_path: str, file_format: str, **kwargs):
        """Read file from S3 into DataFrame."""
        import pandas as pd

        # Set up S3 storage options for pandas
        storage_options = {}
        if self.config.get("aws_access_key_id"):
            storage_options["key"] = self.config["aws_access_key_id"]
            storage_options["secret"] = self.config["aws_secret_access_key"]

        readers = {
            "csv": pd.read_csv,
            "json": pd.read_json,
            "parquet": pd.read_parquet,
            "excel": pd.read_excel,
        }

        reader = readers.get(file_format)
        if not reader:
            raise ValueError(f"Unsupported file format: {file_format}")

        read_kwargs = {k: v for k, v in self.config.items() if k not in ("file_path", "file_format", "bucket", "key", "aws_access_key_id", "aws_secret_access_key", "region_name")}
        read_kwargs.update(kwargs)

        if storage_options:
            read_kwargs["storage_options"] = storage_options

        return reader(file_path, **read_kwargs)
