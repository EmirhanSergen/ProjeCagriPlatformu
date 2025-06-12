import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app import database
from app.dependencies import get_db
from app.dependencies import get_current_admin, get_current_user
from app.models.user import UserRole
from app.config import settings


class DummyAdmin:
    role = UserRole.ADMIN


class DummyUser:
    role = UserRole.APPLICANT


@pytest.fixture()
def client():
    settings.create_tables = False
    test_engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=test_engine
    )

    database.engine = test_engine
    database.SessionLocal = TestingSessionLocal
    database.Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_admin] = lambda: DummyAdmin()
    app.dependency_overrides[get_current_user] = lambda: DummyUser()

    with TestClient(app) as c:
        yield c

    app.dependency_overrides = {}
    database.Base.metadata.drop_all(bind=test_engine)


def test_create_definition_invalid_call(client):
    resp = client.post(
        "/admin/calls/1/documents",
        json={"name": "Doc", "allowed_formats": "pdf"},
    )
    assert resp.status_code == 404


def test_update_definition_invalid_call(client):
    resp = client.put(
        "/admin/calls/1/documents/1",
        json={},
    )
    assert resp.status_code == 404


def test_delete_definition_invalid_call(client):
    resp = client.delete("/admin/calls/1/documents/1")
    assert resp.status_code == 404


def test_get_definitions_invalid_call(client):
    resp = client.get("/applications/1/documents")
    assert resp.status_code == 404
