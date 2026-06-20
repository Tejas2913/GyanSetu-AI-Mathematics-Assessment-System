"""
Report Pydantic models — response schemas for teacher and parent reports.
"""

from pydantic import BaseModel
from datetime import datetime


class TeacherReportOut(BaseModel):
    """Teacher report with step-level detail."""
    report_id: str
    teacher_id: str
    student_id: str
    summary_text: str
    generated_at: datetime


class ParentReportOut(BaseModel):
    """Parent report with plain-language summary."""
    report_id: str
    parent_id: str
    student_id: str
    summary_text: str
    generated_at: datetime
