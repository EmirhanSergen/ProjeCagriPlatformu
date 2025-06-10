from fastapi import FastAPI


from .routes import users
from .routes import calls, applications

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello from FastAPI"}


app.include_router(users.router)
app.include_router(users.auth_router)
app.include_router(calls.router)
app.include_router(applications.router)


