"""
Users routes — GET /users/teacher/:teacherId/students, GET /users/parent/:parentId/children
Role-based data access for dashboards.
"""

from fastapi import APIRouter, HTTPException, Depends

from app.db.supabase_client import get_db
from app.services.analytics_service import get_weak_topics, get_performance_trend
from app.core.security import verify_token

router = APIRouter()


def _resolve_teacher_id(db, teacher_id: str, user_email: str = None):
    """Resolve the internal teacher_id from the teachers table.
    Tries by ID first, then by email (handles Supabase Auth UID mismatch)."""
    # Try by ID
    result = db.table("teachers").select("teacher_id").eq("teacher_id", teacher_id).limit(1).execute()
    if result.data:
        return result.data[0]["teacher_id"]
    # Try by email
    if user_email:
        result = db.table("teachers").select("teacher_id").eq("email", user_email).limit(1).execute()
        if result.data:
            return result.data[0]["teacher_id"]
    return teacher_id  # fallback to original


def _resolve_parent_id(db, parent_id: str, user_email: str = None):
    """Resolve the internal parent_id from the parents table.
    Tries by ID first, then by email (handles Supabase Auth UID mismatch)."""
    # Try by ID
    result = db.table("parents").select("parent_id").eq("parent_id", parent_id).limit(1).execute()
    if result.data:
        return result.data[0]["parent_id"]
    # Try by email
    if user_email:
        result = db.table("parents").select("parent_id").eq("email", user_email).limit(1).execute()
        if result.data:
            return result.data[0]["parent_id"]
    return parent_id  # fallback to original


@router.get("/teacher/{teacher_id}/students")
async def get_teacher_students(teacher_id: str, user: dict = Depends(verify_token)):
    """Get all students assigned to a teacher, with their performance summaries."""
    db = get_db()

    # Resolve the actual internal teacher_id (may differ from Supabase Auth UID)
    user_email = user.get("email", "")
    internal_teacher_id = _resolve_teacher_id(db, teacher_id, user_email)

    result = (
        db.table("students")
        .select("student_id, name, email, class, board")
        .eq("teacher_id", internal_teacher_id)
        .execute()
    )

    students = result.data or []

    # Enrich each student with performance summary
    enriched = []
    for s in students:
        try:
            perf = await get_performance_trend(s["student_id"], days=30)
            weak = await get_weak_topics(s["student_id"])
            weak_list = [t["subtopic"] for t in weak if t.get("status") == "weak"]
            s["total_attempts"] = perf["total_attempts"]
            s["avg_score"] = perf["avg_score"]
            s["weak_topics"] = weak_list
        except Exception:
            s["total_attempts"] = 0
            s["avg_score"] = 0
            s["weak_topics"] = []
        enriched.append(s)

    return {"teacher_id": teacher_id, "students": enriched, "count": len(enriched)}


@router.get("/parent/{parent_id}/children")
async def get_parent_children(parent_id: str, user: dict = Depends(verify_token)):
    """Get all children linked to a parent, with their performance summaries."""
    db = get_db()

    # Resolve the actual internal parent_id (may differ from Supabase Auth UID)
    user_email = user.get("email", "")
    internal_parent_id = _resolve_parent_id(db, parent_id, user_email)

    result = (
        db.table("students")
        .select("student_id, name, email, class, board")
        .eq("parent_id", internal_parent_id)
        .execute()
    )

    children = result.data or []

    # Enrich each child with performance data
    enriched = []
    for c in children:
        try:
            perf = await get_performance_trend(c["student_id"], days=30)
            weak = await get_weak_topics(c["student_id"])
            c["total_attempts"] = perf["total_attempts"]
            c["avg_score"] = perf["avg_score"]
            c["weak_topics"] = weak
            c["trend"] = perf.get("trend", [])
        except Exception:
            c["total_attempts"] = 0
            c["avg_score"] = 0
            c["weak_topics"] = []
            c["trend"] = []
        enriched.append(c)

    return {"parent_id": parent_id, "children": enriched, "count": len(enriched)}
