# syntax=docker/dockerfile:1
# Keep this syntax directive! It's used to enable Docker BuildKit

ARG DBLOCK_IMAGE
FROM $DBLOCK_IMAGE

RUN rm -rf /app/.venv/kozmoai/frontend

CMD ["python", "-m", "kozmoai", "run", "--host", "0.0.0.0", "--port", "7860", "--backend-only"]
