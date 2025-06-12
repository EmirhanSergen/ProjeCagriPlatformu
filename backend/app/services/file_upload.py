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
    ALLOWED_MIME_TYPES = {
        'pdf': {'application/pdf'},
        'image': {'image/jpeg', 'image/png', 'image/gif'},
        'text': {'text/plain'}
    }
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR = "uploads"

    def __init__(self):
        self.mime = magic.Magic(mime=True)
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)

    def _get_safe_filename(self, original_filename: str) -> str:
        """Generate a safe filename with timestamp and hash."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(original_filename)
        file_hash = hashlib.sha256(f"{name}{timestamp}".encode()).hexdigest()[:8]
        safe_name = f"{timestamp}_{file_hash}{ext}"
        return safe_name

    def _validate_file_type(self, file_path: str, allowed_formats: List[str]) -> bool:
        """Validate file type using magic numbers."""
        allowed_mime_types: Set[str] = set()
        for format_type in allowed_formats:
            allowed_mime_types.update(self.ALLOWED_MIME_TYPES.get(format_type, set()))

        file_mime_type = self.mime.from_file(file_path)
        return file_mime_type in allowed_mime_types

    async def save_upload(self, file: UploadFile, allowed_formats: List[str]) -> str:
        """
        Save an uploaded file with security checks.
        Returns the relative path to the saved file.
        """
        try:
            # Check file size
            file.file.seek(0, 2)
            size = file.file.tell()
            file.file.seek(0)
            if size > self.MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File too large")

            # Create a safe filename and path
            safe_filename = self._get_safe_filename(file.filename)
            today = datetime.now().strftime("%Y-%m-%d")
            relative_dir = os.path.join(self.UPLOAD_DIR, today)
            os.makedirs(relative_dir, exist_ok=True)
            file_path = os.path.join(relative_dir, safe_filename)

            # Save the file
            async with aiofiles.open(file_path, 'wb') as f:
                while chunk := await file.read(8192):
                    await f.write(chunk)

            # Validate file type
            if not self._validate_file_type(file_path, allowed_formats):
                os.unlink(file_path)
                raise HTTPException(status_code=400, detail="Invalid file type")

            return os.path.join(today, safe_filename)

        except Exception as e:
            logger.error(f"File upload error: {str(e)}")
            if 'file_path' in locals() and os.path.exists(file_path):
                os.unlink(file_path)
            raise HTTPException(status_code=500, detail="File upload failed")
