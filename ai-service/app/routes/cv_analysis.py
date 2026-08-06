"""
CareerAI - CV Analysis Route
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.llm_service import llm_service

logger = logging.getLogger(__name__)

router = APIRouter()


class CVAnalysisRequest(BaseModel):
    cv_text: str
    file_name: str = "CV.pdf"


@router.post("/analyze", response_model=dict)
async def analyze_cv(request: CVAnalysisRequest):
    """
    Analyze a CV and provide structured feedback.
    """
    try:
        if not request.cv_text.strip():
            raise HTTPException(status_code=400, detail="CV text is empty")

        logger.info(f"Analyzing CV: {request.file_name} ({len(request.cv_text)} chars)")

        result = await llm_service.analyze_cv(request.cv_text)

        return {
            "success": True,
            "data": result,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CV analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"CV analysis failed: {str(e)}")