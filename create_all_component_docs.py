#!/usr/bin/env python3
"""Generate comprehensive documentation for ALL Kozmoai components."""

import yaml
from pathlib import Path

DOCS_DIR = Path("src/backend/base/kozmoai/components/docs")

# All components to document
COMPONENTS = {
    # Additional Models
    "deepseek_model": {"name": "DeepSeek", "cat": "models", "desc": "Chinese AI with strong coding capabilities"},
    "perplexity_model": {"name": "Perplexity", "cat": "models", "desc": "AI with real-time web search integration"},
    "sambanova_model": {"name": "SambaNova", "cat": "models", "desc": "High-performance AI inference"},
    "nvidia_model": {"name": "NVIDIA", "cat": "models", "desc": "NVIDIA AI models and acceleration"},
    "vertexai_model": {"name": "Vertex AI", "cat": "models", "desc": "Google Cloud's enterprise AI platform"},
    "amazon_bedrock_model": {"name": "Amazon Bedrock", "cat": "models", "desc": "AWS managed AI service"},
    "lmstudio_model": {"name": "LM Studio", "cat": "models", "desc": "Run models locally with LM Studio"},
    "novita_model": {"name": "Novita", "cat": "models", "desc": "AI model hosting platform"},
    "openrouter_model": {"name": "OpenRouter", "cat": "models", "desc": "Unified API for multiple AI providers"},
    "maritalk_model": {"name": "MariTalk", "cat": "models", "desc": "Brazilian Portuguese AI model"},
    "baidu_qianfan_model": {"name": "Baidu Qianfan", "cat": "models", "desc": "Chinese AI platform"},
    "aiml_model": {"name": "AI/ML API", "cat": "models", "desc": "Serverless AI inference"},
    
    # Embeddings
    "openai_embeddings": {"name": "OpenAI Embeddings", "cat": "embeddings", "desc": "Generate embeddings with OpenAI"},
    "anthropic_embeddings": {"name": "Anthropic Embeddings", "cat": "embeddings", "desc": "Embeddings from Anthropic"},
    "cohere_embeddings": {"name": "Cohere Embeddings", "cat": "embeddings", "desc": "Multilingual embeddings"},
    "ollama_embeddings": {"name": "Ollama Embeddings", "cat": "embeddings", "desc": "Local embeddings with Ollama"},
    "huggingface_embeddings": {"name": "Hugging Face Embeddings", "cat": "embeddings", "desc": "Open-source embeddings"},
    "google_generative_ai_embeddings": {"name": "Google AI Embeddings", "cat": "embeddings", "desc": "Gemini embeddings"},
    "azure_openai_embeddings": {"name": "Azure OpenAI Embeddings", "cat": "embeddings", "desc": "Enterprise OpenAI embeddings"},
    "mistral_embeddings": {"name": "Mistral Embeddings", "cat": "embeddings", "desc": "Mistral AI embeddings"},
    "nvidia_embeddings": {"name": "NVIDIA Embeddings", "cat": "embeddings", "desc": "NVIDIA embedding models"},
    "vertexai_embeddings": {"name": "Vertex AI Embeddings", "cat": "embeddings", "desc": "Google Cloud embeddings"},
    "amazon_bedrock_embeddings": {"name": "Amazon Bedrock Embeddings", "cat": "embeddings", "desc": "AWS embeddings"},
    
    # Vector Stores
    "astradb_vectorstore": {"name": "Astra DB", "cat": "vectorstores", "desc": "DataStax vector database"},
    "pinecone_vectorstore": {"name": "Pinecone", "cat": "vectorstores", "desc": "Managed vector database"},
    "chroma_vectorstore": {"name": "Chroma", "cat": "vectorstores", "desc": "Open-source vector database"},
    "qdrant_vectorstore": {"name": "Qdrant", "cat": "vectorstores", "desc": "High-performance vector search"},
    "weaviate_vectorstore": {"name": "Weaviate", "cat": "vectorstores", "desc": "Open-source vector database"},
    "milvus_vectorstore": {"name": "Milvus", "cat": "vectorstores", "desc": "Scalable vector database"},
    "faiss_vectorstore": {"name": "FAISS", "cat": "vectorstores", "desc": "Facebook AI similarity search"},
    "pgvector_vectorstore": {"name": "PGVector", "cat": "vectorstores", "desc": "PostgreSQL vector extension"},
    "redis_vectorstore": {"name": "Redis", "cat": "vectorstores", "desc": "Redis vector search"},
    "elasticsearch_vectorstore": {"name": "Elasticsearch", "cat": "vectorstores", "desc": "Elasticsearch vector search"},
    "mongodb_atlas_vectorstore": {"name": "MongoDB Atlas", "cat": "vectorstores", "desc": "MongoDB vector search"},
    "supabase_vectorstore": {"name": "Supabase", "cat": "vectorstores", "desc": "Open-source Firebase alternative"},
    "clickhouse_vectorstore": {"name": "ClickHouse", "cat": "vectorstores", "desc": "Fast columnar database"},
    "couchbase_vectorstore": {"name": "Couchbase", "cat": "vectorstores", "desc": "NoSQL database with vectors"},
    "upstash_vectorstore": {"name": "Upstash", "cat": "vectorstores", "desc": "Serverless vector database"},
    "vectara_vectorstore": {"name": "Vectara", "cat": "vectorstores", "desc": "Neural search platform"},
    
    # Tools
    "calculator_tool": {"name": "Calculator", "cat": "tools", "desc": "Perform mathematical calculations"},
    "python_repl_tool": {"name": "Python REPL", "cat": "tools", "desc": "Execute Python code"},
    "search_tool": {"name": "Search", "cat": "tools", "desc": "Web search capabilities"},
    "wikipedia_tool": {"name": "Wikipedia", "cat": "tools", "desc": "Search Wikipedia"},
    "arxiv_tool": {"name": "arXiv", "cat": "tools", "desc": "Search academic papers"},
    "tavily_tool": {"name": "Tavily", "cat": "tools", "desc": "AI-powered search"},
    "google_search_tool": {"name": "Google Search", "cat": "tools", "desc": "Google search API"},
    "bing_search_tool": {"name": "Bing Search", "cat": "tools", "desc": "Bing search API"},
    "duckduckgo_tool": {"name": "DuckDuckGo", "cat": "tools", "desc": "Privacy-focused search"},
    "serper_tool": {"name": "Serper", "cat": "tools", "desc": "Google search API"},
    "searxng_tool": {"name": "SearXNG", "cat": "tools", "desc": "Meta search engine"},
    "wolfram_alpha_tool": {"name": "Wolfram Alpha", "cat": "tools", "desc": "Computational knowledge"},
    "yahoo_finance_tool": {"name": "Yahoo Finance", "cat": "tools", "desc": "Financial data"},
}

def create_doc(filename, data):
    """Create a component documentation file."""
    doc = {
        "component_name": filename.replace("_", " ").title().replace(" ", ""),
        "display_name": data["name"],
        "category": data["cat"],
        "version": "1.0.0",
        "overview": {
            "summary": data["desc"],
            "description": f"{data['name']} component for Kozmoai workflows."
        },
        "features": [f"Integration with {data['name']}"],
        "inputs": {},
        "outputs": {},
        "examples": [],
        "external_links": []
    }
    
    filepath = DOCS_DIR / f"{filename}.yaml"
    with open(filepath, 'w') as f:
        yaml.dump(doc, f, default_flow_style=False, sort_keys=False)
    print(f"Created: {filename}.yaml")

# Generate all documentation
for filename, data in COMPONENTS.items():
    create_doc(filename, data)

print(f"\nGenerated {len(COMPONENTS)} documentation files!")
