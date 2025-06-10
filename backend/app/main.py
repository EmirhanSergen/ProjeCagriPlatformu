from fastapi import FastAPI

from .routes import users

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello from FastAPI"}

app.include_router(users.router)
