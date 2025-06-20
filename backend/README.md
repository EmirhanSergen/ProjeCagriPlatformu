# Backend

This directory contains the FastAPI backend for **Proje Çağrısı Değerlendirme Platformu**.

## Quickstart

```bash
# Build and run the app with Docker
cd backend
cp .env.example .env
# Disable automatic table creation so migrations manage the schema
sed -i 's/^CREATE_TABLES=.*/CREATE_TABLES=false/' .env
docker-compose up --build
```

The API will be available at `http://localhost:8000`.

### Requirements

The PDF export feature relies on [wkhtmltopdf](https://wkhtmltopdf.org/). The Docker image installs it automatically, but if you run the app locally you must install `wkhtmltopdf` yourself (e.g. `sudo apt-get install wkhtmltopdf`).


### Database migrations

The project uses Alembic for managing schema migrations. Set your
`DATABASE_URL` in `.env` and then run the migrations:

```bash
# From the `backend` directory
alembic upgrade head
```

When using Docker you can run the command inside the API container:

```bash
docker-compose run --rm api alembic upgrade head
```

The Docker image now bundles the `migrations/` directory and `alembic.ini`, so
you can execute Alembic commands directly in the container. Rebuild the image
whenever new migrations are added.

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
