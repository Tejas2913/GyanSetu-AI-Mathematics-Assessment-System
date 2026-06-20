"""
Questions routes — GET /questions, GET /questions/{id}, GET /questions/weak-practice/{student_id}
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional

from app.services.question_service import (
    get_all_questions,
    get_question_with_rubric,
    get_weak_practice_questions,
)

router = APIRouter()


@router.get("")
async def list_questions(
    subtopic: Optional[str] = None,
    marks: Optional[int] = None,
    difficulty: Optional[str] = None,
    is_hot: Optional[bool] = None,
    limit: int = Query(default=40, le=100),
):
    """
    List questions with optional filters.
    Returns questions joined with metadata.
    """
    questions = await get_all_questions(
        subtopic=subtopic,
        marks=marks,
        difficulty=difficulty,
        is_hot=is_hot,
        limit=limit,
    )
    return {"questions": questions, "count": len(questions)}


@router.get("/weak-practice/{student_id}")
async def get_weak_practice(
    student_id: str,
    limit: int = Query(default=20, le=40),
):
    """
    Get questions from the student's weakest subtopic.
    Reads weak_topic_analytics to find weakest subtopic, then queries questions.
    """
    result = await get_weak_practice_questions(student_id, limit)
    return result


@router.get("/{question_id}")
async def get_question(question_id: str):
    """
    Get full question detail including rubric steps and metadata.
    """
    question = await get_question_with_rubric(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question
