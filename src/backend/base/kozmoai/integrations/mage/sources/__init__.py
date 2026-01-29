"""Mage AI source adapters."""

from kozmoai.integrations.mage.sources.base import BaseSourceAdapter
from kozmoai.integrations.mage.sources.file import FileSourceAdapter, S3SourceAdapter
from kozmoai.integrations.mage.sources.sql import SQLSourceAdapter

__all__ = ["BaseSourceAdapter", "SQLSourceAdapter", "FileSourceAdapter", "S3SourceAdapter"]
