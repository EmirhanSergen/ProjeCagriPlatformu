import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app import database
from app.dependencies import get_db, get_current_admin
from app.models.user import User, UserRole
from app.config import settings


class DummyAdmin:
    role = UserRole.ADMIN


@pytest.fixture()
def client():
    settings.create_tables = False
    test_engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    database.engine = test_engine
    database.SessionLocal = TestingSessionLocal
    database.Base.metadata.create_all(bind=test_engine)

    # Populate with some users
    session = TestingSessionLocal()
    session.add(User(email="reviewer@example.com", hashed_password="x", role=UserRole.REVIEWER))
    session.add(User(email="applicant@example.com", hashed_password="x", role=UserRole.APPLICANT))
    session.commit()
    session.close()

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_admin] = lambda: DummyAdmin()

    with TestClient(app) as c:
        yield c

    app.dependency_overrides = {}
    database.Base.metadata.drop_all(bind=test_engine)


def test_list_reviewers(client):
    resp = client.get("/users/admin/reviewers")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["email"] == "reviewer@example.com"
    assert data[0]["role"] == "reviewer"
