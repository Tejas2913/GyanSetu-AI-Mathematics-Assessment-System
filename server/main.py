"""
GyanSetu — FastAPI Application Entry Point

Configures CORS, includes all API routers, and provides a health check endpoint.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup: verify connections
    print(f"GyanSetu API starting in {settings.APP_ENV} mode")
    yield
    # Shutdown: cleanup
    print("GyanSetu API shutting down")


app = FastAPI(
    title="GyanSetu API",
    description="AI-Graded Practice Engine for Class 10 Mathematics — Quadratic Equations",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routes under /api/v1
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "gyansetu-api"}
