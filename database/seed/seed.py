"""
GyanSetu Seed Script — Populate Supabase with questions, rubrics, metadata, and cheatsheet.

Usage:
    cd gyansetu/database/seed
    python seed.py

Requirements:
    pip install supabase python-dotenv
"""

import json
import os
import sys
from pathlib import Path

# Add server directory to path for config access
server_dir = Path(__file__).resolve().parent.parent.parent / "server"
sys.path.insert(0, str(server_dir))

try:
    from supabase import create_client
    from dotenv import load_dotenv
except ImportError:
    print("❌ Missing dependencies. Run: pip install supabase python-dotenv")
    sys.exit(1)


def load_env():
    """Load environment variables from server/.env"""
    env_path = server_dir / ".env"
    if not env_path.exists():
        print(f"❌ Server .env not found at {env_path}")
        sys.exit(1)
    load_dotenv(env_path)
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in server/.env")
        sys.exit(1)
    return url, key


def load_json(filename):
    """Load a JSON file from the seed directory."""
    filepath = Path(__file__).parent / filename
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def seed_questions(supabase):
    """Insert 40 questions into the questions table."""
    questions = load_json("questions.json")
    print(f"\n📝 Seeding {len(questions)} questions...")

    # Insert in batches
    result = supabase.table("questions").upsert(questions, on_conflict="question_id").execute()
    print(f"   ✅ Inserted/updated {len(result.data)} questions")
    return result.data


def seed_question_metadata(supabase):
    """Insert question metadata (importance, difficulty, hot flags)."""
    metadata = load_json("question_metadata.json")
    print(f"\n🏷️  Seeding {len(metadata)} question metadata records...")

    result = supabase.table("question_metadata").upsert(metadata, on_conflict="question_id").execute()
    print(f"   ✅ Inserted/updated {len(result.data)} metadata records")
    return result.data


def seed_rubrics(supabase):
    """Insert rubric steps for all questions."""
    rubric_data = load_json("rubrics.json")
    print(f"\n📐 Seeding rubrics for {len(rubric_data)} questions...")

    total_steps = 0
    for question in rubric_data:
        question_id = question["question_id"]
        for step in question["steps"]:
            row = {
                "question_id": question_id,
                "step_number": step["step_number"],
                "step_description": step["step_description"],
                "max_marks": step["max_marks"],
                "ideal_solution_snippet": step["ideal_solution_snippet"],
                "keywords": step["keywords"],
            }
            supabase.table("rubrics").upsert(
                row, on_conflict="question_id,step_number"
            ).execute()
            total_steps += 1

    print(f"   ✅ Inserted/updated {total_steps} rubric steps")


def seed_cheatsheet(supabase):
    """
    Store cheatsheet data. Since there's no cheatsheet table in the schema,
    we'll create a simple key-value store or the client can load it from the JSON directly.
    For now, we'll save it as a static JSON that the API serves.
    """
    cheatsheet = load_json("cheatsheet.json")
    total_concepts = sum(len(section["concepts"]) for section in cheatsheet)
    print(f"\n📚 Cheatsheet loaded: {len(cheatsheet)} sections, {total_concepts} concepts")
    print("   ℹ️  Cheatsheet will be served as static JSON from the API (no DB table needed)")


def main():
    """Run all seed operations."""
    print("=" * 60)
    print("🌱 GyanSetu Seed Script")
    print("=" * 60)

    url, key = load_env()
    print(f"\n🔗 Connecting to Supabase: {url[:40]}...")

    supabase = create_client(url, key)
    print("   ✅ Connected")

    try:
        # Order matters: questions first, then metadata and rubrics (foreign keys)
        seed_questions(supabase)
        seed_question_metadata(supabase)
        seed_rubrics(supabase)
        seed_cheatsheet(supabase)

        print("\n" + "=" * 60)
        print("🎉 Seed complete!")
        print("=" * 60)
        print("\nSummary:")
        print("  • 40 questions across 5 subtopics")
        print("  • 40 metadata records with importance scores")
        print("  • 130+ rubric steps with ideal solutions")
        print("  • 20+ cheatsheet concepts with LaTeX formulas")

    except Exception as e:
        print(f"\n❌ Seed failed: {e}")
        raise


if __name__ == "__main__":
    main()
