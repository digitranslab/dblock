# Running Minerva with Docker

This guide will help you get Minerva up and running using Docker and Docker Compose.

## Prerequisites

- Docker
- Docker Compose

## Steps

1. Clone the Minerva repository:

   ```sh
   git clone https://github.com/digitranslab/minerva.git
   ```

2. Navigate to the `docker_example` directory:

   ```sh
   cd minerva/docker_example
   ```

3. Run the Docker Compose file:

   ```sh
   docker compose up
   ```

Minerva will now be accessible at [http://localhost:7860/](http://localhost:7860/).

## Docker Compose Configuration

The Docker Compose configuration spins up two services: `minerva` and `postgres`.

### Minerva Service

The `minerva` service uses the `digitranslab/minerva:latest` Docker image and exposes port 7860. It depends on the `postgres` service.

Environment variables:

- `MINERVA_DATABASE_URL`: The connection string for the PostgreSQL database.
- `MINERVA_CONFIG_DIR`: The directory where Minerva stores logs, file storage, monitor data, and secret keys.

Volumes:

- `minerva-data`: This volume is mapped to `/app/minerva` in the container.

### PostgreSQL Service

The `postgres` service uses the `postgres:16` Docker image and exposes port 5432.

Environment variables:

- `POSTGRES_USER`: The username for the PostgreSQL database.
- `POSTGRES_PASSWORD`: The password for the PostgreSQL database.
- `POSTGRES_DB`: The name of the PostgreSQL database.

Volumes:

- `minerva-postgres`: This volume is mapped to `/var/lib/postgresql/data` in the container.

## Switching to a Specific Minerva Version

If you want to use a specific version of Minerva, you can modify the `image` field under the `minerva` service in the Docker Compose file. For example, to use version 1.0-alpha, change `digitranslab/minerva:latest` to `digitranslab/minerva:1.0-alpha`.
