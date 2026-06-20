"""
Analytics Service — Compute and serve weak_topic_analytics + performance trends.
"""

from app.db.supabase_client import get_db


async def get_weak_topics(student_id: str) -> list[dict]:
    """
    Get per-subtopic analytics for a student.
    Returns all 5 subtopics with attempt counts, avg scores, and status.
    """
    db = get_db()

    result = (
        db.table("weak_topic_analytics")
        .select("*")
        .eq("student_id", student_id)
        .order("average_score_pct", desc=False)
        .execute()
    )

    analytics = result.data

    # Ensure all 5 subtopics are represented
    all_subtopics = [
        "factorization",
        "quadratic_formula",
        "completing_the_square",
        "nature_of_roots",
        "word_problems",
    ]

    existing = {a["subtopic"] for a in analytics}
    for subtopic in all_subtopics:
        if subtopic not in existing:
            analytics.append({
                "subtopic": subtopic,
                "attempts_count": 0,
                "average_score_pct": 0.0,
                "status": "average",
            })

    return analytics


async def get_performance_trend(student_id: str, days: int = 30) -> dict:
    """
    Get performance trend data for the dashboard chart.
    Aggregates evaluations by date.
    """
    db = get_db()

    # Get attempts with evaluations for this student
    result = (
        db.table("attempts")
        .select("submitted_at, evaluations(total_marks_awarded, total_max_marks)")
        .eq("student_id", student_id)
        .order("submitted_at", desc=True)
        .limit(100)
        .execute()
    )

    attempts = result.data
    total_attempts = len(attempts)

    # Build daily trend
    daily_scores = {}
    total_awarded = 0
    total_max = 0

    for attempt in attempts:
        evals = attempt.get("evaluations", [])
        if isinstance(evals, list) and evals:
            ev = evals[0]
        elif isinstance(evals, dict):
            ev = evals
        else:
            continue

        awarded = ev.get("total_marks_awarded", 0)
        max_marks = ev.get("total_max_marks", 1)
        total_awarded += awarded
        total_max += max_marks

        date_key = attempt["submitted_at"][:10]  # YYYY-MM-DD
        if date_key not in daily_scores:
            daily_scores[date_key] = {"total_awarded": 0, "total_max": 0, "count": 0}
        daily_scores[date_key]["total_awarded"] += awarded
        daily_scores[date_key]["total_max"] += max_marks
        daily_scores[date_key]["count"] += 1

    # Format trend array
    trend = []
    for date_key in sorted(daily_scores.keys()):
        d = daily_scores[date_key]
        pct = (d["total_awarded"] / d["total_max"] * 100) if d["total_max"] > 0 else 0
        trend.append({
            "date": date_key,
            "score": round(pct, 1),
            "attempts": d["count"],
        })

    avg_score = (total_awarded / total_max * 100) if total_max > 0 else 0

    return {
        "total_attempts": total_attempts,
        "avg_score": round(avg_score, 1),
        "trend": trend,
    }
