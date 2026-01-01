GROQ_MODELS = [
    # Production Models
    "llama-3.3-70b-versatile",  # Meta - Recommended
    "llama-3.1-8b-instant",  # Meta - Fast
    "meta-llama/llama-guard-4-12b",  # Meta - Safety
    "openai/gpt-oss-120b",  # OpenAI Open Source
    "openai/gpt-oss-20b",  # OpenAI Open Source - Fast
    # Preview Models
    "meta-llama/llama-4-maverick-17b-128e-instruct",  # Meta Llama 4
    "meta-llama/llama-4-scout-17b-16e-instruct",  # Meta Llama 4
    "qwen/qwen3-32b",  # Qwen
    "moonshotai/kimi-k2-instruct-0905",  # Moonshot
    # Compound Systems
    "groq/compound",  # Groq Compound AI System
    "groq/compound-mini",  # Groq Compound Mini
    # Audio Models
    "whisper-large-v3",  # OpenAI
    "whisper-large-v3-turbo",  # OpenAI
]
MODEL_NAMES = GROQ_MODELS  # reverse compatibility
