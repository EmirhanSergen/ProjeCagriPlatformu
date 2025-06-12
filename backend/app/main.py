from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import logging

from .config import settings  # Application settings from .env
from .database import Base, engine  # SQLAlchemy metadata and engine
from .middleware.security import SecurityMiddleware, RateLimiter
from .routes import users, calls, applications, documents

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
    if settings.create_tables:
        Base.metadata.create_all(bind=engine)
    app.state.rate_limiter = RateLimiter(settings.requests_per_minute)
    logger.info("Startup complete, tables created and rate limiter initialized.")

# Apply CORS middleware for all routes
app.add_middleware(
    GZipMiddleware,
    minimum_size=1000
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],    # Add your front-end origin here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
    max_age=3600
)
app.add_middleware(SecurityMiddleware)

# Exception handlers (simplified)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

# Root endpoint
@app.get("/", tags=["root"])
async def root():
    return {"message": "Hello from FastAPI"}

# Routers
app.include_router(users.router)
app.include_router(users.auth_router, prefix="/auth", tags=["auth"])
app.include_router(calls.router)
app.include_router(applications.router)
app.include_router(documents.router)