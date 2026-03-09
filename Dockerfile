# Use a pinned, slim base image for a smaller attack surface
FROM python:3.11.7-slim

# Set environment variables for safer execution
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies with minimal impact
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Add a non-root user for security
RUN groupadd -r vulnra && useradd -r -g vulnra vulnra \
    && mkdir -p /app/reports \
    && chown vulnra:vulnra /app/reports

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=vulnra:vulnra . .

# Switch to non-root user
USER vulnra

EXPOSE ${PORT}

# Healthcheck to monitor app status
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:${PORT}/health || exit 1

# Production-ready entrypoint (shell form so $PORT is expanded at runtime)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 2 --proxy-headers --forwarded-allow-ips '*'
