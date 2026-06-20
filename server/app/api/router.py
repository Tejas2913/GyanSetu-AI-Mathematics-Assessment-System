"""
Central API Router — includes all sub-routers.
"""

from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.questions import router as questions_router
from app.api.attempts import router as attempts_router
from app.api.grading import router as grading_router
from app.api.analytics import router as analytics_router
from app.api.reports import router as reports_router
from app.api.cheatsheet import router as cheatsheet_router
from app.api.users import router as users_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(questions_router, prefix="/questions", tags=["Questions"])
api_router.include_router(attempts_router, prefix="/attempts", tags=["Attempts"])
api_router.include_router(grading_router, tags=["Grading"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
api_router.include_router(cheatsheet_router, prefix="/cheatsheet", tags=["Cheatsheet"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
