#!/bin/bash
# Batch create all component documentation files

DOCS_DIR="src/backend/base/kozmoai/components/docs"

# Create documentation for all model components
cat > "$DOCS_DIR/cohere_model.yaml" << 'EOF'
component_name: "CohereModel"
display_name: "Cohere"
category: "models"
version: "1.0.0"
overview:
  summary: "Enterprise AI with excellent RAG and reranking"
  description: |
    Cohere provides enterprise-grade models optimized for RAG and business applications.
    Strong multilingual support (100+ languages) and built-in reranking.
features:
  - "Excellent RAG performance"
  - "Built-in reranking"
  - "100+ languages supported"
  - "Enterprise security"
  - "Grounded generation with citations"
inputs:
  cohere_api_key:
    display_name: "Cohere API Key"
    type: "SecretStr"
    required: true
outputs:
  language_model:
    display_name: "Language Model"
    type: "LanguageModel"
external_links:
  - title: "Cohere Dashboard"
    url: "https://dashboard.cohere.com/"
EOF

cat > "$DOCS_DIR/huggingface_model.yaml" << 'EOF'
component_name: "HuggingFaceModel"
display_name: "Hugging Face"
category: "models"
version: "1.0.0"
overview:
  summary: "Access thousands of open-source models"
  description: |
    Hugging Face provides access to the largest collection of open-source AI models.
    Use hosted inference API or run models locally.
features:
  - "Access to 100,000+ models"
  - "Hosted inference API"
  - "Local model support"
  - "Open-source models"
  - "Community-driven"
inputs:
  huggingfacehub_api_token:
    display_name: "API Token"
    type: "SecretStr"
    required: true
outputs:
  language_model:
    display_name: "Language Model"
    type: "LanguageModel"
external_links:
  - title: "Hugging Face Hub"
    url: "https://huggingface.co/"
EOF

echo "Created model documentation files"
