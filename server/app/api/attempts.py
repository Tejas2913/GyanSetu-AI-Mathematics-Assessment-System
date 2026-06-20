"""
Attempts routes — POST /attempts, GET /attempts/{student_id}
"""

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.attempt_service import create_attempt, get_attempts_by_student

router = APIRouter()


class AttemptCreateRequest(BaseModel):
    student_id: str
    question_id: str
    input_mode: str  # 'typed' | 'voice' | 'photo'
    raw_input: Optional[str] = None  # base64 image for photo mode
    transcribed_text: Optional[str] = None  # typed text or voice transcription


@router.post("")
async def submit_attempt(request: AttemptCreateRequest):
    """
    Submit a new answer attempt.
    For photo input: receives base64 image, uploads to Supabase Storage.
    For typed/voice: stores transcribed_text directly.
    """
    if request.input_mode not in ("typed", "voice", "photo"):
        raise HTTPException(
            status_code=400,
            detail="input_mode must be 'typed', 'voice', or 'photo'",
        )

    if request.input_mode in ("typed", "voice") and not request.transcribed_text:
        raise HTTPException(
            status_code=400,
            detail="transcribed_text is required for typed/voice input",
        )

    if request.input_mode == "photo" and not request.raw_input:
        raise HTTPException(
            status_code=400,
            detail="raw_input (base64 image) is required for photo input",
        )

    try:
        attempt = await create_attempt(
            student_id=request.student_id,
            question_id=request.question_id,
            input_mode=request.input_mode,
            raw_input=request.raw_input,
            transcribed_text=request.transcribed_text,
        )
        return attempt
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create attempt: {str(e)}")


@router.get("/{student_id}")
async def get_attempts(
    student_id: str,
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
):
    """
    Get a student's attempt history, ordered by most recent.
    """
    attempts = await get_attempts_by_student(student_id, limit, offset)
    return {"attempts": attempts, "count": len(attempts)}
