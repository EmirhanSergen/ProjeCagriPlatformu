import os
import io
import shutil
import pytest
from fastapi.testclient import TestClient

# Set up environment before importing app
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("JWT_SECRET", "test")
os.environ.setdefault("CREATE_TABLES", "true")

from app.main import app
from app.database import Base, SessionLocal, engine
from app.dependencies import get_db
from app.routes.applications import get_current_user  # We will override
from app.models.user import User, UserRole
from app.models.call import Call
from app.models.application import Application


@pytest.fixture(scope="module")
def client():
    # Create tables
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    user = User(email="u@example.com", hashed_password="x", role=UserRole.APPLICANT)
    session.add(user)
    session.commit()
    session.refresh(user)
    call = Call(title="test call", description="d", is_open=True)
    session.add(call)
    session.commit()
    session.refresh(call)
    application = Application(user_id=user.id, call_id=call.id, content="content")
    session.add(application)
    session.commit()
    session.refresh(application)
    session.close()

    def override_get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: user

    with TestClient(app) as c:
        c.call_id = call.id
        yield c

    app.dependency_overrides.clear()
    shutil.rmtree("uploads", ignore_errors=True)
    if os.path.exists("test.db"):
        os.remove("test.db")


def test_rejects_dotdot_filename(client):
    response = client.post(
        f"/applications/{client.call_id}/upload",
        files=[("files", ("../evil.txt", io.BytesIO(b"bad"), "text/plain"))],
    )
    assert response.status_code == 400


def test_strips_directory_components(client):
    response = client.post(
        f"/applications/{client.call_id}/upload",
        files=[("files", ("foo/bar.txt", io.BytesIO(b"data"), "text/plain"))],
    )
    assert response.status_code == 200
    data = response.json()
    assert data[0]["file_path"].endswith("bar.txt")
    assert os.path.exists(data[0]["file_path"])
