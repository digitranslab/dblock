# syntax=docker/dockerfile:1
# Keep this syntax directive! It's used to enable Docker BuildKit

ARG FLOWAI_IMAGE
FROM $FLOWAI_IMAGE

RUN rm -rf /app/.venv/flowai/frontend

CMD ["python", "-m", "flowai", "run", "--host", "0.0.0.0", "--port", "7860", "--backend-only"]
