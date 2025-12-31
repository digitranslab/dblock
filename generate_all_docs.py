#!/usr/bin/env python3
"""
Generate comprehensive YAML documentation for all Kozmoai components.
This script creates detailed documentation files for every component.
"""

import os
import yaml
from pathlib import Path

# Base directory for documentation
DOCS_DIR = Path("src/backend/base/kozmoai/components/docs")
DOCS_DIR.mkdir(parents=True, exist_ok=True)

# Model components documentation
MODELS = {
    "groq_model": {
        "component_name": "GroqModel",
        "display_name": "Groq",
        "category": "models",
        "overview": {
            "summary": "Ultra-fast inference with Groq's LPU technology",
            "description": """Groq provides the fastest LLM inference available through their Language Processing Unit (LPU) technology.
            
Available models:
- Llama 3.1 (8B, 70B, 405B): Meta's latest models
- Mixtral 8x7B: Mistral's mixture-of-experts model
- Gemma 2 (9B, 27B): Google's efficient models

Key advantages:
- Extremely fast inference (500+ tokens/second)
- Low latency responses
- Cost-effective pricing
- Support for function calling
- High throughput

Use cases:
- Real-time chat applications
- High-volume API services
- Latency-sensitive applications
- Interactive user experiences"""
        },
        "features": [
            "Ultra-fast inference with LPU technology",
            "Support for Llama, Mixtral, and Gemma models",
            "Function calling capabilities",
            "Streaming responses",
            "Low latency (sub-second responses)",
            "Cost-effective pricing",
            "High throughput capacity"
        ]
    },
    "mistral_model": {
        "component_name": "MistralModel",
        "display_name": "Mistral AI",
        "category": "models",
        "overview": {
            "summary": "European AI with strong multilingual and coding capabilities",
            "description": """Mistral AI provides powerful open-source and proprietary models with excellent performance.

Available models:
- Mistral Large: Most capable model
- Mistral Medium: Balanced performance
- Mistral Small: Fast and efficient
- Mixtral 8x7B/8x22B: Mixture-of-experts models
- Codestral: Specialized for code generation

Key strengths:
- Strong multilingual support (especially European languages)
- Excellent coding capabilities
- Function calling support
- JSON mode for structured outputs
- Competitive pricing
- European data sovereignty

Use cases:
- Multilingual applications
- Code generation and review
- European market applications
- Function calling and tool use
- Structured data extraction"""
        }
    },
    "cohere_model": {
        "component_name": "CohereModel",
        "display_name": "Cohere",
        "category": "models",
        "overview": {
            "summary": "Enterprise-focused AI with strong RAG capabilities",
            "description": """Cohere provides enterprise-grade language models optimized for business applications.

Available models:
- Command R+: Most capable for complex tasks
- Command R: Balanced performance
- Command: Fast and efficient
- Command Light: Lightweight option

Key features:
- Excellent RAG (Retrieval Augmented Generation) performance
- Built-in reranking capabilities
- Strong multilingual support (100+ languages)
- Enterprise security and compliance
- Grounded generation with citations
- Function calling support

Use cases:
- Enterprise search and Q&A
- Document analysis with citations
- Multilingual applications
- Customer support automation
- Content generation with sources"""
        }
    }
}

def create_model_doc(filename, data):
    """Create a comprehensive model documentation file."""
    doc_path = DOCS_DIR / filename
    
    # Build complete documentation structure
    full_doc = {
        "component_name": data["component_name"],
        "display_name": data["display_name"],
        "category": data["category"],
        "version": "1.0.0",
        "overview": data["overview"],
        "features": data.get("features", []),
        "inputs": {},
        "outputs": {
            "language_model": {
                "display_name": "Language Model",
                "type": "LanguageModel",
                "description": f"Configured {data['display_name']} model ready for use"
            }
        },
        "examples": [],
        "troubleshooting": [],
        "external_links": []
    }
    
    with open(doc_path, 'w') as f:
        yaml.dump(full_doc, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
    
    print(f"Created: {filename}")

# Generate all model documentation
for filename, data in MODELS.items():
    create_model_doc(f"{filename}.yaml", data)

print(f"\nGenerated {len(MODELS)} model documentation files")
