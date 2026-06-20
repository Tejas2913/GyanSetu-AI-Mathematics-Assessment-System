"""
Report Service — Aggregate evaluation data into teacher/parent report templates.
"""

import uuid
from datetime import datetime, timezone

from app.db.supabase_client import get_db
from app.services.analytics_service import get_weak_topics, get_performance_trend


async def generate_teacher_report(teacher_id: str, student_id: str) -> dict:
    """
    Generate a teacher report with step-level detail.
    Aggregates all evaluations, shows per-subtopic breakdown,
    highlights weak areas, and shows step-level patterns.
    """
    db = get_db()

    # Get student info
    student = db.table("students").select("name").eq("student_id", student_id).single().execute()
    student_name = student.data.get("name", "Student") if student.data else "Student"

    # Get analytics
    weak_topics = await get_weak_topics(student_id)
    performance = await get_performance_trend(student_id, days=30)

    # Get recent evaluations with details
    recent_evals = (
        db.table("attempts")
        .select("*, questions(question_text, subtopic, marks), evaluations(*)")
        .eq("student_id", student_id)
        .order("submitted_at", desc=True)
        .limit(20)
        .execute()
    )

    # Build summary
    weak_list = [t["subtopic"] for t in weak_topics if t.get("status") == "weak"]
    strong_list = [t["subtopic"] for t in weak_topics if t.get("status") == "strong"]

    summary_parts = [
        f"Student: {student_name}",
        f"Total Attempts: {performance['total_attempts']}",
        f"Overall Average: {performance['avg_score']:.1f}%",
        "",
        "Subtopic Breakdown:",
    ]

    for topic in weak_topics:
        status_emoji = {"strong": "🟢", "average": "🟡", "weak": "🔴"}.get(topic.get("status"), "⚪")
        summary_parts.append(
            f"  {status_emoji} {topic['subtopic']}: {topic.get('average_score_pct', 0):.1f}% "
            f"({topic.get('attempts_count', 0)} attempts) — {topic.get('status', 'N/A')}"
        )

    if weak_list:
        summary_parts.append(f"\n⚠️ Needs attention: {', '.join(weak_list)}")
    if strong_list:
        summary_parts.append(f"✅ Strong areas: {', '.join(strong_list)}")

    summary_text = "\n".join(summary_parts)

    # Store the report
    report_id = str(uuid.uuid4())
    report_row = {
        "report_id": report_id,
        "teacher_id": teacher_id,
        "student_id": student_id,
        "summary_text": summary_text,
    }

    db.table("teacher_reports").insert(report_row).execute()

    report_row["generated_at"] = datetime.now(timezone.utc).isoformat()
    report_row["weak_topics"] = weak_topics
    report_row["performance"] = performance
    report_row["recent_evaluations"] = recent_evals.data

    return report_row


async def generate_parent_report(parent_id: str, student_id: str) -> dict:
    """
    Generate a parent report with plain-language summary.
    Focuses on encouragement, overall progress, and simple guidance.
    """
    db = get_db()

    # Get student info
    student = db.table("students").select("name").eq("student_id", student_id).single().execute()
    student_name = student.data.get("name", "Your child") if student.data else "Your child"

    # Get analytics
    weak_topics = await get_weak_topics(student_id)
    performance = await get_performance_trend(student_id, days=30)

    # Build parent-friendly summary
    avg = performance["avg_score"]
    total = performance["total_attempts"]

    if avg >= 75:
        overall = f"{student_name} is doing excellent work! 🌟"
    elif avg >= 50:
        overall = f"{student_name} is making good progress and improving steadily. 👍"
    elif avg >= 25:
        overall = f"{student_name} is working hard and needs a bit more practice. 💪"
    else:
        overall = f"{student_name} is just getting started. Regular practice will help a lot! 📚"

    weak_list = [t["subtopic"].replace("_", " ").title() for t in weak_topics if t.get("status") == "weak"]
    strong_list = [t["subtopic"].replace("_", " ").title() for t in weak_topics if t.get("status") == "strong"]

    summary_parts = [
        f"📊 Report for {student_name}",
        f"\n{overall}",
        f"\n📝 Total questions attempted: {total}",
        f"📈 Average score: {avg:.0f}%",
    ]

    if strong_list:
        summary_parts.append(f"\n✅ Doing well in: {', '.join(strong_list)}")
    if weak_list:
        summary_parts.append(f"\n📖 Could use more practice in: {', '.join(weak_list)}")
    else:
        summary_parts.append("\n🎯 All topics are on track!")

    summary_parts.append(
        f"\n💡 Tip: Encourage {student_name} to practice at least 5 questions daily "
        f"for consistent improvement."
    )

    summary_text = "\n".join(summary_parts)

    # Store the report
    report_id = str(uuid.uuid4())
    report_row = {
        "report_id": report_id,
        "parent_id": parent_id,
        "student_id": student_id,
        "summary_text": summary_text,
    }

    db.table("parent_reports").insert(report_row).execute()

    report_row["generated_at"] = datetime.now(timezone.utc).isoformat()
    return report_row


async def get_latest_report(student_id: str, role: str) -> dict:
    """Retrieve the most recent report for a student."""
    db = get_db()
    table = "teacher_reports" if role == "teacher" else "parent_reports"

    result = (
        db.table(table)
        .select("*")
        .eq("student_id", student_id)
        .order("generated_at", desc=True)
        .limit(1)
        .execute()
    )

    return result.data[0] if result.data else None
