from fastapi import FastAPI, Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
from starlette.middleware.base import RequestResponseEndpoint
import time
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
import asyncio

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = {}
        self._cleanup_task = None

    async def is_allowed(self, ip: str) -> Tuple[bool, Optional[int]]:
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)

        # Initialize or clean old requests
        if ip not in self.requests:
            self.requests[ip] = []
        self.requests[ip] = [req_time for req_time in self.requests[ip] if req_time > minute_ago]

        # Check if limit is exceeded
        if len(self.requests[ip]) >= self.requests_per_minute:
            retry_after = 60 - int((now - self.requests[ip][0]).total_seconds())
            return False, retry_after

        self.requests[ip].append(now)
        return True, None

    async def cleanup(self):
        while True:
            await asyncio.sleep(60)
            now = datetime.now()
            minute_ago = now - timedelta(minutes=1)
            for ip in list(self.requests.keys()):
                self.requests[ip] = [req_time for req_time in self.requests[ip] if req_time > minute_ago]
                if not self.requests[ip]:
                    del self.requests[ip]

class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(
        self, 
        app: FastAPI, 
        rate_limiter: RateLimiter,
        allowed_hosts: list[str] = None
    ):
        super().__init__(app)
        self.rate_limiter = rate_limiter
        self.allowed_hosts = allowed_hosts or ["localhost", "127.0.0.1"]

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Get client IP
        ip = request.client.host if request.client else "unknown"

        # Rate limiting
        is_allowed, retry_after = await self.rate_limiter.is_allowed(ip)
        if not is_allowed:
            return Response(
                content="Rate limit exceeded",
                status_code=429,
                headers={"Retry-After": str(retry_after)}
            )

        # Security headers
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Server"] = "Project Call Platform"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "img-src 'self' data:; "
            "style-src 'self' 'unsafe-inline'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval';"
        )

        return response
