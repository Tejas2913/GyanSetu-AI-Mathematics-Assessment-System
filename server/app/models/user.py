"""
User Pydantic models — request/response schemas for auth and user profiles.
"""

from pydantic import BaseModel
from typing import Optional


class UserSignupRequest(BaseModel):
    """Request body for POST /auth/signup."""
    user_id: str
    email: str
    name: str
    role: str  # 'student' | 'teacher' | 'parent'


class UserLoginResponse(BaseModel):
    """Response for auth endpoints."""
    user_id: str
    role: str
    message: str = "success"


class StudentOut(BaseModel):
    """Student profile response."""
    student_id: str
    name: str
    email: str
    class_name: str = "10"
    board: str = "CBSE"
    teacher_id: Optional[str] = None
    parent_id: Optional[str] = None


class TeacherOut(BaseModel):
    """Teacher profile response."""
    teacher_id: str
    name: str
    email: str
    subject: str = "Mathematics"
    contact: Optional[str] = None


class ParentOut(BaseModel):
    """Parent profile response."""
    parent_id: str
    name: str
    email: str
    contact: Optional[str] = None
