import os
import shutil
from typing import List, Set
from pathlib import Path
import magic
import aiofiles
from fastapi import UploadFile, HTTPException
import logging
from datetime import datetime
import hashlib

logger = logging.getLogger(__name__)

class FileUploadService:
    # Allowed MIME types per format
    ALLOWED_MIME_TYPES = {
        'pdf': {'application/pdf'},
        'image': {'image/jpeg', 'image/png', 'image/gif'},
        'text': {'text/plain'}
    }

    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit
    UPLOAD_DIR = Path("uploads")

    def __init__(self):
        # Initialize mime detector and ensure upload dir exists
        self.mime = magic.Magic(mime=True)
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    def _get_safe_filename(self, original_filename: str) -> str:
        """Generate a timestamped, hashed safe filename."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(original_filename)
        file_hash = hashlib.sha256(f"{name}{timestamp}".encode()).hexdigest()[:8]
        return f"{timestamp}_{file_hash}{ext}"

    def _validate_file_type(self, file_path: str, allowed_formats: List[str]) -> bool:
        """Validate file mime type against allowed formats."""
        allowed_mimes: Set[str] = set()
        for fmt in allowed_formats:
            allowed_mimes |= self.ALLOWED_MIME_TYPES.get(fmt, set())
        mime_type = self.mime.from_file(file_path)
        return mime_type in allowed_mimes

    async def save_upload(self, file: UploadFile, allowed_formats: List[str]) -> str:
        """
        Save uploaded file with security checks and return relative path.
        """
        # Check file size (seek(0, 2) = move to end of file, tell() = current pos)
        await file.seek(0, os.SEEK_END)
        size = await file.tell()
        await file.seek(0)
        if size > self.MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large")

        # Prepare destination path
        safe_name = self._get_safe_filename(file.filename)
        date_dir = datetime.now().strftime("%Y-%m-%d")
        dest_dir = self.UPLOAD_DIR / date_dir
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / safe_name

        # Save to disk
        async with aiofiles.open(dest_path, 'wb') as out:
            while chunk := await file.read(8192):
                await out.write(chunk)

        # Validate mime type
        if allowed_formats and not self._validate_file_type(str(dest_path), allowed_formats):
            os.unlink(dest_path)
            raise HTTPException(status_code=400, detail="Invalid file type")

        # Return relative path like: /uploads/2025-06-14/file.pdf
        return f"/{self.UPLOAD_DIR.name}/{date_dir}/{safe_name}"
