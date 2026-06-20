"""
Question Pydantic models — response schemas for questions and metadata.
"""

from pydantic import BaseModel
from typing import Optional


class RubricStepOut(BaseModel):
    """A single rubric step for a question."""
    rubric_id: str
    step_number: int
    step_description: str
    max_marks: int
    ideal_solution_snippet: str
    keywords: list[str] = []


class QuestionMetadataOut(BaseModel):
    """Question metadata (importance, difficulty, tags)."""
    importance_score: int = 0
    is_hot_question: bool = False
    difficulty: Optional[str] = None
    tags: list[str] = []


class QuestionOut(BaseModel):
    """Full question response including metadata and rubric."""
    question_id: str
    subject: str = "Mathematics"
    topic: str = "Quadratic Equations"
    subtopic: str
    question_text: str
    marks: int
    board: str = "CBSE"
    metadata: Optional[QuestionMetadataOut] = None
    rubric_steps: list[RubricStepOut] = []
