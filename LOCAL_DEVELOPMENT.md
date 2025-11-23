# DBLock Local Development Guide

This guide explains how to run DBLock locally using Docker images.

## Prerequisites

- Docker
- Docker Compose

## Architecture Overview

DBLock can be run in two modes:

### 1. Monolithic Mode (Simpler)
Uses a single `digitranslab/dblock:latest` image that contains both frontend and backend.

### 2. Split Mode (Production-like)
Uses separate images:
- `digitranslab/dblock-backend:latest` - Backend API only
- `digitranslab/dblock-frontend:latest` - Frontend (Nginx + React)

## Quick Start

### Option A: Monolithic Setup (Recommended for Development)

```bash
# Start the application
docker-compose -f docker-compose.monolithic.yml up -d

# Access the application
open http://localhost:7860
```

This setup includes:
- DBLock (frontend + backend) on port 7860
- PostgreSQL database on port 5432

### Option B: Split Frontend/Backend Setup (Production-like)

```bash
# Start the application
docker-compose -f docker-compose.local.yml up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:7860
```

This setup includes:
- Backend API on port 7860
- Frontend on port 3000
- PostgreSQL database on port 5432

## Common Commands

### View logs
```bash
# Monolithic
docker-compose -f docker-compose.monolithic.yml logs -f

# Split mode
docker-compose -f docker-compose.local.yml logs -f backend
docker-compose -f docker-compose.local.yml logs -f frontend
```

### Stop services
```bash
# Monolithic
docker-compose -f docker-compose.monolithic.yml down

# Split mode
docker-compose -f docker-compose.local.yml down
```

### Remove volumes (clean slate)
```bash
# Monolithic
docker-compose -f docker-compose.monolithic.yml down -v

# Split mode
docker-compose -f docker-compose.local.yml down -v
```

### Pull latest images
```bash
# Monolithic
docker-compose -f docker-compose.monolithic.yml pull

# Split mode
docker-compose -f docker-compose.local.yml pull
```

### Rebuild and restart
```bash
# Monolithic
docker-compose -f docker-compose.monolithic.yml up -d --force-recreate

# Split mode
docker-compose -f docker-compose.local.yml up -d --force-recreate
```

## Environment Variables

Both setups use these default environment variables:

- `KOZMOAI_DATABASE_URL`: PostgreSQL connection string
- `KOZMOAI_CONFIG_DIR`: Directory for logs and configuration
- `KOZMOAI_HOST`: Host to bind to (0.0.0.0)
- `KOZMOAI_PORT`: Port for backend (7860)

You can override these by creating a `.env` file or passing them directly.

## Database Access

PostgreSQL is accessible on `localhost:5432` with:
- Username: `kozmoai`
- Password: `kozmoai`
- Database: `kozmoai`

Connect using:
```bash
psql -h localhost -U kozmoai -d kozmoai
```

## Troubleshooting

### Port already in use
If ports 7860, 3000, or 5432 are already in use, you can modify the port mappings in the docker-compose files.

### Images not found
Make sure the images are built and pushed to Docker Hub:
```bash
docker pull digitranslab/dblock:latest
docker pull digitranslab/dblock-backend:latest
docker pull digitranslab/dblock-frontend:latest
```

### Database connection issues
Ensure PostgreSQL is fully started before the application:
```bash
docker-compose -f docker-compose.local.yml up -d postgres
# Wait 10 seconds
docker-compose -f docker-compose.local.yml up -d
```

### Frontend can't connect to backend (Split mode)
The frontend container connects to backend via Docker network using `http://backend:7860`.
If you need to access the backend from your host machine, use `http://localhost:7860`.

## Production Deployment

For production deployment with Traefik reverse proxy, use:
```bash
cd deploy
docker-compose up -d
```

This uses the updated `deploy/docker-compose.yml` which now references:
- `digitranslab/dblock-backend:latest`
- `digitranslab/dblock-frontend:latest`

## Image Build Information

These images are built by GitHub Actions from the `feature/rename-dblock` branch:

- **Main image** (`dblock:latest`): Built from `docker/build_and_push.Dockerfile`
- **Backend image** (`dblock-backend:latest`): Built from `docker/build_and_push_backend.Dockerfile`
- **Frontend image** (`dblock-frontend:latest`): Built from `docker/frontend/build_and_push_frontend.Dockerfile`

The backend image is derived from the main image with the frontend removed.
