import os
from typing import List, Dict, Any, Optional
from agno.agent import Agent
from agno.models.groq import Groq
from agno.models.mistral import MistralChat
from agno.tools.tavily import TavilyTools
from dotenv import load_dotenv

from document_processor import embedder
from db import vector_search

def search_uploaded_documents(query: str) -> str:
    """Searches uploaded documents for context to answer the user's query. Call this tool when you need information from files the user has uploaded.
    
    Args:
        query (str): The search query, keywords, or question to find in the documents.
        
    Returns:
        str: Relevant text chunks from the uploaded documents.
    """
    try:
        # Defaulting to local provider for search queries
        query_embedding = embedder.embed_text(query, provider="local")
        results = vector_search(query_embedding, limit=5)
        
        if not results:
            return "No relevant documents found."
            
        context = []
        for res in results:
            context.append(f"Source file: {res.get('metadata', {}).get('filename', 'unknown')}\nContent: {res.get('text', '')}")
            
        return "\n\n---\n\n".join(context)
    except Exception as e:
        return f"Error searching documents: {str(e)}"

# Load env vars from the Next.js .env.local file
load_dotenv(dotenv_path="../.env.local")

def get_agent(provider: str, model_id: str, system_prompt: Optional[str] = None) -> Agent:
    # Handle decommissioned models (mirroring Next.js logic)
    if model_id == 'llama3-8b-8192':
        model_id = 'llama-3.1-8b-instant'
    if model_id == 'llama3-70b-8192':
        model_id = 'llama-3.3-70b-versatile'

    # Initialize the correct model provider
    if provider.startswith('groq'):
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is not set.")
        model = Groq(id=model_id, api_key=api_key)
    elif provider.startswith('mistral'):
        api_key = os.environ.get("MISTRAL_API_KEY")
        if not api_key:
            raise ValueError("MISTRAL_API_KEY is not set.")
        model = MistralChat(id=model_id, api_key=api_key)
    else:
        raise ValueError(f"Unknown provider: {provider}")
    
    # Configure tools
    tools = [search_uploaded_documents]
    if os.environ.get("TAVILY_API_KEY"):
        tools.append(TavilyTools())
        
    base_description = system_prompt if system_prompt else "You are a helpful AI assistant."
    description = base_description + (
        "\n\nCRITICAL TOOL INSTRUCTIONS:\n"
        "1. ALWAYS check uploaded documents FIRST using 'search_uploaded_documents' before using web search.\n"
        "2. When calling tools, you MUST use the strict JSON API format required by the system. DO NOT output raw <function> XML tags.\n"
        "3. If a tool parameter expects an integer (like max_results), you MUST pass an actual number (e.g., 5), NEVER a string (e.g., \"5\")."
    )
    
    return Agent(
        model=model,
        description=description,
        tools=tools,
        markdown=True
    )
