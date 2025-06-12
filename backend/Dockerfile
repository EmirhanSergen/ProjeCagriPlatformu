FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
# Install wkhtmltopdf for PDF export functionality
RUN apt-get update \
    && apt-get install -y wkhtmltopdf \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir -r requirements.txt

# Include migrations so Alembic can run inside the container
COPY alembic.ini ./
COPY migrations ./migrations

COPY app ./app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
