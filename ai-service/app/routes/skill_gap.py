"""
CareerAI - Skill Gap & Roadmap Routes
"""

import logging
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.llm_service import llm_service

logger = logging.getLogger(__name__)

router = APIRouter()


class SkillGapRequest(BaseModel):
    target_role: str
    current_skills: List[str]


class RoadmapRequest(BaseModel):
    career_goal: str
    current_skills: List[str]
    target_role: str


@router.post("/analyze-gap", response_model=dict)
async def analyze_skill_gap(request: SkillGapRequest):
    """
    Analyze skill gaps for a target role.
    """
    try:
        if not request.target_role.strip():
            raise HTTPException(status_code=400, detail="Target role is required")
        if not request.current_skills:
            raise HTTPException(status_code=400, detail="Current skills are required")

        logger.info(f"Analyzing skill gap for: {request.target_role}")

        result = await llm_service.analyze_skill_gap(
            request.target_role,
            request.current_skills,
        )

        return {
            "success": True,
            "data": result,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Skill gap analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Skill gap analysis failed: {str(e)}")


@router.post("/generate-roadmap", response_model=dict)
async def generate_roadmap(request: RoadmapRequest):
    """
    Generate a personalized learning roadmap.
    """
    try:
        if not request.career_goal.strip():
            raise HTTPException(status_code=400, detail="Career goal is required")
        if not request.current_skills:
            raise HTTPException(status_code=400, detail="Current skills are required")
        if not request.target_role.strip():
            raise HTTPException(status_code=400, detail="Target role is required")

        logger.info(f"Generating roadmap for: {request.target_role}")

        result = await llm_service.generate_roadmap(
            request.career_goal,
            request.current_skills,
            request.target_role,
        )

        return {
            "success": True,
            "data": result,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Roadmap generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")