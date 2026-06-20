"""
Attempt Pydantic models — request/response schemas for answer submissions.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AttemptCreate(BaseModel):
    """Request body for POST /attempts."""
    student_id: str
    question_id: str
    input_mode: str  # 'typed' | 'voice' | 'photo'
    raw_input: Optional[str] = None  # base64 image for photo, None for typed
    transcribed_text: Optional[str] = None  # typed text or ASR output


class AttemptOut(BaseModel):
    """Response for attempt endpoints."""
    attempt_id: str
    student_id: str
    question_id: str
    input_mode: str
    raw_input_ref: Optional[str] = None
    transcribed_text: Optional[str] = None
    submitted_at: datetime
