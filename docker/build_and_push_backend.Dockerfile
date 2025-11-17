# syntax=docker/dockerfile:1
# Keep this syntax directive! It's used to enable Docker BuildKit

ARG MINERVA_IMAGE
FROM $MINERVA_IMAGE

RUN rm -rf /app/.venv/minerva/frontend

CMD ["python", "-m", "minerva", "run", "--host", "0.0.0.0", "--port", "7860", "--backend-only"]
