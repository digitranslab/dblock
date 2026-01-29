"""Mage AI destination adapters."""

from kozmoai.integrations.mage.destinations.base import BaseDestinationAdapter
from kozmoai.integrations.mage.destinations.sql import SQLDestinationAdapter

__all__ = ["BaseDestinationAdapter", "SQLDestinationAdapter"]
