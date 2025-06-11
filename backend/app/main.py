from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from .routes import users
from .routes import calls, applications
from .config import settings
from .database import Base, engine

app = FastAPI()


@app.on_event("startup")
def on_startup() -> None:
    if settings.create_tables:
        Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.allowed_origins.split(',')],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"] ,
)

@app.get("/")
async def root():
    return {"message": "Hello from FastAPI"}


app.include_router(users.router)
app.include_router(users.auth_router)
app.include_router(calls.router)
app.include_router(applications.router)


