"""
CareerAI - Career Chat Route (RAG-based)
"""

import logging
from typing import Optional, Dict
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.llm_service import llm_service

logger = logging.getLogger(__name__)

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict] = None


@router.post("/message", response_model=dict)
async def chat_message(request: ChatRequest):
    """
    Send a chat message and get AI career advice.
    Context can include user CV data, skills, etc.
    """
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message is empty")

        logger.info(f"Chat message received ({len(request.message)} chars)")

        response = await llm_service.chat_with_context(
            request.message,
            request.context,
        )

        return {
            "success": True,
            "data": {
                "response": response,
                "timestamp": None,  # Backend will add timestamp
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.post("/analyze", response_model=dict)
async def analyze_query(request: ChatRequest):
    """
    Analyze a career-related query and provide structured insights.
    """
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Query is empty")

        logger.info(f"Analyzing query: {request.message[:100]}...")

        # Use LLM to provide structured analysis
        response = await llm_service.chat_with_context(
            f"Analyze this career query and provide structured advice: {request.message}",
            request.context,
        )

        return {
            "success": True,
            "data": {
                "analysis": response,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Query analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Query analysis failed: {str(e)}")