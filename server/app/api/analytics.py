"""
Analytics routes — GET /analytics/{student_id}/weak-topics, GET /analytics/{student_id}/performance
"""

from fastapi import APIRouter, Query

from app.services.analytics_service import get_weak_topics, get_performance_trend

router = APIRouter()


@router.get("/{student_id}/weak-topics")
async def weak_topics(student_id: str):
    """
    Get per-subtopic analytics for a student.
    Returns: subtopic, avg score %, attempt count, status (strong/average/weak).
    """
    topics = await get_weak_topics(student_id)
    return {"student_id": student_id, "weak_topics": topics}


@router.get("/{student_id}/performance")
async def performance(
    student_id: str,
    days: int = Query(default=30, le=365),
):
    """
    Get performance trend data for the dashboard chart.
    Returns: total_attempts, avg_score, trend array by date.
    """
    data = await get_performance_trend(student_id, days)
    return {"student_id": student_id, **data}
