# ProjectCallPlatform

ProjectCallPlatform is a web platform that helps organizations announce,
receive and evaluate project proposals. The repository contains a FastAPI
backend and a React + TypeScript frontend.

## Requirements

- Docker and Docker Compose (recommended for local setup)
- Node.js (for running the frontend in development mode)
- Python 3.11 (only required if running the backend without Docker)

## Quick Start

1. Clone the repository.
2. Copy the example environment file and adjust the values as needed:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. From the `backend` directory build and start the services:
   ```bash
   cd backend
   docker-compose up --build
   ```
   The API will be available at `http://localhost:8000`.
4. In a separate terminal install the frontend dependencies and start the dev
   server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Running Without Docker

If you prefer running the backend locally, install the packages from
`backend/requirements.txt` and make sure [`wkhtmltopdf`](https://wkhtmltopdf.org/)
is installed on your system. After configuring `backend/.env`, start the server
with:

```bash
uvicorn app.main:app --reload --port 8000
```

Database migrations are managed with Alembic. Run `alembic upgrade head` from the
`backend` directory after setting `DATABASE_URL`.

## Tests

Backend tests are located in `backend/tests` and can be executed with `pytest`.
Ensure that a test database is configured in the environment file when running
these tests locally.

## Notes

- When running locally outside Docker, install `wkhtmltopdf` for PDF export
  support.
- Environment variables in `backend/.env` control database access, rate limiting
  and JWT secrets. Do not commit sensitive values to version control.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for
more information.
