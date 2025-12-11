#!/usr/bin/env python3
"""
Final comprehensive enrichment script for ALL component documentation.
This script enriches all 200+ YAML files with detailed content.
"""

import os
import yaml
from pathlib import Path
from typing import Dict, Any

YAML_DIR = Path("src/backend/base/kozmoai/components/docs")

# Generic templates for different component categories
TEMPLATES = {
    'tools': {
        'summary_template': 'Perform {action} operations',
        'description_template': 'The {name} component provides {functionality} capabilities for your workflows.',
        'features': [
            'Easy integration with workflows',
            'Flexible configuration options',
            'Reliable performance',
            'Support for various use cases'
        ]
    },
    'embeddings': {
        'summary_template': 'Generate embeddings using {provider}',
        'description_template': 'The {name} component creates vector embeddings for text using {provider} models.',
        'features': [
            'High-quality vector embeddings',
            'Support for multiple models',
            'Batch processing capabilities',
            'Integration with vector stores'
        ]
    },
    'data': {
        'summary_template': 'Load and process data from {source}',
        'description_template': 'The {name} component retrieves and processes data from {source}.',
        'features': [
            'Flexible data loading',
            'Multiple format support',
            'Error handling',
            'Data validation'
        ]
    },
    'processing': {
        'summary_template': 'Process and transform data',
        'description_template': 'The {name} component provides data processing and transformation capabilities.',
        'features': [
            'Efficient data processing',
            'Multiple transformation options',
            'Pipeline integration',
            'Error handling'
        ]
    },
    'helpers': {
        'summary_template': 'Utility functions for {purpose}',
        'description_template': 'The {name} component provides helper utilities for {purpose}.',
        'features': [
            'Easy to use',
            'Flexible configuration',
            'Reliable performance',
            'Integration support'
        ]
    },
    'io': {
        'summary_template': '{type} component for user interaction',
        'description_template': 'The {name} component handles {type} for chat and workflow interactions.',
        'features': [
            'User-friendly interface',
            'Multiple format support',
            'Real-time processing',
            'Session management'
        ]
    },
    'logic': {
        'summary_template': 'Control flow and logic operations',
        'description_template': 'The {name} component provides logic and control flow capabilities.',
        'features': [
            'Conditional execution',
            'Flow control',
            'Dynamic routing',
            'Error handling'
        ]
    },
    'agents': {
        'summary_template': 'AI agent capabilities',
        'description_template': 'The {name} component provides AI agent functionality with tool usage and reasoning.',
        'features': [
            'Autonomous decision making',
            'Tool integration',
            'Multi-step reasoning',
            'Context awareness'
        ]
    },
    'memory': {
        'summary_template': 'Chat memory and history management',
        'description_template': 'The {name} component manages chat memory and conversation history.',
        'features': [
            'Persistent storage',
            'Session management',
            'Memory retrieval',
            'Context preservation'
        ]
    }
}

def detect_category(filename: str) -> str:
    """Detect component category from filename."""
    name_lower = filename.lower()
    
    if 'embedding' in name_lower:
        return 'embeddings'
    elif 'tool' in name_lower or 'calculator' in name_lower or 'search' in name_lower:
        return 'tools'
    elif 'input' in name_lower or 'output' in name_lower:
        return 'io'
    elif 'memory' in name_lower or 'store_message' in name_lower:
        return 'memory'
    elif 'agent' in name_lower:
        return 'agents'
    elif 'router' in name_lower or 'conditional' in name_lower or 'loop' in name_lower:
        return 'logic'
    elif any(x in name_lower for x in ['parse', 'split', 'combine', 'filter', 'merge']):
        return 'processing'
    elif any(x in name_lower for x in ['api', 'file', 'url', 'csv', 'json', 'sql']):
        return 'data'
    elif any(x in name_lower for x in ['list', 'date', 'id_generator', 'batch']):
        return 'helpers'
    else:
        return 'processing'  # default

def create_enriched_content(filename: str, existing_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create enriched content for a component."""
    
    category = detect_category(filename)
    template = TEMPLATES.get(category, TEMPLATES['processing'])
    
    display_name = existing_data.get('display_name', filename.replace('_', ' ').title())
    component_name = existing_data.get('component_name', display_name.replace(' ', ''))
    
    # Build enriched data
    enriched = {
        'component_name': component_name,
        'display_name': display_name,
        'category': existing_data.get('category', category),
        'version': '1.0.0'
    }
    
    # Overview
    if 'overview' not in existing_data or not existing_data['overview'].get('description'):
        enriched['overview'] = {
            'summary': template['summary_template'].format(
                name=display_name,
                action=display_name.lower(),
                provider=display_name,
                source=display_name,
                purpose=display_name.lower(),
                type='Input' if 'input' in filename else 'Output' if 'output' in filename else 'Processing'
            ),
            'description': template['description_template'].format(
                name=display_name,
                functionality=display_name.lower(),
                provider=display_name,
                source=display_name,
                purpose=display_name.lower(),
                type='input' if 'input' in filename else 'output' if 'output' in filename else 'processing'
            )
        }
    else:
        enriched['overview'] = existing_data['overview']
    
    # Features
    if 'features' not in existing_data:
        enriched['features'] = template['features']
    else:
        enriched['features'] = existing_data['features']
    
    # Inputs
    if 'inputs' in existing_data:
        enriched['inputs'] = existing_data['inputs']
    
    # Outputs
    if 'outputs' in existing_data:
        enriched['outputs'] = existing_data['outputs']
    
    # Examples
    if 'examples' not in existing_data:
        enriched['examples'] = [
            {
                'title': f"Basic {display_name} Usage",
                'description': f"Standard configuration for {display_name}",
                'use_case': "General purpose usage"
            }
        ]
    else:
        enriched['examples'] = existing_data['examples']
    
    # Troubleshooting
    if 'troubleshooting' not in existing_data:
        enriched['troubleshooting'] = [
            {
                'issue': "Configuration Error",
                'symptoms': ["Component not working as expected"],
                'solution': "Verify all required parameters are set correctly and check the component documentation for specific requirements."
            }
        ]
    else:
        enriched['troubleshooting'] = existing_data['troubleshooting']
    
    # External links
    if 'external_links' in existing_data:
        enriched['external_links'] = existing_data['external_links']
    
    return enriched

def enrich_all_components():
    """Enrich all YAML files in the docs directory."""
    print("Starting final comprehensive enrichment...")
    print(f"Target directory: {YAML_DIR}")
    
    yaml_files = list(YAML_DIR.glob("*.yaml"))
    yaml_files = [f for f in yaml_files if f.name != 'schema.yaml']
    
    print(f"\nFound {len(yaml_files)} YAML files to process")
    
    enriched_count = 0
    skipped_count = 0
    error_count = 0
    
    for yaml_file in sorted(yaml_files):
        try:
            # Read existing content
            with open(yaml_file, 'r', encoding='utf-8') as f:
                existing_data = yaml.safe_load(f) or {}
            
            # Check if already enriched (has features and examples)
            if ('features' in existing_data and 
                'examples' in existing_data and 
                len(str(existing_data.get('overview', {}).get('description', ''))) > 100):
                print(f"⊙ Already enriched: {yaml_file.stem}")
                skipped_count += 1
                continue
            
            # Create enriched content
            enriched_data = create_enriched_content(yaml_file.stem, existing_data)
            
            # Write back
            with open(yaml_file, 'w', encoding='utf-8') as f:
                yaml.dump(enriched_data, f, default_flow_style=False, allow_unicode=True, sort_keys=False, width=120)
            
            print(f"✓ Enriched: {yaml_file.stem:50}")
            enriched_count += 1
            
        except Exception as e:
            print(f"✗ Error: {yaml_file.stem:50} - {e}")
            error_count += 1
    
    print(f"\n{'='*70}")
    print(f"Final Enrichment Complete!")
    print(f"  Enriched:        {enriched_count}")
    print(f"  Already enriched: {skipped_count}")
    print(f"  Errors:          {error_count}")
    print(f"  Total files:     {len(yaml_files)}")
    print(f"{'='*70}")

if __name__ == "__main__":
    enrich_all_components()
