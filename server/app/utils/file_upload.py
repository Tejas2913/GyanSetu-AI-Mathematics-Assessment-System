"""
File Upload Utility — Handle photo upload to Supabase Storage.
"""

import base64
import httpx
from app.core.config import settings


async def upload_photo_to_storage(db, image_base64: str, student_id: str, attempt_id: str) -> str:
    """
    Upload a base64-encoded photo to Supabase Storage.

    Args:
        db: Supabase client instance
        image_base64: Base64-encoded image data
        student_id: Student's UUID
        attempt_id: Attempt's UUID

    Returns:
        Storage path for the uploaded file
    """
    bucket = settings.SUPABASE_STORAGE_BUCKET
    file_path = f"{student_id}/{attempt_id}.jpg"
    image_bytes = base64.b64decode(image_base64)

    db.storage.from_(bucket).upload(
        path=file_path,
        file=image_bytes,
        file_options={"content-type": "image/jpeg"},
    )

    return file_path


async def get_signed_url(db, storage_path: str, expires_in: int = 3600) -> str:
    """
    Get a signed URL for a stored image.

    Args:
        db: Supabase client instance
        storage_path: Path in the storage bucket
        expires_in: URL expiry time in seconds

    Returns:
        Signed URL string
    """
    bucket = settings.SUPABASE_STORAGE_BUCKET
    result = db.storage.from_(bucket).create_signed_url(storage_path, expires_in)
    return result.get("signedURL") or result.get("signedUrl", "")


async def download_image_as_base64(db, storage_path: str) -> str:
    """
    Download an image from Supabase Storage and return as base64.

    Args:
        db: Supabase client instance
        storage_path: Path in the storage bucket

    Returns:
        Base64-encoded image string
    """
    url = await get_signed_url(db, storage_path)
    if not url:
        raise ValueError(f"Could not get signed URL for {storage_path}")

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return base64.b64encode(response.content).decode("utf-8")
