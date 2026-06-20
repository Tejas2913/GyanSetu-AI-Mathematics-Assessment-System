"""
Grading Prompts — System prompt and prompt builder for the AI Grading Service.

The prompt structure:
1. System instruction: role, rules, output format
2. Rubric injection: step descriptions, max marks per step, keywords
3. Ideal solution: the worked solution for comparison
4. Student answer: the raw input (text or image)
5. Output format: forced JSON schema
"""

GRADING_SYSTEM_PROMPT = """You are an expert CBSE Class 10 Mathematics examiner specializing in Quadratic Equations.
You grade student answers step-by-step against a provided rubric.

STRICT RULES:
1. Score EACH step independently against its rubric description.
2. You may ONLY award marks for steps defined in the rubric — do NOT invent new criteria.
3. Each step's marks_awarded MUST be between 0 and that step's max_marks (inclusive).
4. The total_marks_awarded MUST equal the sum of all individual step marks_awarded.
5. If the student's handwriting or input is illegible, set confidence to "low".
6. If the student uses a correct alternative method, still award marks if the mathematical reasoning is valid.
7. Provide a brief justification for each step's score.
8. End with constructive, encouraging feedback in 2-3 sentences.

You MUST respond with valid JSON matching this exact schema:
{
  "step_marks": [
    {
      "step_id": <integer - the step_number>,
      "marks_awarded": <integer - 0 to max_marks>,
      "max_marks": <integer - from rubric>,
      "justification": "<brief explanation of why these marks were awarded>"
    }
  ],
  "total_marks_awarded": <integer - sum of all marks_awarded>,
  "total_max_marks": <integer - sum of all max_marks>,
  "feedback": "<constructive feedback for the student, 2-3 sentences>",
  "confidence": "<'high' | 'medium' | 'low'>"
}"""


def build_grading_prompt(
    question_text: str,
    marks: int,
    subtopic: str,
    rubric_steps: list[dict],
    student_answer: str,
    input_mode: str = "typed",
) -> tuple[str, str]:
    """
    Build the system prompt and user prompt for a grading call.

    Args:
        question_text: The question being answered.
        marks: Total marks for the question.
        subtopic: The subtopic (factorization, quadratic_formula, etc.).
        rubric_steps: List of rubric step dicts with step_number, step_description,
                      max_marks, ideal_solution_snippet, keywords.
        student_answer: The student's answer text (or description for photo).
        input_mode: 'typed', 'voice', or 'photo'.

    Returns:
        Tuple of (system_prompt, user_prompt).
    """
    # Build rubric section
    rubric_lines = []
    for step in rubric_steps:
        rubric_lines.append(
            f"  Step {step['step_number']} ({step['max_marks']} mark{'s' if step['max_marks'] > 1 else ''}):\n"
            f"    Description: {step['step_description']}\n"
            f"    Ideal Solution: {step['ideal_solution_snippet']}\n"
            f"    Keywords: {', '.join(step.get('keywords', []))}"
        )
    rubric_text = "\n".join(rubric_lines)

    # Build the full system prompt
    system_prompt = f"""{GRADING_SYSTEM_PROMPT}

--- QUESTION ---
Subject: Mathematics | Topic: Quadratic Equations | Subtopic: {subtopic}
Total Marks: {marks}

Question: {question_text}

--- MARKING RUBRIC ---
{rubric_text}

--- GRADING INSTRUCTIONS ---
- Grade the student's answer below against EACH rubric step.
- Award partial marks where the student shows correct intermediate work.
- If the student uses a different valid method, award marks for equivalent steps.
- Input mode: {input_mode}"""

    # Build the user prompt
    if input_mode == "photo":
        user_prompt = (
            "The student's handwritten answer is in the attached image. "
            "Read the handwriting carefully and grade each step against the rubric. "
            "If any part is illegible, note it in the justification and set confidence to 'low'."
        )
    elif input_mode == "voice":
        user_prompt = (
            f"The student's answer was spoken and transcribed. "
            f"Note: there may be transcription errors in mathematical notation.\n\n"
            f"Student's Answer (voice transcription):\n{student_answer}"
        )
    else:
        user_prompt = f"Student's Answer (typed):\n{student_answer}"

    return system_prompt, user_prompt
