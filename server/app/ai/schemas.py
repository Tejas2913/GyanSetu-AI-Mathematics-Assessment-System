"""
JSON Output Schema — Structured response format for Gemini grading calls.

This schema is passed to Gemini's structured output feature to ensure
consistent, parseable responses.
"""

# The schema that Gemini must conform to when returning grading results.
# Matches the EvaluationOut Pydantic model.

GRADING_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "step_marks": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "step_id": {"type": "integer"},
                    "marks_awarded": {"type": "integer"},
                    "max_marks": {"type": "integer"},
                    "justification": {"type": "string"},
                },
                "required": ["step_id", "marks_awarded", "max_marks", "justification"],
            },
        },
        "total_marks_awarded": {"type": "integer"},
        "total_max_marks": {"type": "integer"},
        "feedback": {"type": "string"},
        "confidence": {
            "type": "string",
            "enum": ["high", "medium", "low"],
        },
    },
    "required": ["step_marks", "total_marks_awarded", "total_max_marks", "feedback", "confidence"],
}
