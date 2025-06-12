from fastapi import FastAPI, Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict, List
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = {}
    
    def is_allowed(self, client_ip: str) -> bool:
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        
        # Remove old requests
        self.requests[client_ip] = [ts for ts in self.requests[client_ip] if ts > minute_ago]
        
        # Check if limit is exceeded
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            return False
        
        # Add new request
        self.requests[client_ip].append(now)
        return True

    async def cleanup(self):
        """Remove old entries"""
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        for ip in list(self.requests.keys()):
            self.requests[ip] = [ts for ts in self.requests[ip] if ts > minute_ago]
            if not self.requests[ip]:
                del self.requests[ip]

class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rate_limiter: RateLimiter, allowed_hosts: List[str] = None):
        super().__init__(app)
        self.rate_limiter = rate_limiter
        self.allowed_hosts = allowed_hosts or ["localhost", "127.0.0.1"]
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Check host header
        host = request.headers.get("host", "").split(":")[0]
        if host not in self.allowed_hosts:
            raise HTTPException(status_code=400, detail="Invalid host header")
        
        # Rate limiting
        if not self.rate_limiter.is_allowed(client_ip):
            raise HTTPException(status_code=429, detail="Too many requests")
        
        # Add security headers
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response
