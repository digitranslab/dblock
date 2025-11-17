# Running FlowAi with Docker

This guide will help you get FlowAi up and running using Docker and Docker Compose.

## Prerequisites

- Docker
- Docker Compose

## Steps

1. Clone the FlowAi repository:

   ```sh
   git clone https://github.com/digitranslab/flowai.git
   ```

2. Navigate to the `docker_example` directory:

   ```sh
   cd flowai/docker_example
   ```

3. Run the Docker Compose file:

   ```sh
   docker compose up
   ```

FlowAi will now be accessible at [http://localhost:7860/](http://localhost:7860/).

## Docker Compose Configuration

The Docker Compose configuration spins up two services: `flowai` and `postgres`.

### FlowAi Service

The `flowai` service uses the `digitranslab/flowai:latest` Docker image and exposes port 7860. It depends on the `postgres` service.

Environment variables:

- `FLOWAI_DATABASE_URL`: The connection string for the PostgreSQL database.
- `FLOWAI_CONFIG_DIR`: The directory where FlowAi stores logs, file storage, monitor data, and secret keys.

Volumes:

- `flowai-data`: This volume is mapped to `/app/flowai` in the container.

### PostgreSQL Service

The `postgres` service uses the `postgres:16` Docker image and exposes port 5432.

Environment variables:

- `POSTGRES_USER`: The username for the PostgreSQL database.
- `POSTGRES_PASSWORD`: The password for the PostgreSQL database.
- `POSTGRES_DB`: The name of the PostgreSQL database.

Volumes:

- `flowai-postgres`: This volume is mapped to `/var/lib/postgresql/data` in the container.

## Switching to a Specific FlowAi Version

If you want to use a specific version of FlowAi, you can modify the `image` field under the `flowai` service in the Docker Compose file. For example, to use version 1.0-alpha, change `digitranslab/flowai:latest` to `digitranslab/flowai:1.0-alpha`.
