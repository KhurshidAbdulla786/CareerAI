"""
CareerAI - AI Service
FastAPI application for AI-powered career analysis services.
"""

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes import cv_analysis, job_matching, skill_gap, career_chat, interview

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CareerAI AI Service",
    description="AI-powered career analysis APIs",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(cv_analysis.router, prefix="/api/ai/cv", tags=["CV Analysis"])
app.include_router(job_matching.router, prefix="/api/ai/jobs", tags=["Job Matching"])
app.include_router(skill_gap.router, prefix="/api/ai/skills", tags=["Skill Gap"])
app.include_router(career_chat.router, prefix="/api/ai/chat", tags=["Career Chat"])
app.include_router(interview.router, prefix="/api/ai/interview", tags=["Interview"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "CareerAI AI Service",
        "version": "1.0.0",
    }


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info("CareerAI AI Service starting up...")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"LLM Provider: {os.getenv('LLM_PROVIDER', 'openai')}")


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on shutdown."""
    logger.info("CareerAI AI Service shutting down...")