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

Send a POST request to `/login` with JSON containing `email` and `password`:

```json
{
  "email": "user@example.com",
  "password": "secret"
}
```
