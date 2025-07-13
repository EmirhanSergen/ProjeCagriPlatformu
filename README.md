# Project Call Platform

This repository contains a web-based platform for managing project calls and evaluating applications. It consists of a FastAPI backend and a React + TypeScript frontend.

## Features
- Manage project calls and user applications
- Role-based authentication and authorization
- Document uploads with PDF export support
- Docker configuration for local development

## Directory structure
- `backend/` – FastAPI service (see `backend/README.md` for details)
- `frontend/` – React client built with Vite

## Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) 18+ if running the frontend without Docker

## Quick start
1. Clone the repository.
2. Prepare environment variables for the backend:
   ```bash
   cd backend
   cp .env.example .env
   # update values inside .env if needed
   ```
3. Build and run the backend using Docker Compose:
   ```bash
   docker-compose up --build
   ```
   The API will be available at `http://localhost:8000`.
4. In a separate terminal, start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The app will be served at `http://localhost:5173` and will communicate with the API.

### Running tests
Backend unit tests can be executed from the `backend` directory after installing dependencies:
```bash
pip install -r requirements.txt
pytest
```

## Contributing
Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

