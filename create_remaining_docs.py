#!/usr/bin/env python3
"""Generate documentation for ALL remaining Kozmoai components."""

import yaml
from pathlib import Path

DOCS_DIR = Path("src/backend/base/kozmoai/components/docs")

# ALL remaining components
COMPONENTS = {
    # Data Components
    "api_request": {"name": "API Request", "cat": "data", "desc": "Make HTTP API requests"},
    "csv_to_data": {"name": "CSV to Data", "cat": "data", "desc": "Load data from CSV files"},
    "json_to_data": {"name": "JSON to Data", "cat": "data", "desc": "Parse JSON data"},
    "directory": {"name": "Directory", "cat": "data", "desc": "Load files from directory"},
    "file": {"name": "File", "cat": "data", "desc": "Load file content"},
    "url": {"name": "URL", "cat": "data", "desc": "Fetch content from URL"},
    "webhook": {"name": "Webhook", "cat": "data", "desc": "Receive webhook data"},
    "sql_executor": {"name": "SQL Executor", "cat": "data", "desc": "Execute SQL queries"},
    
    # Processing Components
    "split_text": {"name": "Split Text", "cat": "processing", "desc": "Split text into chunks"},
    "combine_text": {"name": "Combine Text", "cat": "processing", "desc": "Merge text pieces"},
    "parse_data": {"name": "Parse Data", "cat": "processing", "desc": "Parse structured data"},
    "filter_data": {"name": "Filter Data", "cat": "processing", "desc": "Filter data by conditions"},
    "merge_data": {"name": "Merge Data", "cat": "processing", "desc": "Combine multiple data sources"},
    "extract_key": {"name": "Extract Key", "cat": "processing", "desc": "Extract specific data fields"},
    "json_cleaner": {"name": "JSON Cleaner", "cat": "processing", "desc": "Clean and format JSON"},
    "parse_json_data": {"name": "Parse JSON", "cat": "processing", "desc": "Parse JSON strings"},
    "message_to_data": {"name": "Message to Data", "cat": "processing", "desc": "Convert messages to data"},
    "create_data": {"name": "Create Data", "cat": "processing", "desc": "Create data objects"},
    "update_data": {"name": "Update Data", "cat": "processing", "desc": "Modify data fields"},
    "select_data": {"name": "Select Data", "cat": "processing", "desc": "Select specific data"},
    "alter_metadata": {"name": "Alter Metadata", "cat": "processing", "desc": "Modify data metadata"},
    "dataframe_operations": {"name": "DataFrame Operations", "cat": "processing", "desc": "Pandas operations"},
    "parse_dataframe": {"name": "Parse DataFrame", "cat": "processing", "desc": "Parse DataFrame data"},
    "llm_router": {"name": "LLM Router", "cat": "processing", "desc": "Route to different LLMs"},
    "filter_data_values": {"name": "Filter Data Values", "cat": "processing", "desc": "Filter by values"},
    
    # Logic Components
    "conditional_router": {"name": "Conditional Router", "cat": "logic", "desc": "Route based on conditions"},
    "data_conditional_router": {"name": "Data Router", "cat": "logic", "desc": "Route data conditionally"},
    "flow_tool": {"name": "Flow Tool", "cat": "logic", "desc": "Execute flow as tool"},
    "listen": {"name": "Listen", "cat": "logic", "desc": "Listen for events"},
    "loop": {"name": "Loop", "cat": "logic", "desc": "Loop through items"},
    "notify": {"name": "Notify", "cat": "logic", "desc": "Send notifications"},
    "pass_message": {"name": "Pass Message", "cat": "logic", "desc": "Pass messages through"},
    "run_flow": {"name": "Run Flow", "cat": "logic", "desc": "Execute another flow"},
    "sub_flow": {"name": "Sub Flow", "cat": "logic", "desc": "Embed sub-flows"},
    
    # Helper Components
    "memory": {"name": "Memory", "cat": "helpers", "desc": "Store conversation memory"},
    "output_parser": {"name": "Output Parser", "cat": "helpers", "desc": "Parse LLM outputs"},
    "structured_output": {"name": "Structured Output", "cat": "helpers", "desc": "Format structured data"},
    "store_message": {"name": "Store Message", "cat": "helpers", "desc": "Store messages"},
    "create_list": {"name": "Create List", "cat": "helpers", "desc": "Create data lists"},
    "current_date": {"name": "Current Date", "cat": "helpers", "desc": "Get current date/time"},
    "id_generator": {"name": "ID Generator", "cat": "helpers", "desc": "Generate unique IDs"},
    "batch_run": {"name": "Batch Run", "cat": "helpers", "desc": "Run operations in batch"},
    
    # Input/Output Components
    "chat_input": {"name": "Chat Input", "cat": "inputs", "desc": "Receive chat messages"},
    "text_input": {"name": "Text Input", "cat": "inputs", "desc": "Receive text input"},
    "chat_output": {"name": "Chat Output", "cat": "outputs", "desc": "Send chat responses"},
    "text_output": {"name": "Text Output", "cat": "outputs", "desc": "Output text"},
    
    # Prompt Components
    "prompt": {"name": "Prompt", "cat": "prompts", "desc": "Create prompt templates"},
    
    # Agent Components
    "agent": {"name": "Agent", "cat": "agents", "desc": "AI agent with tools"},
    
    # Memory Components
    "astra_db_memory": {"name": "Astra DB Memory", "cat": "memories", "desc": "Astra DB chat memory"},
    "cassandra_memory": {"name": "Cassandra Memory", "cat": "memories", "desc": "Cassandra chat memory"},
    "redis_memory": {"name": "Redis Memory", "cat": "memories", "desc": "Redis chat memory"},
    "zep_memory": {"name": "Zep Memory", "cat": "memories", "desc": "Zep chat memory"},
    "mem0_memory": {"name": "Mem0 Memory", "cat": "memories", "desc": "Mem0 chat memory"},
    
    # Document Loaders
    "unstructured": {"name": "Unstructured", "cat": "documentloaders", "desc": "Load unstructured documents"},
    
    # YouTube Components
    "youtube_transcripts": {"name": "YouTube Transcripts", "cat": "youtube", "desc": "Get video transcripts"},
    "youtube_search": {"name": "YouTube Search", "cat": "youtube", "desc": "Search YouTube videos"},
    "youtube_video_details": {"name": "YouTube Details", "cat": "youtube", "desc": "Get video information"},
    "youtube_channel": {"name": "YouTube Channel", "cat": "youtube", "desc": "Get channel info"},
    "youtube_playlist": {"name": "YouTube Playlist", "cat": "youtube", "desc": "Get playlist videos"},
    "youtube_comments": {"name": "YouTube Comments", "cat": "youtube", "desc": "Get video comments"},
    "youtube_trending": {"name": "YouTube Trending", "cat": "youtube", "desc": "Get trending videos"},
    
    # Google Components
    "gmail": {"name": "Gmail", "cat": "google", "desc": "Access Gmail"},
    "google_drive": {"name": "Google Drive", "cat": "google", "desc": "Access Google Drive"},
    "google_drive_search": {"name": "Drive Search", "cat": "google", "desc": "Search Google Drive"},
    "google_oauth_token": {"name": "Google OAuth", "cat": "google", "desc": "Google authentication"},
    
    # Notion Components
    "notion_create_page": {"name": "Create Page", "cat": "Notion", "desc": "Create Notion page"},
    "notion_add_content": {"name": "Add Content", "cat": "Notion", "desc": "Add content to page"},
    "notion_list_pages": {"name": "List Pages", "cat": "Notion", "desc": "List Notion pages"},
    "notion_search": {"name": "Search", "cat": "Notion", "desc": "Search Notion"},
    "notion_page_viewer": {"name": "Page Viewer", "cat": "Notion", "desc": "View page content"},
    "notion_update_property": {"name": "Update Property", "cat": "Notion", "desc": "Update page property"},
    "notion_list_users": {"name": "List Users", "cat": "Notion", "desc": "List workspace users"},
    "notion_list_database": {"name": "List Database", "cat": "Notion", "desc": "List database properties"},
    
    # Git Components
    "git": {"name": "Git", "cat": "git", "desc": "Git operations"},
    "git_extractor": {"name": "Git Extractor", "cat": "git", "desc": "Extract from Git repos"},
    
    # Firecrawl Components
    "firecrawl_scrape": {"name": "Firecrawl Scrape", "cat": "firecrawl", "desc": "Scrape web pages"},
    "firecrawl_crawl": {"name": "Firecrawl Crawl", "cat": "firecrawl", "desc": "Crawl websites"},
    
    # AssemblyAI Components
    "assemblyai_transcript": {"name": "Start Transcript", "cat": "assemblyai", "desc": "Transcribe audio"},
    "assemblyai_poll": {"name": "Poll Transcript", "cat": "assemblyai", "desc": "Check transcript status"},
    "assemblyai_subtitles": {"name": "Get Subtitles", "cat": "assemblyai", "desc": "Generate subtitles"},
    "assemblyai_lemur": {"name": "LeMUR", "cat": "assemblyai", "desc": "AI analysis of audio"},
    "assemblyai_list": {"name": "List Transcripts", "cat": "assemblyai", "desc": "List all transcripts"},
    
    # Cohere Rerank
    "cohere_rerank": {"name": "Cohere Rerank", "cat": "cohere", "desc": "Rerank search results"},
    
    # NVIDIA Rerank
    "nvidia_rerank": {"name": "NVIDIA Rerank", "cat": "nvidia", "desc": "NVIDIA reranking"},
    
    # Retrievers
    "amazon_kendra": {"name": "Amazon Kendra", "cat": "retrievers", "desc": "AWS enterprise search"},
    "metal": {"name": "Metal", "cat": "retrievers", "desc": "Metal retriever"},
    "multi_query": {"name": "Multi Query", "cat": "retrievers", "desc": "Multiple query retrieval"},
    
    # Custom Component
    "custom_component": {"name": "Custom Component", "cat": "custom_component", "desc": "Create custom components"},
    
    # Prototypes
    "python_function": {"name": "Python Function", "cat": "prototypes", "desc": "Execute Python functions"},
    
    # Confluence
    "confluence": {"name": "Confluence", "cat": "confluence", "desc": "Access Confluence"},
    
    # Composio
    "composio_api": {"name": "Composio", "cat": "composio", "desc": "Composio integrations"},
    
    # AgentQL
    "agentql_api": {"name": "AgentQL", "cat": "agentql", "desc": "AgentQL queries"},
    
    # LangWatch
    "langwatch": {"name": "LangWatch", "cat": "langwatch", "desc": "Monitor LLM applications"},
    
    # NotDiamond
    "notdiamond": {"name": "NotDiamond", "cat": "notdiamond", "desc": "NotDiamond routing"},
    
    # Needle
    "needle": {"name": "Needle", "cat": "needle", "desc": "Needle search"},
    
    # ScrapeGraph
    "scrapegraph_scraper": {"name": "Smart Scraper", "cat": "scrapegraph", "desc": "AI-powered scraping"},
    "scrapegraph_markdownify": {"name": "Markdownify", "cat": "scrapegraph", "desc": "Convert to Markdown"},
    
    # CrewAI
    "crewai": {"name": "CrewAI", "cat": "crewai", "desc": "Multi-agent orchestration"},
    "sequential_crew": {"name": "Sequential Crew", "cat": "crewai", "desc": "Sequential task execution"},
    "hierarchical_crew": {"name": "Hierarchical Crew", "cat": "crewai", "desc": "Hierarchical agents"},
    "sequential_task": {"name": "Sequential Task", "cat": "crewai", "desc": "Define sequential task"},
    "hierarchical_task": {"name": "Hierarchical Task", "cat": "crewai", "desc": "Define hierarchical task"},
    "sequential_task_agent": {"name": "Task Agent", "cat": "crewai", "desc": "Agent for tasks"},
    
    # Astra Assistants
    "astra_assistant_manager": {"name": "Assistant Manager", "cat": "astra_assistants", "desc": "Manage assistants"},
    "create_assistant": {"name": "Create Assistant", "cat": "astra_assistants", "desc": "Create new assistant"},
    "get_assistant": {"name": "Get Assistant", "cat": "astra_assistants", "desc": "Retrieve assistant"},
    "list_assistants": {"name": "List Assistants", "cat": "astra_assistants", "desc": "List all assistants"},
    "create_thread": {"name": "Create Thread", "cat": "astra_assistants", "desc": "Create conversation thread"},
    "run": {"name": "Run", "cat": "astra_assistants", "desc": "Run assistant"},
    
    # MCP Tools
    "mcp_stdio": {"name": "MCP STDIO", "cat": "tools", "desc": "Model Context Protocol STDIO"},
    "mcp_sse": {"name": "MCP SSE", "cat": "tools", "desc": "Model Context Protocol SSE"},
    
    # Additional Tools
    "python_code_structured_tool": {"name": "Python Structured Tool", "cat": "tools", "desc": "Structured Python execution"},
    "astradb_tool": {"name": "Astra DB Tool", "cat": "tools", "desc": "Query Astra DB"},
    "astradb_cql_tool": {"name": "Astra CQL Tool", "cat": "tools", "desc": "Execute CQL queries"},
    "exa_search": {"name": "Exa Search", "cat": "tools", "desc": "Exa AI search"},
    "glean_search": {"name": "Glean Search", "cat": "tools", "desc": "Enterprise search"},
    "search_api": {"name": "Search API", "cat": "tools", "desc": "Generic search API"},
    "serp_api": {"name": "SERP API", "cat": "tools", "desc": "Search engine results"},
    "wikidata": {"name": "Wikidata", "cat": "tools", "desc": "Query Wikidata"},
    "wikidata_api": {"name": "Wikidata API", "cat": "tools", "desc": "Wikidata API access"},
    "wikipedia_api": {"name": "Wikipedia API", "cat": "tools", "desc": "Wikipedia API access"},
    "yahoo": {"name": "Yahoo", "cat": "tools", "desc": "Yahoo services"},
    "google_search_api_core": {"name": "Google Search Core", "cat": "tools", "desc": "Core Google search"},
    "google_serper_api_core": {"name": "Serper Core", "cat": "tools", "desc": "Core Serper API"},
    "calculator_core": {"name": "Calculator Core", "cat": "tools", "desc": "Core calculator"},
    "python_repl_core": {"name": "Python REPL Core", "cat": "tools", "desc": "Core Python REPL"},
    
    # Icosa Computing
    "combinatorial_reasoner": {"name": "Combinatorial Reasoner", "cat": "icosacomputing", "desc": "Advanced reasoning"},
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
            "description": f"{data['name']} component for Kozmoai workflows. {data['desc']}."
        },
        "features": [
            f"Integration with {data['name']}",
            "Easy to configure",
            "Works with other components"
        ],
        "inputs": {},
        "outputs": {},
        "examples": [{
            "title": f"Basic {data['name']} Usage",
            "description": f"Simple example using {data['name']}",
            "use_case": "General purpose usage"
        }],
        "troubleshooting": [],
        "external_links": []
    }
    
    filepath = DOCS_DIR / f"{filename}.yaml"
    with open(filepath, 'w') as f:
        yaml.dump(doc, f, default_flow_style=False, sort_keys=False)
    print(f"Created: {filename}.yaml")

# Generate all documentation
count = 0
for filename, data in COMPONENTS.items():
    create_doc(filename, data)
    count += 1

print(f"\nGenerated {count} documentation files!")
print(f"Total documentation files created in this run: {count}")
