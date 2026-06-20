"""
Reports routes — Teacher and Parent report generation and retrieval.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from app.services.report_service import (
    generate_teacher_report,
    generate_parent_report,
    get_latest_report,
)
from app.core.security import verify_token
from app.db.supabase_client import get_db

router = APIRouter()


def _resolve_teacher_id(db, auth_uid: str, email: str = None) -> str:
    """Resolve the internal teacher_id (may differ from Supabase Auth UID)."""
    result = db.table("teachers").select("teacher_id").eq("teacher_id", auth_uid).limit(1).execute()
    if result.data:
        return result.data[0]["teacher_id"]
    if email:
        result = db.table("teachers").select("teacher_id").eq("email", email).limit(1).execute()
        if result.data:
            return result.data[0]["teacher_id"]
    return auth_uid


def _resolve_parent_id(db, auth_uid: str, email: str = None) -> str:
    """Resolve the internal parent_id (may differ from Supabase Auth UID)."""
    result = db.table("parents").select("parent_id").eq("parent_id", auth_uid).limit(1).execute()
    if result.data:
        return result.data[0]["parent_id"]
    if email:
        result = db.table("parents").select("parent_id").eq("email", email).limit(1).execute()
        if result.data:
            return result.data[0]["parent_id"]
    return auth_uid


@router.post("/teacher/{student_id}")
async def create_teacher_report(student_id: str, user: dict = Depends(verify_token)):
    """Generate a teacher report with step-level detail."""
    auth_uid = user.get("id", user.get("sub", ""))
    email = user.get("email", "")

    # Resolve internal teacher_id for FK constraint
    db = get_db()
    teacher_id = _resolve_teacher_id(db, auth_uid, email)

    try:
        report = await generate_teacher_report(teacher_id, student_id)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


@router.get("/teacher/{student_id}")
async def get_teacher_report(student_id: str):
    """Retrieve the latest teacher report for a student."""
    report = await get_latest_report(student_id, "teacher")
    if not report:
        raise HTTPException(status_code=404, detail="No teacher report found")
    return report


@router.post("/parent/{student_id}")
async def create_parent_report(student_id: str, user: dict = Depends(verify_token)):
    """Generate a parent report with plain-language summary."""
    auth_uid = user.get("id", user.get("sub", ""))
    email = user.get("email", "")

    # Resolve internal parent_id for FK constraint
    db = get_db()
    parent_id = _resolve_parent_id(db, auth_uid, email)

    try:
        report = await generate_parent_report(parent_id, student_id)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


@router.get("/parent/{student_id}")
async def get_parent_report(student_id: str):
    """Retrieve the latest parent report for a student."""
    report = await get_latest_report(student_id, "parent")
    if not report:
        raise HTTPException(status_code=404, detail="No parent report found")
    return report
