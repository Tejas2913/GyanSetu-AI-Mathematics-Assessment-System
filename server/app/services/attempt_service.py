"""
Attempt Service — Create attempts, store raw input, handle file uploads.
"""

import uuid
import base64
from typing import Optional

from app.db.supabase_client import get_db
from app.core.config import settings


async def create_attempt(
    student_id: str,
    question_id: str,
    input_mode: str,
    raw_input: Optional[str] = None,
    transcribed_text: Optional[str] = None,
) -> dict:
    """
    Create a new attempt record.

    For photo input: uploads base64 image to Supabase Storage, stores path.
    For typed/voice: stores transcribed_text directly.
    """
    db = get_db()
    attempt_id = str(uuid.uuid4())

    raw_input_ref = None

    if input_mode == "photo" and raw_input:
        # Upload image to Supabase Storage
        raw_input_ref = await _upload_photo(
            db, raw_input, student_id, attempt_id
        )

    attempt_row = {
        "attempt_id": attempt_id,
        "student_id": student_id,
        "question_id": question_id,
        "input_mode": input_mode,
        "raw_input_ref": raw_input_ref,
        "transcribed_text": transcribed_text,
    }

    result = db.table("attempts").insert(attempt_row).execute()

    return result.data[0] if result.data else attempt_row


async def get_attempts_by_student(
    student_id: str,
    limit: int = 20,
    offset: int = 0,
) -> list[dict]:
    """
    Get a student's attempt history, ordered by most recent.
    Includes question text and evaluation data via joins.
    """
    db = get_db()

    result = (
        db.table("attempts")
        .select("*, questions(question_text, subtopic, marks), evaluations(*)")
        .eq("student_id", student_id)
        .order("submitted_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    return result.data


async def _upload_photo(
    db, base64_data: str, student_id: str, attempt_id: str
) -> str:
    """
    Upload a base64-encoded photo to Supabase Storage.
    Returns the storage path for the uploaded file.
    """
    bucket = settings.SUPABASE_STORAGE_BUCKET
    file_path = f"{student_id}/{attempt_id}.jpg"

    # Decode base64
    image_bytes = base64.b64decode(base64_data)

    # Upload to Supabase Storage
    db.storage.from_(bucket).upload(
        path=file_path,
        file=image_bytes,
        file_options={"content-type": "image/jpeg"},
    )

    return file_path
