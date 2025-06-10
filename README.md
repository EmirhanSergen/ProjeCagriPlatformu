# Proje Çağrısı Değerlendirme Platformu

This project aims to provide a multi-role web platform for managing academic and R&D project calls. Applicants submit proposals, reviewers evaluate them, and administrators organize the process.

## Repository Structure

- `frontend/` – React + TypeScript application
- `backend/` – FastAPI server



## Development

The frontend uses Vite and Tailwind CSS. The backend runs FastAPI and PostgreSQL via Docker Compose.

```bash
# Start backend
cd backend
cp .env.example .env
docker-compose up --build
```

The API exposes a `/users/` endpoint to register new users. The sample `.env` file points the backend to the local Postgres container.

Additional endpoints:

- `POST /calls/` &mdash; create a new project call (admin only).
- `POST /applications/` &mdash; submit an application to a call.

```bash
# Start frontend
cd frontend
npm install
npm run dev
```
