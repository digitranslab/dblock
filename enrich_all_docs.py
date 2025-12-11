#!/usr/bin/env python3
"""
Script to enrich all component documentation YAML files with content from the docs folder.
This script reads the markdown documentation files and extracts relevant information
to populate comprehensive YAML documentation files.
"""

import os
import re
import yaml
from pathlib import Path
from typing import Dict, List, Any, Optional

# Directories
DOCS_DIR = Path("docs/docs/Components")
YAML_DIR = Path("src/backend/base/kozmoai/components/docs")

# Component name mappings (display name -> file name)
COMPONENT_MAPPINGS = {
    # Models
    "OpenAI": "openai_model",
    "Anthropic": "anthropic_model",
    "Google Generative AI": "google_generative_ai_model",
    "Azure OpenAI": "azure_openai_model",
    "Ollama": "ollama_model",
    "Groq": "groq_model",
    "Mistral AI": "mistral_model",
    "Cohere": "cohere_model",
    "Hugging Face": "huggingface_model",
    "DeepSeek": "deepseek_model",
    "Perplexity": "perplexity_model",
    "SambaNova": "sambanova_model",
    "NVIDIA": "nvidia_model",
    "Vertex AI": "vertexai_model",
    "Amazon Bedrock": "amazon_bedrock_model",
    "LM Studio": "lmstudio_model",
    "Novita": "novita_model",
    "OpenRouter": "openrouter_model",
    "MariTalk": "maritalk_model",
    "Baidu Qianfan": "baidu_qianfan_model",
    "AI/ML API": "aiml_model",
    
    # Embeddings
    "OpenAI Embeddings": "openai_embeddings",
    "Anthropic Embeddings": "anthropic_embeddings",
    "Cohere Embeddings": "cohere_embeddings",
    "Ollama Embeddings": "ollama_embeddings",
    "Hugging Face Embeddings": "huggingface_embeddings",
    "Google AI Embeddings": "google_ai_embeddings",
    "Azure OpenAI Embeddings": "azure_openai_embeddings",
    "Mistral Embeddings": "mistral_embeddings",
    "NVIDIA Embeddings": "nvidia_embeddings",
    "Vertex AI Embeddings": "vertexai_embeddings",
    "Amazon Bedrock Embeddings": "amazon_bedrock_embeddings",
    "Cloudflare Embeddings": "cloudflare_embeddings",
    
    # Vector Stores
    "Astra DB": "astradb",
    "Pinecone": "pinecone",
    "Chroma": "chroma",
    "Qdrant": "qdrant",
    "Weaviate": "weaviate",
    "Milvus": "milvus",
    "FAISS": "faiss",
    "PGVector": "pgvector",
    "Redis": "redis",
    "Elasticsearch": "elasticsearch",
    "MongoDB Atlas": "mongodb_atlas",
    "Supabase": "supabase",
    "ClickHouse": "clickhouse",
    "Couchbase": "couchbase",
    "Upstash": "upstash",
    "Vectara": "vectara",
}


def read_mdx_file(file_path: Path) -> Optional[str]:
    """Read an MDX file and return its content."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None


def extract_description(content: str) -> str:
    """Extract the main description from MDX content."""
    # Remove frontmatter
    content = re.sub(r'^---.*?---\s*', '', content, flags=re.DOTALL)
    
    # Remove import statements
    content = re.sub(r'^import .*?;?\s*$', '', content, flags=re.MULTILINE)
    
    # Get first paragraph after title
    lines = content.split('\n')
    description_lines = []
    in_description = False
    
    for line in lines:
        line = line.strip()
        if not line:
            if in_description and description_lines:
                break
            continue
        
        # Skip headers
        if line.startswith('#'):
            in_description = True
            continue
            
        # Skip JSX components
        if line.startswith('<') or line.startswith('*'):
            continue
            
        if in_description:
            description_lines.append(line)
            if len(description_lines) >= 3:  # Get first 3 lines
                break
    
    return ' '.join(description_lines)


def extract_parameters(content: str) -> List[Dict[str, Any]]:
    """Extract parameter information from MDX tables."""
    parameters = []
    
    # Find parameter tables
    table_pattern = r'\| Name \| .*? \|.*?\n\|[-\s|]+\n((?:\|.*?\n)+)'
    matches = re.finditer(table_pattern, content, re.MULTILINE)
    
    for match in matches:
        table_content = match.group(1)
        rows = table_content.strip().split('\n')
        
        for row in rows:
            cells = [cell.strip() for cell in row.split('|')[1:-1]]
            if len(cells) >= 3:
                param = {
                    'name': cells[0],
                    'type': cells[1],
                    'description': cells[2] if len(cells) > 2 else ''
                }
                parameters.append(param)
    
    return parameters


def create_enriched_yaml(component_name: str, yaml_file: str, mdx_content: str) -> Dict[str, Any]:
    """Create enriched YAML content from MDX documentation."""
    
    # Read existing YAML if it exists
    yaml_path = YAML_DIR / f"{yaml_file}.yaml"
    existing_data = {}
    if yaml_path.exists():
        with open(yaml_path, 'r', encoding='utf-8') as f:
            existing_data = yaml.safe_load(f) or {}
    
    # Extract information from MDX
    description = extract_description(mdx_content)
    parameters = extract_parameters(mdx_content)
    
    # Build enriched YAML structure
    enriched = {
        'component_name': existing_data.get('component_name', component_name.replace(' ', '')),
        'display_name': component_name,
        'category': existing_data.get('category', 'models'),
        'version': existing_data.get('version', '1.0.0'),
        'overview': {
            'summary': existing_data.get('overview', {}).get('summary', f"Use {component_name} for AI tasks"),
            'description': description or existing_data.get('overview', {}).get('description', '')
        }
    }
    
    # Add features if they exist
    if 'features' in existing_data:
        enriched['features'] = existing_data['features']
    
    # Add inputs from parameters
    if parameters:
        enriched['inputs'] = {}
        for param in parameters:
            param_key = param['name'].lower().replace(' ', '_')
            enriched['inputs'][param_key] = {
                'display_name': param['name'],
                'type': param['type'],
                'description': param['description']
            }
    elif 'inputs' in existing_data:
        enriched['inputs'] = existing_data['inputs']
    
    # Add outputs
    if 'outputs' in existing_data:
        enriched['outputs'] = existing_data['outputs']
    
    # Add examples
    if 'examples' in existing_data:
        enriched['examples'] = existing_data['examples']
    
    # Add troubleshooting
    if 'troubleshooting' in existing_data:
        enriched['troubleshooting'] = existing_data['troubleshooting']
    
    # Add external links
    if 'external_links' in existing_data:
        enriched['external_links'] = existing_data['external_links']
    
    return enriched


def main():
    """Main function to enrich all documentation files."""
    print("Starting documentation enrichment...")
    
    # Find all bundle MDX files
    bundle_files = list(DOCS_DIR.glob("bundles-*.mdx"))
    print(f"Found {len(bundle_files)} bundle documentation files")
    
    enriched_count = 0
    
    for bundle_file in bundle_files:
        content = read_mdx_file(bundle_file)
        if not content:
            continue
        
        # Extract bundle name from filename
        bundle_name = bundle_file.stem.replace('bundles-', '').replace('-', ' ').title()
        
        # Check if we have a mapping for this component
        yaml_file = None
        for display_name, file_name in COMPONENT_MAPPINGS.items():
            if bundle_name.lower() in display_name.lower() or display_name.lower() in bundle_name.lower():
                yaml_file = file_name
                component_name = display_name
                break
        
        if not yaml_file:
            print(f"No mapping found for: {bundle_name}")
            continue
        
        # Create enriched YAML
        try:
            enriched_data = create_enriched_yaml(component_name, yaml_file, content)
            
            # Write to YAML file
            yaml_path = YAML_DIR / f"{yaml_file}.yaml"
            with open(yaml_path, 'w', encoding='utf-8') as f:
                yaml.dump(enriched_data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
            
            print(f"✓ Enriched: {component_name} -> {yaml_file}.yaml")
            enriched_count += 1
            
        except Exception as e:
            print(f"✗ Error enriching {component_name}: {e}")
    
    print(f"\nEnrichment complete! Updated {enriched_count} files.")


if __name__ == "__main__":
    main()
