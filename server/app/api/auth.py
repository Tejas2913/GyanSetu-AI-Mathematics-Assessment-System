"""
Auth routes — POST /auth/signup, GET /auth/me
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional

from app.db.supabase_client import get_db
from app.core.security import verify_token

router = APIRouter()


class SignupRequest(BaseModel):
    user_id: str
    email: str
    name: str
    role: str  # 'student' | 'teacher' | 'parent'
    teacher_email: Optional[str] = None  # For students: link to existing teacher
    parent_email: Optional[str] = None   # For students: link to existing parent


class SignupResponse(BaseModel):
    user_id: str
    role: str
    message: str = "success"


class MeResponse(BaseModel):
    user_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None


@router.get("/me", response_model=MeResponse)
async def me(user: dict = Depends(verify_token)):
    """Return current user info including role from Supabase auth metadata.
    Falls back to checking role tables if metadata is missing."""
    user_id = user.get("id") or user.get("sub", "")
    role = user.get("user_metadata", {}).get("role")
    name = user.get("user_metadata", {}).get("name")

    # Fallback: check role tables if metadata doesn't have role
    if not role and user_id:
        db = get_db()
        user_email = user.get("email", "")
        try:
            # Try by user_id first, then by email
            student = db.table("students").select("student_id, name").eq("student_id", user_id).limit(1).execute()
            if student.data:
                role = "student"
                name = name or student.data[0].get("name")
            else:
                teacher = db.table("teachers").select("teacher_id, name").eq("teacher_id", user_id).limit(1).execute()
                if teacher.data:
                    role = "teacher"
                    name = name or teacher.data[0].get("name")
                else:
                    parent = db.table("parents").select("parent_id, name").eq("parent_id", user_id).limit(1).execute()
                    if parent.data:
                        role = "parent"
                        name = name or parent.data[0].get("name")

            # If not found by ID, try by email
            if not role and user_email:
                student = db.table("students").select("student_id, name").eq("email", user_email).limit(1).execute()
                if student.data:
                    role = "student"
                    name = name or student.data[0].get("name")
                    # Fix the mismatched ID so future lookups work
                    try:
                        db.table("students").update({"student_id": user_id}).eq("email", user_email).execute()
                    except Exception:
                        pass
                else:
                    teacher = db.table("teachers").select("teacher_id, name").eq("email", user_email).limit(1).execute()
                    if teacher.data:
                        role = "teacher"
                        name = name or teacher.data[0].get("name")
                        try:
                            db.table("teachers").update({"teacher_id": user_id}).eq("email", user_email).execute()
                        except Exception:
                            pass
                    else:
                        parent = db.table("parents").select("parent_id, name").eq("email", user_email).limit(1).execute()
                        if parent.data:
                            role = "parent"
                            name = name or parent.data[0].get("name")
                            try:
                                db.table("parents").update({"parent_id": user_id}).eq("email", user_email).execute()
                            except Exception:
                                pass
        except Exception:
            pass  # If DB lookup fails, role stays None

    return {
        "user_id": user_id,
        "email": user.get("email"),
        "name": name,
        "role": role,
    }


@router.post("/signup", response_model=SignupResponse)
async def signup(request: SignupRequest):
    """
    Create a profile row in the appropriate role table after Supabase Auth signup.
    For students: also look up teacher/parent by email and populate FKs.
    """
    db = get_db()

    role = request.role.lower()
    if role not in ("student", "teacher", "parent"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {role}. Must be student, teacher, or parent.",
        )

    try:
        if role == "student":
            student_row = {
                "student_id": request.user_id,
                "name": request.name,
                "email": request.email,
            }

            # Look up teacher by email and link
            if request.teacher_email:
                teacher = (
                    db.table("teachers")
                    .select("teacher_id")
                    .eq("email", request.teacher_email.strip().lower())
                    .limit(1)
                    .execute()
                )
                if teacher.data:
                    student_row["teacher_id"] = teacher.data[0]["teacher_id"]

            # Look up parent by email and link
            if request.parent_email:
                parent = (
                    db.table("parents")
                    .select("parent_id")
                    .eq("email", request.parent_email.strip().lower())
                    .limit(1)
                    .execute()
                )
                if parent.data:
                    student_row["parent_id"] = parent.data[0]["parent_id"]

            db.table("students").upsert(
                student_row, on_conflict="student_id"
            ).execute()

        elif role == "teacher":
            db.table("teachers").upsert({
                "teacher_id": request.user_id,
                "name": request.name,
                "email": request.email,
            }, on_conflict="teacher_id").execute()

        elif role == "parent":
            db.table("parents").upsert({
                "parent_id": request.user_id,
                "name": request.name,
                "email": request.email,
            }, on_conflict="parent_id").execute()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create profile: {str(e)}",
        )

    return SignupResponse(user_id=request.user_id, role=role)
