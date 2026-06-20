"""
Grading Service — Core business logic for the AI grading pipeline.

Pipeline:
1. Fetch attempt data (input_mode, raw_input/transcribed_text)
2. Fetch question + rubric steps
3. Build the grading prompt with rubric + ideal solution in context
4. Call Gemini 2.5 Flash with structured JSON output
5. Parse response into step_marks
6. Store evaluation in Supabase
7. Trigger weak_topic_analytics update
8. Return structured evaluation result
"""

import uuid
from datetime import datetime, timezone

from app.db.supabase_client import get_db
from app.ai.gemini_client import grade_text_answer, grade_photo_answer
from app.ai.prompts import build_grading_prompt


async def grade_attempt(attempt_id: str) -> dict:
    """
    Grade a student attempt end-to-end.

    1. Fetch the attempt record
    2. Fetch the question + rubric
    3. Build the Gemini prompt
    4. Call Gemini for grading
    5. Store the evaluation
    6. Update weak topic analytics
    7. Return the evaluation
    """
    db = get_db()

    # ── Step 1: Fetch the attempt ──
    attempt_result = (
        db.table("attempts")
        .select("*")
        .eq("attempt_id", attempt_id)
        .single()
        .execute()
    )
    attempt = attempt_result.data
    if not attempt:
        raise ValueError(f"Attempt {attempt_id} not found")

    # ── Step 2: Fetch question + rubric ──
    question_result = (
        db.table("questions")
        .select("*")
        .eq("question_id", attempt["question_id"])
        .single()
        .execute()
    )
    question = question_result.data
    if not question:
        raise ValueError(f"Question {attempt['question_id']} not found")

    rubric_result = (
        db.table("rubrics")
        .select("*")
        .eq("question_id", attempt["question_id"])
        .order("step_number")
        .execute()
    )
    rubric_steps = rubric_result.data

    # ── Step 3: Build the prompt ──
    student_answer = attempt.get("transcribed_text") or ""
    input_mode = attempt.get("input_mode", "typed")

    system_prompt, user_prompt = build_grading_prompt(
        question_text=question["question_text"],
        marks=question["marks"],
        subtopic=question["subtopic"],
        rubric_steps=rubric_steps,
        student_answer=student_answer,
        input_mode=input_mode,
    )

    # ── Step 4: Call Gemini ──
    if input_mode == "photo" and attempt.get("raw_input_ref"):
        # For photo input, fetch the image from Supabase Storage
        image_data = await _get_image_data(db, attempt["raw_input_ref"])
        grading_result = await grade_photo_answer(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            image_data=image_data,
        )
    else:
        grading_result = await grade_text_answer(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )

    # ── Step 5: Validate and store evaluation ──
    evaluation = _validate_grading_result(grading_result, rubric_steps)

    evaluation_id = str(uuid.uuid4())
    evaluation_row = {
        "evaluation_id": evaluation_id,
        "attempt_id": attempt_id,
        "step_marks": evaluation["step_marks"],
        "total_marks_awarded": int(round(evaluation["total_marks_awarded"])),
        "total_max_marks": int(round(evaluation["total_max_marks"])),
        "feedback_text": evaluation["feedback"],
        "confidence_flag": evaluation["confidence"],
    }

    db.table("evaluations").upsert(
        evaluation_row, on_conflict="attempt_id"
    ).execute()

    # ── Step 6: Update analytics (non-blocking — don't fail grading if analytics fails) ──
    try:
        await _update_analytics(
            db,
            student_id=attempt["student_id"],
            subtopic=question["subtopic"],
        )
    except Exception as analytics_err:
        # Log but don't fail the grading
        print(f"Warning: Analytics update failed for {attempt_id}: {analytics_err}")

    # ── Step 7: Return ──
    evaluation_row["graded_at"] = datetime.now(timezone.utc).isoformat()
    return evaluation_row


def _validate_grading_result(result: dict, rubric_steps: list) -> dict:
    """
    Validate and sanitize the Gemini grading output.
    Ensures marks don't exceed max, step_ids match, and totals are correct.
    Handles both integer and float marks from Gemini.
    """
    step_marks = result.get("step_marks", [])
    validated_steps = []

    # Create a lookup of rubric steps
    rubric_lookup = {s["step_number"]: s for s in rubric_steps}

    for step in step_marks:
        step_id = step.get("step_id", 0)
        rubric = rubric_lookup.get(step_id)

        if rubric:
            max_marks = float(rubric["max_marks"])
            awarded = min(max(float(step.get("marks_awarded", 0)), 0), max_marks)
            validated_steps.append({
                "step_id": step_id,
                "marks_awarded": round(awarded, 2),
                "max_marks": max_marks,
                "justification": step.get("justification", ""),
            })

    # Add any missing rubric steps with 0 marks
    seen_ids = {s["step_id"] for s in validated_steps}
    for step_num, rubric in rubric_lookup.items():
        if step_num not in seen_ids:
            validated_steps.append({
                "step_id": step_num,
                "marks_awarded": 0,
                "max_marks": float(rubric["max_marks"]),
                "justification": "Step not addressed in the student's answer.",
            })

    # Sort by step_id
    validated_steps.sort(key=lambda s: s["step_id"])

    total_awarded = round(sum(s["marks_awarded"] for s in validated_steps), 2)
    total_max = round(sum(s["max_marks"] for s in validated_steps), 2)

    return {
        "step_marks": validated_steps,
        "total_marks_awarded": total_awarded,
        "total_max_marks": total_max,
        "feedback": result.get("feedback", "Keep practicing!"),
        "confidence": result.get("confidence", "medium"),
    }


async def _get_image_data(db, storage_path: str) -> str:
    """
    Download an image from Supabase Storage and return as base64.
    """
    from app.core.config import settings
    import base64
    import httpx

    bucket = settings.SUPABASE_STORAGE_BUCKET

    try:
        # Get a signed URL for the image
        signed = db.storage.from_(bucket).create_signed_url(storage_path, 3600)

        # Handle different supabase-py response formats
        url = None
        if isinstance(signed, dict):
            url = signed.get("signedURL") or signed.get("signedUrl") or signed.get("signed_url")
        elif hasattr(signed, 'signed_url'):
            url = signed.signed_url

        if not url:
            raise ValueError(f"Could not get signed URL for {storage_path}. Response: {signed}")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return base64.b64encode(response.content).decode("utf-8")

    except Exception as e:
        raise ValueError(f"Failed to download image from storage: {str(e)}")


async def _update_analytics(db, student_id: str, subtopic: str):
    """
    Recalculate weak_topic_analytics for a student's subtopic.
    Aggregates all evaluations for attempts on questions of this subtopic.
    """
    # Get all attempts for this student + subtopic
    attempts_result = (
        db.table("attempts")
        .select("attempt_id, question_id")
        .eq("student_id", student_id)
        .execute()
    )

    # Filter to attempts for this subtopic
    questions_result = (
        db.table("questions")
        .select("question_id")
        .eq("subtopic", subtopic)
        .execute()
    )
    subtopic_qids = {q["question_id"] for q in questions_result.data}

    relevant_attempt_ids = [
        a["attempt_id"]
        for a in attempts_result.data
        if a["question_id"] in subtopic_qids
    ]

    if not relevant_attempt_ids:
        return

    # Get evaluations for these attempts
    evals_result = (
        db.table("evaluations")
        .select("total_marks_awarded, total_max_marks")
        .in_("attempt_id", relevant_attempt_ids)
        .execute()
    )

    if not evals_result.data:
        return

    # Calculate average score percentage
    total_awarded = sum(e["total_marks_awarded"] for e in evals_result.data)
    total_max = sum(e["total_max_marks"] for e in evals_result.data)
    avg_pct = (total_awarded / total_max * 100) if total_max > 0 else 0

    # Determine status
    if avg_pct >= 75:
        status = "strong"
    elif avg_pct >= 40:
        status = "average"
    else:
        status = "weak"

    # Upsert analytics row
    db.table("weak_topic_analytics").upsert(
        {
            "student_id": student_id,
            "subtopic": subtopic,
            "attempts_count": len(relevant_attempt_ids),
            "average_score_pct": round(avg_pct, 1),
            "status": status,
        },
        on_conflict="student_id,subtopic",
    ).execute()
