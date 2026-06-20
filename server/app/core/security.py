"""
JWT verification and role extraction via Supabase.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx

from app.core.config import settings

security = HTTPBearer()


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verify a Supabase JWT and return the user payload.
    Raises 401 if the token is invalid or expired.
    """
    token = credentials.credentials

    try:
        # Verify the token via Supabase's /auth/v1/user endpoint
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                },
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )

        user_data = response.json()
        return user_data

    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable",
        )


def require_role(allowed_roles: list[str]):
    """
    Dependency factory: verifies the user has one of the allowed roles.
    Usage: Depends(require_role(["student", "teacher"]))
    """
    async def role_checker(user: dict = Depends(verify_token)) -> dict:
        user_role = user.get("user_metadata", {}).get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user_role}' not authorized. Required: {allowed_roles}",
            )
        return user

    return role_checker
