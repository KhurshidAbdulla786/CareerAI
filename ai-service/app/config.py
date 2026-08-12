"""
CareerAI - AI Service Configuration
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# Server
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# LLM Configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

# Groq (free alternative - no credit card needed, sign up at console.groq.com)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Alternative: Use a local model or mock for development
USE_MOCK_LLM = os.getenv("USE_MOCK_LLM", "true").lower() == "true"

# Embeddings
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# Vector Store
VECTOR_STORE_PATH = os.getenv("VECTOR_STORE_PATH", "./data/vector_store")
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./data/chromadb")

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5000").split(",")

# Backend API URL (for sending results back)
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000/api")