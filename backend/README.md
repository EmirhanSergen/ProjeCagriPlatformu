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
Ensure the values in `.env` match the credentials used by the Postgres service
in `docker-compose.yml`.
