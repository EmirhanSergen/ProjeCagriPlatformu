from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import logging

from .config import settings
from .database import Base, engine
from .middleware.security import SecurityMiddleware, RateLimiter

# Yeni router importları
from .routes import (
    application_router,
    call_router,
    document_router,
    user_router,
    auth_router,
    review_router,
    reviewer_invite_router,
)

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# FastAPI app instance
app = FastAPI(
    title="Project Call Platform",
    description="API for managing project calls and evaluations",
    version="1.0.0",
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url="/redoc" if settings.environment != "production" else None,
)

# Lifespan: replaces deprecated on_event("startup")
@app.on_event("startup")
async def startup_event():
    try:
        if settings.create_tables:
            Base.metadata.create_all(bind=engine)
        app.state.rate_limiter = RateLimiter(settings.requests_per_minute)
        logger.info("Startup complete — DB tables ready and rate limiter initialized.")
    except Exception as e:
        logger.error(f"Startup error: {e}", exc_info=True)
        raise

# Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.allowed_origins.split(',')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
    max_age=3600,
)
app.add_middleware(SecurityMiddleware)

# HTTPException with CORS reinjection
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    allowed = [o.strip() for o in settings.allowed_origins.split(',')]
    origin = request.headers.get("origin")
    headers = {}
    if "*" in allowed or (origin and origin in allowed):
        headers["Access-Control-Allow-Origin"] = origin or "*"
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=headers)

# Global error handler (with logging)
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

# Include routers
app.include_router(user_router)
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(call_router)
app.include_router(application_router)
app.include_router(document_router)
app.include_router(review_router)
app.include_router(reviewer_invite_router)
