"""File loader component for CSV, JSON, Parquet, and Excel files."""

from kozmoai.custom import Component
from kozmoai.inputs import (
    BoolInput,
    DropdownInput,
    IntInput,
    MessageTextInput,
    SecretStrInput,
)
from kozmoai.integrations.mage.sources.file import FileSourceAdapter, S3SourceAdapter
from kozmoai.schema import Data
from kozmoai.template import Output


class FileLoaderComponent(Component):
    """Load data from files (CSV, JSON, Parquet, Excel).

    Supports local files and cloud storage (S3, GCS).
    """

    display_name = "File Loader"
    description = "Load data from CSV, JSON, Parquet, or Excel files"
    icon = "File"
    name = "FileLoader"

    inputs = [
        DropdownInput(
            name="source_type",
            display_name="Source Type",
            options=["Local File", "S3"],
            value="Local File",
            info="Select the file source type.",
        ),
        MessageTextInput(
            name="file_path",
            display_name="File Path",
            info="Path to the file (local path or S3 key).",
            value="",
        ),
        MessageTextInput(
            name="s3_bucket",
            display_name="S3 Bucket",
            info="S3 bucket name (only for S3 source).",
            value="",
            advanced=True,
        ),
        SecretStrInput(
            name="aws_access_key_id",
            display_name="AWS Access Key ID",
            info="AWS access key (optional, uses default credentials if not provided).",
            password=True,
            advanced=True,
        ),
        SecretStrInput(
            name="aws_secret_access_key",
            display_name="AWS Secret Access Key",
            info="AWS secret key.",
            password=True,
            advanced=True,
        ),
        DropdownInput(
            name="file_format",
            display_name="File Format",
            options=["Auto-detect", "CSV", "JSON", "Parquet", "Excel"],
            value="Auto-detect",
            info="File format (auto-detected if not specified).",
            advanced=True,
        ),
        IntInput(
            name="limit",
            display_name="Row Limit",
            value=0,
            info="Maximum number of rows to load (0 for no limit).",
            advanced=True,
        ),
        BoolInput(
            name="test_connection_only",
            display_name="Test Connection Only",
            value=False,
            info="Only test file accessibility without loading data.",
            advanced=True,
        ),
    ]

    outputs = [
        Output(display_name="Data", name="data", method="load_data"),
    ]

    def _get_adapter(self):
        """Get the appropriate adapter based on source type."""
        file_format = None if self.file_format == "Auto-detect" else self.file_format.lower()

        if self.source_type == "S3":
            return S3SourceAdapter(
                bucket=self.s3_bucket,
                key=self.file_path,
                aws_access_key_id=self.aws_access_key_id if self.aws_access_key_id else None,
                aws_secret_access_key=self.aws_secret_access_key if self.aws_secret_access_key else None,
                file_format=file_format,
            )
        return FileSourceAdapter(
            file_path=self.file_path,
            file_format=file_format,
        )

    async def load_data(self) -> list[Data]:
        """Load data from the file."""
        adapter = self._get_adapter()

        try:
            # Test connection only mode
            if self.test_connection_only:
                if adapter.test_connection():
                    self.status = "File accessible!"
                    return [Data(data={"status": "accessible", "message": "File is accessible"})]
                self.status = "File not accessible!"
                return [Data(data={"status": "failed", "message": "File is not accessible"})]

            # Connect and load data
            adapter.connect()

            limit = self.limit if self.limit > 0 else None

            results = []
            for batch in adapter.load_data(limit=limit):
                results.extend(batch)

            self.status = f"Loaded {len(results)} records"
            return results

        finally:
            adapter.disconnect()
