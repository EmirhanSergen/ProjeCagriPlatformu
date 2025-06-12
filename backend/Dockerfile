FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
# Install system dependencies and Python packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        wkhtmltopdf \
        libmagic1 \
        gcc \
        python3-dev \
        libpq-dev \
    && pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y gcc python3-dev \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Include migrations so Alembic can run inside the container
COPY alembic.ini ./
COPY migrations ./migrations

COPY app ./app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
