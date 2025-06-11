# Backend

This directory contains the FastAPI backend for **Proje Çağrısı Değerlendirme Platformu**.

## Quickstart

```bash
# Build and run the app with Docker
cd backend
cp .env.example .env
docker-compose up --build
```

The API will be available at `http://localhost:8000`.

### Authentication

Send a POST request to `/login` with `email` and `password`. After entering
your credentials, the front‑end will prompt you to choose a role using a
slider. The selected role is sent along with the login request:

```json
{
  "email": "user@example.com",
  "password": "secret",
  "role": "applicant"
}
```
