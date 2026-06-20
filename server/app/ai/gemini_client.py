"""
Gemini Client — google.generativeai SDK wrapper for Gemini 2.5 Flash.

Handles:
- Model initialization with API key
- Text-only grading calls (typed / voice transcript)
- Multimodal grading calls (handwriting photo → vision)
- Structured JSON output parsing
- Error handling and retries
"""

import json
import re
import base64
import asyncio
from typing import Optional

import google.generativeai as genai
from google.generativeai.types import GenerationConfig

from app.core.config import settings
from app.ai.schemas import GRADING_RESPONSE_SCHEMA


# Configure the SDK once on import
genai.configure(api_key=settings.GEMINI_API_KEY)

# Token budgets by input mode.
# Photo needs more tokens: vision reasoning + JSON for all steps.
TOKEN_BUDGETS = {
    "text": 1500,
    "voice": 1500,
    "photo": 4096,
}


def get_model(input_mode: str = "text"):
    """
    Get a configured Gemini model instance.

    Args:
        input_mode: 'text', 'voice', or 'photo' — controls token budget.
    """
    max_tokens = TOKEN_BUDGETS.get(input_mode, 1500)

    return genai.GenerativeModel(
        model_name=settings.GEMINI_MODEL,
        generation_config=GenerationConfig(
            temperature=settings.GEMINI_TEMPERATURE,
            max_output_tokens=max_tokens,
            response_mime_type="application/json",
            response_schema=GRADING_RESPONSE_SCHEMA,
        ),
    )


async def grade_text_answer(system_prompt: str, user_prompt: str) -> dict:
    """
    Grade a typed or voice-transcribed answer (text-only).

    Args:
        system_prompt: The full system prompt with rubric, ideal solution, and rules.
        user_prompt: The student's transcribed answer.

    Returns:
        Parsed JSON dict with step_marks, feedback, confidence, etc.
    """
    model = get_model(input_mode="text")

    response = await asyncio.to_thread(
        model.generate_content,
        [system_prompt, user_prompt],
    )

    return _parse_response(response)


async def grade_photo_answer(
    system_prompt: str,
    user_prompt: str,
    image_data: str,
    mime_type: str = "image/jpeg",
) -> dict:
    """
    Grade a handwriting photo answer (multimodal — image + text).

    Args:
        system_prompt: The full system prompt with rubric and rules.
        user_prompt: Additional context about the question being answered.
        image_data: Base64-encoded image string.
        mime_type: MIME type of the image.

    Returns:
        Parsed JSON dict with step_marks, feedback, confidence, etc.
    """
    model = get_model(input_mode="photo")

    image_bytes = base64.b64decode(image_data)

    image_part = {
        "mime_type": mime_type,
        "data": image_bytes,
    }

    response = await asyncio.to_thread(
        model.generate_content,
        [system_prompt, user_prompt, image_part],
    )

    return _parse_response(response)


def _parse_response(response) -> dict:
    """
    Parse the Gemini response into a structured dict.
    With response_schema enforced, Strategy 1 (direct parse) should
    succeed virtually always. The fallback chain is kept for safety.
    """
    if not response:
        return _error_response("no_response", "No response from AI. Please try again.")

    if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
        block_reason = getattr(response.prompt_feedback, 'block_reason', None)
        if block_reason:
            return _error_response("blocked", f"Response blocked by safety filter: {block_reason}")

    # Check finish reason — STOP is good, MAX_TOKENS means truncation
    finish_reason = None
    try:
        if response.candidates:
            finish_reason = str(response.candidates[0].finish_reason)
    except Exception:
        pass

    try:
        text = response.text
    except (ValueError, AttributeError):
        return _error_response("empty_response", "AI response was empty or blocked. Please try again.")

    if not text:
        return _error_response("empty_text", "Empty AI response. Please try again.")

    print(f"[GRADING] finish_reason={finish_reason}, response length={len(text)} chars")
    print(f"[GRADING] Raw response preview: {text[:300]}...")

    result = _try_parse_json(text)
    if result is not None:
        validated = _ensure_required_fields(result)

        if finish_reason and "MAX_TOKENS" in finish_reason:
            print(
                f"[GRADING] WARNING: Response was truncated (MAX_TOKENS). "
                f"Got {len(validated.get('step_marks', []))} steps."
            )
            validated["_parse_warning"] = "truncated"

        return validated

    return _error_response("parse_failed", f"Grading response could not be parsed. Raw: {text[:500]}")


def _try_parse_json(text: str) -> dict | None:
    """
    Try multiple strategies to extract valid JSON from text.
    With response_schema enforced, Strategy 1 should almost always win.
    Fallbacks are kept for edge cases.
    """
    text = text.strip()

    # Strategy 1: Direct parse (ideal — pure JSON)
    try:
        result = json.loads(text)
        print("[GRADING] Strategy 1 succeeded: direct JSON parse")
        return result
    except json.JSONDecodeError as e:
        print(f"[GRADING] Strategy 1 failed: {e}")

    # Strategy 2: Strip markdown code fences
    cleaned = _strip_markdown_fences(text)
    if cleaned != text:
        try:
            result = json.loads(cleaned)
            print("[GRADING] Strategy 2 succeeded: stripped markdown fences")
            return result
        except json.JSONDecodeError as e:
            print(f"[GRADING] Strategy 2 failed: {e}")

    # Strategy 3: Extract outermost JSON object using brace matching
    extracted = _extract_json_object(text)
    if extracted:
        try:
            result = json.loads(extracted)
            print("[GRADING] Strategy 3 succeeded: brace-matched extraction")
            return result
        except json.JSONDecodeError as e:
            print(f"[GRADING] Strategy 3 failed: {e}")

    # Strategy 4: Repair truncated JSON
    repaired = _repair_truncated_json(text)
    if repaired:
        try:
            result = json.loads(repaired)
            print("[GRADING] Strategy 4 succeeded: repaired truncated JSON")
            return result
        except json.JSONDecodeError as e:
            print(f"[GRADING] Strategy 4 failed: {e}")

    # Strategy 5: Extract individual step objects by balanced-brace parsing
    extracted_result = _extract_fields_manually(text)
    if extracted_result:
        step_count = len(extracted_result.get('step_marks', []))
        print(f"[GRADING] Strategy 5 succeeded: extracted {step_count} steps manually")
        if step_count == 1:
            print(
                "[GRADING] WARNING: Only 1 step recovered — likely truncated response. "
                "Check max_output_tokens budget."
            )
        return extracted_result

    print("[GRADING] All parsing strategies failed")
    return None


def _strip_markdown_fences(text: str) -> str:
    """Remove markdown code fences from around JSON."""
    pattern = r'^```(?:json)?\s*\n?(.*?)\n?\s*```\s*$'
    match = re.match(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    pattern2 = r'```(?:json)?\s*\n(.*?)\n\s*```'
    match2 = re.search(pattern2, text, re.DOTALL)
    if match2:
        return match2.group(1).strip()
    return text


def _extract_json_object(text: str) -> str | None:
    """Extract the outermost JSON object using balanced brace matching."""
    start = text.find("{")
    if start == -1:
        return None

    depth = 0
    in_string = False
    escape_next = False

    for i in range(start, len(text)):
        ch = text[i]
        if escape_next:
            escape_next = False
            continue
        if ch == '\\' and in_string:
            escape_next = True
            continue
        if ch == '"':
            if not escape_next:
                in_string = not in_string
            continue
        if in_string:
            continue
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return text[start:i + 1]

    return None


def _repair_truncated_json(text: str) -> str | None:
    """
    Attempt to repair truncated JSON by closing open structures.
    Handles cases where Gemini's response was cut off by max_output_tokens.
    """
    start = text.find("{")
    if start == -1:
        return None

    json_text = text[start:]
    depth_brace = 0
    depth_bracket = 0
    in_string = False
    escape_next = False

    for ch in json_text:
        if escape_next:
            escape_next = False
            continue
        if ch == '\\' and in_string:
            escape_next = True
            continue
        if ch == '"' and not escape_next:
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == '{':
            depth_brace += 1
        elif ch == '}':
            depth_brace -= 1
        elif ch == '[':
            depth_bracket += 1
        elif ch == ']':
            depth_bracket -= 1

    if depth_brace == 0 and depth_bracket == 0:
        return None  # Already balanced, not a truncation issue

    repaired = json_text.rstrip()

    if in_string:
        repaired += '..."'

    repaired = re.sub(r',\s*"[^"]*$', '', repaired)
    repaired = re.sub(r',\s*$', '', repaired)

    repaired += ']' * depth_bracket
    repaired += '}' * depth_brace

    return repaired


def _extract_fields_manually(text: str) -> dict | None:
    """
    Last resort: extract individual step objects by finding balanced { } pairs
    that contain 'step_id', then parse each one individually.
    """
    result = {}
    step_marks = []

    all_objects = _find_all_json_objects(text)

    for obj_str in all_objects:
        try:
            obj = json.loads(obj_str)
            if "step_id" in obj:
                step = {
                    "step_id": int(obj["step_id"]),
                    "marks_awarded": float(obj.get("marks_awarded", 0)),
                    "max_marks": float(obj.get("max_marks", 1)),
                    "justification": str(obj.get("justification", "")),
                }
                step_marks.append(step)
        except (json.JSONDecodeError, ValueError, TypeError):
            continue

    if not step_marks:
        return None

    # Deduplicate by step_id (keep first occurrence)
    seen = set()
    unique_steps = []
    for step in step_marks:
        if step["step_id"] not in seen:
            seen.add(step["step_id"])
            unique_steps.append(step)

    result["step_marks"] = unique_steps

    feedback_match = re.search(r'"feedback"\s*:\s*"((?:[^"\\]|\\.)*)"', text)
    if feedback_match:
        result["feedback"] = feedback_match.group(1)

    conf_match = re.search(r'"confidence"\s*:\s*"(high|medium|low)"', text)
    if conf_match:
        result["confidence"] = conf_match.group(1)

    return result


def _find_all_json_objects(text: str) -> list[str]:
    """Find all JSON objects { ... } in text using balanced brace matching."""
    objects = []
    i = 0
    while i < len(text):
        if text[i] == '{':
            obj_str = _extract_balanced_braces(text, i)
            if obj_str:
                objects.append(obj_str)
                i += len(obj_str)
                continue
        i += 1
    return objects


def _extract_balanced_braces(text: str, start: int) -> str | None:
    """Extract a balanced { ... } block starting at position start."""
    if start >= len(text) or text[start] != '{':
        return None

    depth = 0
    in_string = False
    escape_next = False

    for i in range(start, len(text)):
        ch = text[i]
        if escape_next:
            escape_next = False
            continue
        if ch == '\\' and in_string:
            escape_next = True
            continue
        if ch == '"' and not escape_next:
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return text[start:i + 1]

    return None


def _ensure_required_fields(result: dict) -> dict:
    """Ensure the grading result has all required fields with sensible defaults."""
    if "step_marks" not in result:
        result["step_marks"] = []

    for step in result["step_marks"]:
        if "marks_awarded" in step:
            step["marks_awarded"] = float(step["marks_awarded"])
        if "max_marks" in step:
            step["max_marks"] = float(step["max_marks"])

    if "total_marks_awarded" not in result:
        result["total_marks_awarded"] = sum(s.get("marks_awarded", 0) for s in result["step_marks"])
    if "total_max_marks" not in result:
        result["total_max_marks"] = sum(s.get("max_marks", 0) for s in result["step_marks"])
    if "feedback" not in result:
        result["feedback"] = "Keep practicing!"
    if "confidence" not in result:
        result["confidence"] = "medium"

    return result


def _error_response(error_code: str, message: str) -> dict:
    """Return a standardized error response with a machine-readable error_code."""
    print(f"[GRADING] ERROR [{error_code}]: {message}")
    return {
        "step_marks": [],
        "total_marks_awarded": 0,
        "total_max_marks": 0,
        "feedback": message,
        "confidence": "low",
        "error_code": error_code,
    }