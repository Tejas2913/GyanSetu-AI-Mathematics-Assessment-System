"""
Analytics Pydantic models — response schemas for weak topic data.
"""

from pydantic import BaseModel


class WeakTopicOut(BaseModel):
    """Per-subtopic analytics for a student."""
    subtopic: str
    attempts_count: int
    average_score_pct: float
    status: str  # 'strong' | 'average' | 'weak'


class PerformanceOut(BaseModel):
    """Overall performance summary for dashboard."""
    total_attempts: int
    avg_score: float
    trend: list[dict]  # [{ date, score }]
