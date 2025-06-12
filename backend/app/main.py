from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.middleware.gzip import GZipMiddleware
import logging
from typing import List

from .routes import users, calls, applications, documents
from .config import settings
from .database import Base, engine
from .middleware.security import SecurityMiddleware, RateLimiter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Project Call Platform",
    description="API for managing project calls and applications",
    version="1.0.0",
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url="/redoc" if settings.environment != "production" else None
)

@app.on_event("startup")
async def on_startup() -> None:
    try:
        if settings.create_tables:
            Base.metadata.create_all(bind=engine)
        # Initialize rate limiter
        app.state.rate_limiter = RateLimiter(requests_per_minute=60)
    except Exception as e:
        logger.error(f"Startup error: {e}", exc_info=True)
        raise

# Error handling
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Return HTTP errors with CORS headers so the browser can read them."""
    allowed = [o.strip() for o in settings.allowed_origins.split(',')]
    origin = request.headers.get("origin")
    headers = {}
    if "*" in allowed or (origin and origin in allowed):
        headers["Access-Control-Allow-Origin"] = origin or "*"
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=headers)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    allowed = [o.strip() for o in settings.allowed_origins.split(',')]
    origin = request.headers.get("origin")
    headers = {}
    if "*" in allowed or (origin and origin in allowed):
        headers["Access-Control-Allow-Origin"] = origin or "*"
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers=headers,
    )

# Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.allowed_origins.split(',')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
    max_age=3600
)
app.add_middleware(
    SecurityMiddleware,
    rate_limiter=RateLimiter(),
    allowed_hosts=settings.allowed_hosts
)

@app.get("/")
async def root():
    return {"message": "Hello from FastAPI"}


app.include_router(users.router)
app.include_router(users.auth_router, prefix="/auth", tags=["auth"])
app.include_router(calls.router)
app.include_router(applications.router)
app.include_router(documents.router)


