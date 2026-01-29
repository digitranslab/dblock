"""Mage AI integration adapters for KozmoAI.

This module provides data integration capabilities using Mage AI connectors.
Install with: pip install kozmoai-base[data-integration]
"""

from kozmoai.integrations.mage.utils.availability import check_mage_available

__all__ = ["check_mage_available"]
