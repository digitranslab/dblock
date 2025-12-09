"""Component Documentation System.

This module provides functionality to load and serve component documentation
from YAML files. Documentation files should be placed in this directory
with the naming convention: {component_name}.yaml

Example usage:
    from kozmoai.components.docs import get_component_docs, list_documented_components
    
    # Get documentation for a specific component
    docs = get_component_docs("openai_model")
    
    # List all documented components
    components = list_documented_components()
"""

import os
from pathlib import Path
from typing import Any

import yaml

# Directory containing documentation files
DOCS_DIR = Path(__file__).parent


def get_component_docs(component_name: str) -> dict[str, Any] | None:
    """Load documentation for a specific component.
    
    Args:
        component_name: The name of the component (without .yaml extension)
        
    Returns:
        Dictionary containing the component documentation, or None if not found
    """
    doc_file = DOCS_DIR / f"{component_name}.yaml"
    
    if not doc_file.exists():
        # Try with lowercase
        doc_file = DOCS_DIR / f"{component_name.lower()}.yaml"
        
    if not doc_file.exists():
        return None
        
    try:
        with open(doc_file, encoding="utf-8") as f:
            return yaml.safe_load(f)
    except Exception:
        return None


def list_documented_components() -> list[str]:
    """List all components that have documentation files.
    
    Returns:
        List of component names (without .yaml extension)
    """
    components = []
    for file in DOCS_DIR.glob("*.yaml"):
        if file.name != "schema.yaml":
            components.append(file.stem)
    return sorted(components)


def get_all_docs() -> dict[str, dict[str, Any]]:
    """Load all component documentation.
    
    Returns:
        Dictionary mapping component names to their documentation
    """
    all_docs = {}
    for component_name in list_documented_components():
        docs = get_component_docs(component_name)
        if docs:
            all_docs[component_name] = docs
    return all_docs


def validate_docs(component_name: str) -> list[str]:
    """Validate a component's documentation against the schema.
    
    Args:
        component_name: The name of the component to validate
        
    Returns:
        List of validation errors (empty if valid)
    """
    docs = get_component_docs(component_name)
    errors = []
    
    if not docs:
        return [f"Documentation file not found for {component_name}"]
    
    # Required fields
    required_fields = ["component_name", "display_name", "category", "overview"]
    for field in required_fields:
        if field not in docs:
            errors.append(f"Missing required field: {field}")
    
    # Validate overview structure
    if "overview" in docs:
        if "summary" not in docs["overview"]:
            errors.append("Missing overview.summary")
        if "description" not in docs["overview"]:
            errors.append("Missing overview.description")
    
    return errors
