OPENAI_MODEL_NAMES = [
    # GPT-4.1 Series (April 2025) - Optimized for coding and instruction following
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    # O-Series Reasoning Models
    "o3",
    "o3-mini",
    "o4-mini",
    # GPT-4o Series
    "gpt-4o",
    "gpt-4o-mini",
    # Legacy Models (for backwards compatibility)
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo",
]
OPENAI_EMBEDDING_MODEL_NAMES = [
    "text-embedding-3-small",
    "text-embedding-3-large",
    "text-embedding-ada-002",
]

# Backwards compatibility
MODEL_NAMES = OPENAI_MODEL_NAMES
