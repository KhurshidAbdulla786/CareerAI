"""
CareerAI - Interview Simulator Route
"""

import logging
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.llm_service import llm_service

logger = logging.getLogger(__name__)

router = APIRouter()


class StartInterviewRequest(BaseModel):
    role: str


class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_index: int
    question: str
    answer: str


@router.post("/start", response_model=dict)
async def start_interview(request: StartInterviewRequest):
    """
    Start an interview simulation by generating questions for a role.
    """
    try:
        if not request.role.strip():
            raise HTTPException(status_code=400, detail="Role is required")

        logger.info(f"Starting interview for role: {request.role}")

        questions = await llm_service.generate_interview_questions(request.role)

        return {
            "success": True,
            "data": {
                "role": request.role,
                "questions": questions,
                "total_questions": len(questions),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start interview: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")


@router.post("/evaluate", response_model=dict)
async def evaluate_answer(request: SubmitAnswerRequest):
    """
    Evaluate a single interview answer.
    """
    try:
        if not request.answer.strip():
            raise HTTPException(status_code=400, detail="Answer is empty")

        logger.info(f"Evaluating answer for question {request.question_index}")

        result = await llm_service.evaluate_answer(request.question, request.answer)

        return {
            "success": True,
            "data": {
                "session_id": request.session_id,
                "question_index": request.question_index,
                "evaluation": result,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to evaluate answer: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to evaluate answer: {str(e)}")


@router.post("/feedback", response_model=dict)
async def get_feedback(session_data: dict):
    """
    Generate comprehensive interview feedback.
    Expects session_data with: role, questions (list), answers (list).
    """
    try:
        role = session_data.get("role", "Unknown")
        questions = session_data.get("questions", [])
        answers = session_data.get("answers", [])

        if not questions or not answers:
            raise HTTPException(status_code=400, detail="Questions and answers are required")

        # Generate comprehensive feedback
        feedback_prompt = f"""
        Based on this interview for a {role} position:
        
        Questions and Answers:
        {chr(10).join([f"Q: {q}\nA: {a}" for q, a in zip(questions, answers)])}
        
        Provide comprehensive feedback including overall score, technical score,
        communication score, strengths, and areas for improvement.
        """

        result = await llm_service.chat_with_context(feedback_prompt)

        # Also evaluate each answer individually
        evaluations = []
        for q, a in zip(questions, answers):
            eval_result = await llm_service.evaluate_answer(q, a)
            evaluations.append(eval_result)

        # Calculate average scores
        if evaluations:
            avg_overall = sum(e.get("score", 0) for e in evaluations) / len(evaluations)
        else:
            avg_overall = 0

        feedback = {
            "overallScore": round(avg_overall),
            "technicalScore": round(sum(e.get("technicalScore", avg_overall) for e in evaluations) / len(evaluations)) if evaluations else 0,
            "communicationScore": round(sum(e.get("communicationScore", avg_overall) for e in evaluations) / len(evaluations)) if evaluations else 0,
            "questionsAnswered": len(answers),
            "summary": result[:500] if isinstance(result, str) else "Interview completed.",
            "strengths": [],
            "improvements": [],
            "detailedEvaluations": evaluations,
        }

        # Extract strengths and improvements from evaluations
        for eval_result in evaluations:
            if isinstance(eval_result, dict):
                strengths = eval_result.get("strengths", [])
                improvements = eval_result.get("improvements", [])
                if isinstance(strengths, list):
                    feedback["strengths"].extend(strengths)
                if isinstance(improvements, list):
                    feedback["improvements"].extend(improvements)

        return {
            "success": True,
            "data": feedback,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate feedback: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate feedback: {str(e)}")