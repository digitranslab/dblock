#!/usr/bin/env python3
"""
Comprehensive script to enrich ALL component documentation YAML files.
This reads from the docs/docs/Components folder and creates detailed YAML files.
"""

import os
import re
import yaml
from pathlib import Path
from typing import Dict, List, Any, Optional

DOCS_DIR = Path("docs/docs/Components")
YAML_DIR = Path("src/backend/base/kozmoai/components/docs")

def read_file(file_path: Path) -> Optional[str]:
    """Read a file and return its content."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None

def extract_title_from_mdx(content: str) -> str:
    """Extract title from MDX frontmatter."""
    match = re.search(r'^---\s*\ntitle:\s*(.+?)\s*\n', content, re.MULTILINE)
    return match.group(1) if match else ""

def clean_description(text: str) -> str:
    """Clean and format description text."""
    # Remove MDX imports and components
    text = re.sub(r'^import .*?;?\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # Remove multiple newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def extract_main_description(content: str) -> str:
    """Extract the main description from MDX content."""
    # Remove frontmatter
    content = re.sub(r'^---.*?---\s*', '', content, flags=re.DOTALL)
    
    # Find content between first header and first table/next section
    lines = content.split('\n')
    desc_lines = []
    started = False
    
    for line in lines:
        if line.startswith('##'):
            if started:
                break
            started = True
            continue
        
        if started and line.strip() and not line.startswith('|') and not line.startswith('<') and not line.startswith('import'):
            desc_lines.append(line.strip())
            if len(desc_lines) >= 5:
                break
    
    return clean_description(' '.join(desc_lines))

def extract_parameters_from_table(content: str) -> List[Dict[str, str]]:
    """Extract parameters from markdown tables."""
    params = []
    
    # Find all tables
    table_pattern = r'\|[^\n]+\|\s*\n\|[-:\s|]+\|\s*\n((?:\|[^\n]+\|\s*\n)+)'
    matches = re.finditer(table_pattern, content)
    
    for match in matches:
        table_content = match.group(0)
        
        # Check if this is a parameters table
        if 'Name' not in table_content or 'Type' not in table_content:
            continue
        
        rows = table_content.strip().split('\n')[2:]  # Skip header and separator
        
        for row in rows:
            cells = [cell.strip() for cell in row.split('|')[1:-1]]
            if len(cells) >= 3:
                params.append({
                    'name': cells[0],
                    'type': cells[1],
                    'description': cells[2] if len(cells) > 2 else ''
                })
    
    return params

# Component mappings with categories
COMPONENT_MAP = {
    # Models
    'openai': {'file': 'openai_model', 'category': 'models', 'display': 'OpenAI'},
    'anthropic': {'file': 'anthropic_model', 'category': 'models', 'display': 'Anthropic'},
    'google': {'file': 'google_generative_ai_model', 'category': 'models', 'display': 'Google Generative AI'},
    'azure': {'file': 'azure_openai_model', 'category': 'models', 'display': 'Azure OpenAI'},
    'ollama': {'file': 'ollama_model', 'category': 'models', 'display': 'Ollama'},
    'groq': {'file': 'groq_model', 'category': 'models', 'display': 'Groq'},
    'mistralai': {'file': 'mistral_model', 'category': 'models', 'display': 'Mistral AI'},
    'cohere': {'file': 'cohere_model', 'category': 'models', 'display': 'Cohere'},
    'huggingface': {'file': 'huggingface_model', 'category': 'models', 'display': 'Hugging Face'},
    'deepseek': {'file': 'deepseek_model', 'category': 'models', 'display': 'DeepSeek'},
    'perplexity': {'file': 'perplexity_model', 'category': 'models', 'display': 'Perplexity'},
    'sambanova': {'file': 'sambanova_model', 'category': 'models', 'display': 'SambaNova'},
    'nvidia': {'file': 'nvidia_model', 'category': 'models', 'display': 'NVIDIA'},
    'vertexai': {'file': 'vertexai_model', 'category': 'models', 'display': 'Vertex AI'},
    'amazon': {'file': 'amazon_bedrock_model', 'category': 'models', 'display': 'Amazon Bedrock'},
    'lmstudio': {'file': 'lmstudio_model', 'category': 'models', 'display': 'LM Studio'},
    'novita': {'file': 'novita_model', 'category': 'models', 'display': 'Novita'},
    'openrouter': {'file': 'openrouter_model', 'category': 'models', 'display': 'OpenRouter'},
    'maritalk': {'file': 'maritalk_model', 'category': 'models', 'display': 'MariTalk'},
    'baidu': {'file': 'baidu_qianfan_model', 'category': 'models', 'display': 'Baidu Qianfan'},
    'aiml': {'file': 'aiml_model', 'category': 'models', 'display': 'AI/ML API'},
    
    # Vector Stores
    'qdrant': {'file': 'qdrant', 'category': 'vector_stores', 'display': 'Qdrant'},
    'pinecone': {'file': 'pinecone', 'category': 'vector_stores', 'display': 'Pinecone'},
    'chroma': {'file': 'chroma', 'category': 'vector_stores', 'display': 'Chroma'},
    'weaviate': {'file': 'weaviate', 'category': 'vector_stores', 'display': 'Weaviate'},
    'milvus': {'file': 'milvus', 'category': 'vector_stores', 'display': 'Milvus'},
    'faiss': {'file': 'faiss', 'category': 'vector_stores', 'display': 'FAISS'},
    'pgvector': {'file': 'pgvector', 'category': 'vector_stores', 'display': 'PGVector'},
    'redis': {'file': 'redis', 'category': 'vector_stores', 'display': 'Redis'},
    'elastic': {'file': 'elasticsearch', 'category': 'vector_stores', 'display': 'Elasticsearch'},
    'mongodb': {'file': 'mongodb_atlas', 'category': 'vector_stores', 'display': 'MongoDB Atlas'},
    'supabase': {'file': 'supabase', 'category': 'vector_stores', 'display': 'Supabase'},
    'clickhouse': {'file': 'clickhouse', 'category': 'vector_stores', 'display': 'ClickHouse'},
    'couchbase': {'file': 'couchbase', 'category': 'vector_stores', 'display': 'Couchbase'},
    'upstash': {'file': 'upstash', 'category': 'vector_stores', 'display': 'Upstash'},
    'vectara': {'file': 'vectara', 'category': 'vector_stores', 'display': 'Vectara'},
    'datastax': {'file': 'astradb', 'category': 'vector_stores', 'display': 'Astra DB'},
}

def create_comprehensive_yaml(bundle_name: str, mdx_content: str, component_info: Dict) -> Dict[str, Any]:
    """Create comprehensive YAML documentation."""
    
    title = extract_title_from_mdx(mdx_content)
    description = extract_main_description(mdx_content)
    parameters = extract_parameters_from_table(mdx_content)
    
    # Build YAML structure
    yaml_data = {
        'component_name': component_info['display'].replace(' ', ''),
        'display_name': component_info['display'],
        'category': component_info['category'],
        'version': '1.0.0',
        'overview': {
            'summary': f"Use {component_info['display']} for AI and data tasks",
            'description': description or f"The {component_info['display']} component provides integration with {component_info['display']} services."
        }
    }
    
    # Add features based on content
    features = []
    if 'vector' in mdx_content.lower() or component_info['category'] == 'vector_stores':
        features.extend([
            "High-performance vector storage and retrieval",
            "Semantic search capabilities",
            "Scalable architecture",
            "Integration with embedding models"
        ])
    elif component_info['category'] == 'models':
        features.extend([
            "Advanced language model capabilities",
            "Flexible configuration options",
            "Support for various use cases",
            "High-quality text generation"
        ])
    
    if features:
        yaml_data['features'] = features
    
    # Add inputs from parameters
    if parameters:
        yaml_data['inputs'] = {}
        for param in parameters[:10]:  # Limit to first 10 params
            param_key = param['name'].lower().replace(' ', '_').replace('-', '_')
            yaml_data['inputs'][param_key] = {
                'display_name': param['name'],
                'type': param['type'],
                'description': clean_description(param['description'])
            }
    
    # Add outputs
    if component_info['category'] == 'models':
        yaml_data['outputs'] = {
            'language_model': {
                'display_name': 'Language Model',
                'type': 'LanguageModel',
                'description': 'Configured language model ready for use'
            }
        }
    elif component_info['category'] == 'vector_stores':
        yaml_data['outputs'] = {
            'vector_store': {
                'display_name': 'Vector Store',
                'type': 'VectorStore',
                'description': 'Configured vector store instance'
            }
        }
    
    # Add examples
    yaml_data['examples'] = [
        {
            'title': f"Basic {component_info['display']} Setup",
            'description': f"Standard configuration for {component_info['display']}",
            'use_case': "General purpose usage"
        }
    ]
    
    # Add external links
    yaml_data['external_links'] = []
    
    # Extract URLs from content
    url_pattern = r'\[([^\]]+)\]\((https?://[^\)]+)\)'
    urls = re.findall(url_pattern, mdx_content)
    for title, url in urls[:5]:  # Limit to 5 links
        if 'documentation' in title.lower() or 'docs' in url:
            yaml_data['external_links'].append({
                'title': clean_description(title),
                'url': url
            })
    
    return yaml_data

def main():
    """Main enrichment function."""
    print("Starting comprehensive documentation enrichment...")
    print(f"Reading from: {DOCS_DIR}")
    print(f"Writing to: {YAML_DIR}")
    
    bundle_files = list(DOCS_DIR.glob("bundles-*.mdx"))
    print(f"\nFound {len(bundle_files)} bundle files")
    
    enriched = 0
    skipped = 0
    
    for bundle_file in sorted(bundle_files):
        bundle_key = bundle_file.stem.replace('bundles-', '')
        
        if bundle_key not in COMPONENT_MAP:
            print(f"⊘ Skipped: {bundle_key} (no mapping)")
            skipped += 1
            continue
        
        content = read_file(bundle_file)
        if not content:
            continue
        
        component_info = COMPONENT_MAP[bundle_key]
        yaml_file = YAML_DIR / f"{component_info['file']}.yaml"
        
        try:
            yaml_data = create_comprehensive_yaml(bundle_key, content, component_info)
            
            with open(yaml_file, 'w', encoding='utf-8') as f:
                yaml.dump(yaml_data, f, default_flow_style=False, allow_unicode=True, sort_keys=False, width=120)
            
            print(f"✓ Enriched: {component_info['display']:30} -> {component_info['file']}.yaml")
            enriched += 1
            
        except Exception as e:
            print(f"✗ Error: {component_info['display']:30} - {e}")
    
    print(f"\n{'='*70}")
    print(f"Enrichment Complete!")
    print(f"  Enriched: {enriched}")
    print(f"  Skipped:  {skipped}")
    print(f"  Total:    {len(bundle_files)}")
    print(f"{'='*70}")

if __name__ == "__main__":
    main()
