"""
Grading routes — POST /grade, GET /evaluations/{attempt_id}

POST /grade is the CORE endpoint of the entire application.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.grading_service import grade_attempt
from app.db.supabase_client import get_db

router = APIRouter()


class GradeRequest(BaseModel):
    attempt_id: str


@router.post("/grade")
async def grade(request: GradeRequest):
    """
    Grade an attempt using the AI Grading Service.

    Pipeline:
    1. Fetch the attempt (input_mode, raw_input/transcribed_text)
    2. Fetch the question + rubric steps
    3. Build the grading prompt (system prompt + rubric + ideal solution + student answer)
    4. Call Gemini 2.5 Flash with structured output schema
    5. Parse the JSON response into step_marks
    6. Store the evaluation in the evaluations table
    7. Update weak_topic_analytics
    8. Return EvaluationOut
    """
    try:
        evaluation = await grade_attempt(request.attempt_id)
        return evaluation
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Grading failed: {str(e)}",
        )


@router.get("/evaluations/{attempt_id}")
async def get_evaluation(attempt_id: str):
    """
    Retrieve a stored evaluation for a given attempt.
    """
    db = get_db()

    result = (
        db.table("evaluations")
        .select("*")
        .eq("attempt_id", attempt_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    return result.data
