"""
Question Service — Query questions, metadata, and rubrics from Supabase.
"""

from app.db.supabase_client import get_db


async def get_all_questions(
    subtopic: str = None,
    marks: int = None,
    difficulty: str = None,
    is_hot: bool = None,
    limit: int = 40,
) -> list[dict]:
    """
    Fetch questions with optional filters.
    Joins with question_metadata for difficulty, importance, etc.
    """
    db = get_db()

    query = db.table("questions").select(
        "*, question_metadata(*)"
    )

    if subtopic:
        query = query.eq("subtopic", subtopic)
    if marks:
        query = query.eq("marks", marks)
    if limit:
        query = query.limit(limit)

    result = query.execute()
    questions = result.data

    # Apply metadata-level filters (post-query since it's a join)
    if difficulty or is_hot is not None:
        filtered = []
        for q in questions:
            meta = q.get("question_metadata")
            if isinstance(meta, list):
                meta = meta[0] if meta else {}
            elif meta is None:
                meta = {}

            if difficulty and meta.get("difficulty") != difficulty:
                continue
            if is_hot is not None and meta.get("is_hot_question") != is_hot:
                continue
            filtered.append(q)
        questions = filtered

    return questions


async def get_question_with_rubric(question_id: str) -> dict:
    """
    Fetch a single question with its rubric steps and metadata.
    """
    db = get_db()

    # Fetch question
    q_result = (
        db.table("questions")
        .select("*, question_metadata(*)")
        .eq("question_id", question_id)
        .single()
        .execute()
    )
    question = q_result.data

    if not question:
        return None

    # Fetch rubric steps
    rubric_result = (
        db.table("rubrics")
        .select("*")
        .eq("question_id", question_id)
        .order("step_number")
        .execute()
    )
    question["rubric_steps"] = rubric_result.data

    return question


async def get_weak_practice_questions(student_id: str, limit: int = 20) -> list[dict]:
    """
    Get questions from the student's weakest subtopic.
    Reads weak_topic_analytics to find the weakest subtopic,
    then fetches questions from that subtopic.
    """
    db = get_db()

    # Find the weakest subtopic
    analytics_result = (
        db.table("weak_topic_analytics")
        .select("subtopic, average_score_pct, status")
        .eq("student_id", student_id)
        .order("average_score_pct", desc=False)
        .limit(1)
        .execute()
    )

    if analytics_result.data:
        weakest_subtopic = analytics_result.data[0]["subtopic"]
    else:
        # No analytics yet — default to factorization (most common)
        weakest_subtopic = "factorization"

    # Fetch questions from the weakest subtopic
    questions = await get_all_questions(subtopic=weakest_subtopic, limit=limit)

    return {
        "weakest_subtopic": weakest_subtopic,
        "questions": questions,
    }
