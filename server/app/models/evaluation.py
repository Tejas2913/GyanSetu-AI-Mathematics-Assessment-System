"""
Evaluation Pydantic models — response schemas for grading results.
"""

from pydantic import BaseModel
from datetime import datetime


class StepMark(BaseModel):
    """Marks for a single rubric step."""
    step_id: int
    marks_awarded: int
    max_marks: int
    justification: str


class EvaluationOut(BaseModel):
    """Full evaluation response — the output of POST /grade."""
    evaluation_id: str
    attempt_id: str
    step_marks: list[StepMark]
    total_marks_awarded: int
    total_max_marks: int
    feedback_text: str
    confidence_flag: str = "high"  # 'high' | 'medium' | 'low'
    graded_at: datetime
