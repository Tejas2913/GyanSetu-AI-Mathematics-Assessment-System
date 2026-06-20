"""
Supabase Python client initialization.
"""

from supabase import create_client, Client
from app.core.config import settings


def get_supabase_client() -> Client:
    """Create and return a Supabase client using the service role key."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. "
            "Set them in server/.env"
        )

    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY,
    )


# Singleton client instance
supabase: Client = None


def get_db() -> Client:
    """Get the Supabase client singleton. Lazy-initialized."""
    global supabase
    if supabase is None:
        supabase = get_supabase_client()
    return supabase
