"""
Grading Tests — Unit tests for the grading validation pipeline.

Tests the _validate_grading_result function independently of Gemini.
Also tests the prompt builder and response parser.
"""

import pytest
from app.services.grading_service import _validate_grading_result


class TestValidateGradingResult:
    """Tests for grading result validation and sanitization."""

    def _make_rubric(self):
        return [
            {"step_number": 1, "max_marks": 1, "step_description": "Write equation"},
            {"step_number": 2, "max_marks": 2, "step_description": "Factorize"},
            {"step_number": 3, "max_marks": 1, "step_description": "Solve"},
        ]

    def test_full_marks_answer(self):
        """A perfect answer should retain full marks after validation."""
        result = {
            "step_marks": [
                {"step_id": 1, "marks_awarded": 1, "max_marks": 1, "justification": "Correct"},
                {"step_id": 2, "marks_awarded": 2, "max_marks": 2, "justification": "Correct"},
                {"step_id": 3, "marks_awarded": 1, "max_marks": 1, "justification": "Correct"},
            ],
            "total_marks_awarded": 4,
            "total_max_marks": 4,
            "feedback": "Excellent work!",
            "confidence": "high",
        }
        validated = _validate_grading_result(result, self._make_rubric())
        assert validated["total_marks_awarded"] == 4
        assert validated["total_max_marks"] == 4
        assert validated["confidence"] == "high"

    def test_marks_capped_to_max(self):
        """Marks exceeding max_marks per step should be capped."""
        result = {
            "step_marks": [
                {"step_id": 1, "marks_awarded": 5, "max_marks": 1, "justification": "Overcounted"},
                {"step_id": 2, "marks_awarded": 10, "max_marks": 2, "justification": "Overcounted"},
                {"step_id": 3, "marks_awarded": 3, "max_marks": 1, "justification": "Overcounted"},
            ],
            "total_marks_awarded": 18,
            "total_max_marks": 4,
            "feedback": "Good",
            "confidence": "medium",
        }
        validated = _validate_grading_result(result, self._make_rubric())
        assert validated["total_marks_awarded"] == 4  # 1 + 2 + 1
        assert validated["step_marks"][0]["marks_awarded"] == 1
        assert validated["step_marks"][1]["marks_awarded"] == 2
        assert validated["step_marks"][2]["marks_awarded"] == 1

    def test_negative_marks_floored_to_zero(self):
        """Negative marks should be floored to 0."""
        result = {
            "step_marks": [
                {"step_id": 1, "marks_awarded": -1, "max_marks": 1, "justification": "Wrong"},
            ],
            "total_marks_awarded": -1,
            "total_max_marks": 4,
            "feedback": "Try again",
            "confidence": "high",
        }
        validated = _validate_grading_result(result, self._make_rubric())
        assert validated["step_marks"][0]["marks_awarded"] == 0

    def test_missing_steps_get_zero(self):
        """Steps not mentioned in AI response should get 0 marks."""
        result = {
            "step_marks": [
                {"step_id": 1, "marks_awarded": 1, "max_marks": 1, "justification": "Ok"},
            ],
            "total_marks_awarded": 1,
            "total_max_marks": 1,
            "feedback": "Partial",
            "confidence": "medium",
        }
        validated = _validate_grading_result(result, self._make_rubric())
        assert len(validated["step_marks"]) == 3
        assert validated["total_marks_awarded"] == 1
        assert validated["total_max_marks"] == 4

    def test_empty_response(self):
        """Empty AI response should produce all-zero result."""
        result = {
            "step_marks": [],
            "total_marks_awarded": 0,
            "total_max_marks": 0,
            "feedback": "Error",
            "confidence": "low",
        }
        validated = _validate_grading_result(result, self._make_rubric())
        assert validated["total_marks_awarded"] == 0
        assert validated["total_max_marks"] == 4
        assert len(validated["step_marks"]) == 3

    def test_zero_marks_answer(self):
        """A completely wrong answer should have all zero marks."""
        result = {
            "step_marks": [
                {"step_id": 1, "marks_awarded": 0, "max_marks": 1, "justification": "Incorrect"},
                {"step_id": 2, "marks_awarded": 0, "max_marks": 2, "justification": "Incorrect"},
                {"step_id": 3, "marks_awarded": 0, "max_marks": 1, "justification": "Incorrect"},
            ],
            "total_marks_awarded": 0,
            "total_max_marks": 4,
            "feedback": "Keep practicing",
            "confidence": "high",
        }
        validated = _validate_grading_result(result, self._make_rubric())
        assert validated["total_marks_awarded"] == 0
        assert validated["total_max_marks"] == 4


class TestPromptBuilder:
    """Tests for the grading prompt builder."""

    def test_typed_prompt(self):
        from app.ai.prompts import build_grading_prompt

        system, user = build_grading_prompt(
            question_text="Solve x^2 - 5x + 6 = 0",
            marks=4,
            subtopic="factorization",
            rubric_steps=[{
                "step_number": 1,
                "step_description": "Write in standard form",
                "max_marks": 1,
                "ideal_solution_snippet": "Already in standard form",
                "keywords": ["standard", "form"],
            }],
            student_answer="x = 2, 3",
            input_mode="typed",
        )
        assert "factorization" in system
        assert "typed" in system
        assert "x = 2, 3" in user

    def test_photo_prompt(self):
        from app.ai.prompts import build_grading_prompt

        system, user = build_grading_prompt(
            question_text="Solve using quadratic formula",
            marks=3,
            subtopic="quadratic_formula",
            rubric_steps=[],
            student_answer="",
            input_mode="photo",
        )
        assert "photo" in system
        assert "handwritten" in user.lower()


class TestResponseParser:
    """Tests for the Gemini response parser."""

    def test_ensure_required_fields(self):
        from app.ai.gemini_client import _ensure_required_fields

        result = _ensure_required_fields({"step_marks": [{"marks_awarded": 2, "max_marks": 3}]})
        assert "feedback" in result
        assert "confidence" in result
        assert result["total_marks_awarded"] == 2
        assert result["total_max_marks"] == 3

    def test_error_response(self):
        from app.ai.gemini_client import _error_response

        result = _error_response("test error")
        assert result["feedback"] == "test error"
        assert result["confidence"] == "low"
        assert result["total_marks_awarded"] == 0
