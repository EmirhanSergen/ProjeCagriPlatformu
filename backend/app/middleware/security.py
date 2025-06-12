from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict, List
from datetime import datetime, timedelta
import logging

from ..config import settings  # Load rate limit and allowed hosts from settings

logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self, requests_per_minute: int):
        # Maximum number of requests allowed per IP per minute
        self.requests_per_minute = requests_per_minute
        # Store a list of request timestamps per client IP
        self.requests: Dict[str, List[datetime]] = {}
    
    def is_allowed(self, client_ip: str) -> bool:
        # Current timestamp
        now = datetime.now()
        # Compute cutoff time (one minute ago)
        minute_ago = now - timedelta(minutes=1)
        
        # Initialize list for a new IP
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        
        # Purge timestamps older than one minute
        self.requests[client_ip] = [
            ts for ts in self.requests[client_ip] if ts > minute_ago
        ]
        
        # If we've reached the limit, deny
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            return False
        
        # Otherwise record this request and allow
        self.requests[client_ip].append(now)
        return True

    async def cleanup(self):
        """Remove old entries older than one minute to free memory."""
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        for ip in list(self.requests.keys()):
            # Keep only recent requests
            self.requests[ip] = [ts for ts in self.requests[ip] if ts > minute_ago]
            # Delete IP entry if no recent requests remain
            if not self.requests[ip]:
                del self.requests[ip]

class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # Instantiate RateLimiter with value from settings (default 60 rpm)
        self.rate_limiter = RateLimiter(settings.requests_per_minute)
        # Allowed hosts coming from settings.allowed_hosts (env var)
        self.allowed_hosts = settings.allowed_hosts  

    async def dispatch(self, request: Request, call_next):
        # Get client IP, fallback to 'unknown'
        client_ip = request.client.host if request.client else "unknown"
        
        # Validate the Host header against allowed hosts
        host = request.headers.get("host", "").split(":")[0]
        if host not in self.allowed_hosts:
            raise HTTPException(status_code=400, detail="Invalid host header")
        
        # Clean up old request timestamps each dispatch
        await self.rate_limiter.cleanup()
        
        # Enforce rate limit per IP
        if not self.rate_limiter.is_allowed(client_ip):
            raise HTTPException(status_code=429, detail="Too many requests")
        
        # Proceed to next handler
        response = await call_next(request)
        
        # Add common security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response
