from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict, List
from datetime import datetime, timedelta
import logging

from ..config import settings  # Load rate limit and allowed hosts from settings

logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self, requests_per_minute: int):
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, List[datetime]] = {}

    def is_allowed(self, client_ip: str) -> bool:
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)

        if client_ip not in self.requests:
            self.requests[client_ip] = []

        self.requests[client_ip] = [
            ts for ts in self.requests[client_ip] if ts > minute_ago
        ]

        if len(self.requests[client_ip]) >= self.requests_per_minute:
            return False

        self.requests[client_ip].append(now)
        return True

    async def cleanup(self):
        """Remove old entries older than one minute to free memory."""
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        for ip in list(self.requests.keys()):
            self.requests[ip] = [ts for ts in self.requests[ip] if ts > minute_ago]
            if not self.requests[ip]:
                del self.requests[ip]

class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.rate_limiter = RateLimiter(settings.requests_per_minute)
        self.allowed_hosts = settings.allowed_hosts

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"

        # Handle forwarded host headers (e.g. behind NGINX/Cloudflare)
        host = request.headers.get("host", "").split(":")[0]
        forwarded = request.headers.get("x-forwarded-host")
        real_host = forwarded.split(",")[0] if forwarded else host

        if real_host not in self.allowed_hosts and "*" not in self.allowed_hosts:
            raise HTTPException(status_code=400, detail="Invalid host header")

        # Path kontrolü: Dosya yükleme endpoint'ini rate-limit'ten muaf tut
        path = request.url.path
        if request.method == "POST" and path.startswith("/applications/") and path.endswith("/attachments"):
            response = await call_next(request)
            self.add_security_headers(response)
            return response

        # Rate limit kontrolü
        await self.rate_limiter.cleanup()
        if not self.rate_limiter.is_allowed(client_ip):
            raise HTTPException(status_code=429, detail="Too many requests")

        response = await call_next(request)
        self.add_security_headers(response)
        return response

    def add_security_headers(self, response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
