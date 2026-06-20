"""
Cheatsheet route — GET /cheatsheet
Serves the static cheatsheet JSON with LaTeX formulas and concepts.
"""

import json
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

# Load cheatsheet data once at startup
_cheatsheet_path = Path(__file__).resolve().parent.parent.parent.parent / "database" / "seed" / "cheatsheet.json"
_cheatsheet_data = None


def _load_cheatsheet():
    global _cheatsheet_data
    if _cheatsheet_data is None:
        try:
            with open(_cheatsheet_path, "r", encoding="utf-8") as f:
                _cheatsheet_data = json.load(f)
        except FileNotFoundError:
            _cheatsheet_data = []
    return _cheatsheet_data


@router.get("")
async def get_cheatsheet():
    """
    Return the full Quadratic Equations cheatsheet.
    Sections include: Standard Form, Solution Methods, Discriminant,
    Important Identities, Word Problem Strategies, Exam Tips.
    """
    data = _load_cheatsheet()
    return JSONResponse(content={"sections": data, "total_sections": len(data)})
