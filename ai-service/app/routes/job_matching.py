"""
CareerAI - Job Matching Route
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.llm_service import llm_service

logger = logging.getLogger(__name__)

router = APIRouter()


class JobMatchRequest(BaseModel):
    cv_text: str
    job_title: str
    job_description: str
    required_skills: Optional[List[str]] = []


@router.post("/match", response_model=dict)
async def match_job(request: JobMatchRequest):
    """
    Match a CV with a job description and provide analysis.
    """
    try:
        if not request.cv_text.strip():
            raise HTTPException(status_code=400, detail="CV text is empty")
        if not request.job_description.strip():
            raise HTTPException(status_code=400, detail="Job description is empty")

        logger.info(f"Matching CV with job: {request.job_title}")

        result = await llm_service.match_job(
            request.cv_text,
            request.job_title,
            request.job_description,
            request.required_skills,
        )

        return {
            "success": True,
            "data": result,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job matching failed: {e}")
        raise HTTPException(status_code=500, detail=f"Job matching failed: {str(e)}")