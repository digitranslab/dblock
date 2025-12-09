# Component Documentation System

This directory contains YAML-based documentation files for Kozmoai components.

## Overview

The documentation system allows you to create rich, structured documentation for each component that is displayed in the in-app documentation panel.

## File Structure

```
docs/
├── README.md           # This file
├── schema.yaml         # Documentation schema reference
├── __init__.py         # Python module for loading docs
└── {component_name}.yaml  # Documentation files
```

## Creating Documentation

1. Create a new YAML file named after your component (e.g., `openai_model.yaml`)
2. Follow the schema defined in `schema.yaml`
3. The documentation will automatically be available via the API

## YAML Schema

```yaml
component_name: string      # Internal component name
display_name: string        # Display name shown in UI
category: string            # Component category (models, tools, etc.)
version: string             # Documentation version (optional)

overview:
  summary: string           # One-line summary
  description: string       # Detailed description (supports multiline)

features:                   # List of key features
  - string

inputs:                     # Input field documentation
  field_name:
    display_name: string
    type: string
    required: boolean
    description: string
    how_to_get: string      # Instructions for obtaining values (e.g., API keys)

outputs:                    # Output field documentation
  field_name:
    display_name: string
    type: string
    description: string

examples:                   # Usage examples
  - title: string
    description: string
    configuration: object   # Example configuration values
    use_case: string        # When to use this configuration

troubleshooting:            # Common issues and solutions
  - issue: string
    symptoms: [string]
    solution: string

related_components:         # Related components
  - name: string
    description: string

external_links:             # External resources
  - title: string
    url: string
```

## API Endpoints

The documentation is served via the following API endpoints:

- `GET /api/v1/docs/components` - List all documented components
- `GET /api/v1/docs/components/{component_name}` - Get documentation for a specific component
- `GET /api/v1/docs/all` - Get all documentation

## Example

See `openai_model.yaml` for a complete example of component documentation.

## Best Practices

1. **Keep summaries concise** - The summary should be one sentence
2. **Use multiline strings** - For descriptions, use YAML's `|` syntax for readability
3. **Include how_to_get** - For API keys and credentials, explain how to obtain them
4. **Add troubleshooting** - Document common issues users might encounter
5. **Link external resources** - Include links to official documentation
