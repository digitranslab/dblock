# syntax=docker/dockerfile:1
# Keep this syntax directive! It's used to enable Docker BuildKit
# This Dockerfile builds from LOCAL wheel files instead of PyPI

################################
# BUILDER-BASE
# Used to build deps + create our virtual environment
################################

FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install --no-install-recommends -y \
    build-essential \
    git \
    npm \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy the wheel files from the build artifacts
COPY dist/*.whl /tmp/wheels/

# Create a minimal pyproject.toml for installing from local wheels
RUN echo '[project]' > /tmp/pyproject.toml && \
    echo 'name = "flowai-docker"' >> /tmp/pyproject.toml && \
    echo 'version = "0.0.0"' >> /tmp/pyproject.toml && \
    echo 'requires-python = ">=3.10"' >> /tmp/pyproject.toml && \
    echo 'dependencies = []' >> /tmp/pyproject.toml

# Install flowai-base and flowai from local wheels
# This will also install all their dependencies from PyPI
WORKDIR /tmp
RUN --mount=type=cache,target=/root/.cache/uv \
    uv venv /app/.venv && \
    uv pip install --python /app/.venv /tmp/wheels/flowai_base-*.whl && \
    uv pip install --python /app/.venv /tmp/wheels/flowai-*.whl

# Build frontend
COPY src/frontend /tmp/src/frontend
WORKDIR /tmp/src/frontend
RUN --mount=type=cache,target=/root/.npm \
    npm ci \
    && npm run build \
    && mkdir -p /app/frontend \
    && cp -r build /app/frontend/

################################
# RUNTIME
# Setup user, utilities and copy the virtual environment only
################################
FROM python:3.12.3-slim AS runtime

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install git -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && useradd user -u 1000 -g 0 --no-create-home --home-dir /app/data

COPY --from=builder --chown=1000 /app/.venv /app/.venv
COPY --from=builder --chown=1000 /app/frontend /app/frontend

ENV PATH="/app/.venv/bin:$PATH"

LABEL org.opencontainers.image.title=flowai
LABEL org.opencontainers.image.authors=['Flowai']
LABEL org.opencontainers.image.licenses=MIT
LABEL org.opencontainers.image.url=https://github.com/digitranslab/flowai
LABEL org.opencontainers.image.source=https://github.com/digitranslab/flowai

USER user
WORKDIR /app

ENV FLOWAI_HOST=0.0.0.0
ENV FLOWAI_PORT=7860

CMD ["flowai", "run"]
