# Docker Image Rename Summary

## Changes Applied

All Docker images have been renamed from `digitranslab/kozmoai` to `digitranslab/dblock`.

### Image Name Changes

| Old Name | New Name |
|----------|----------|
| `digitranslab/kozmoai:latest` | `digitranslab/dblock:latest` |
| `digitranslab/kozmoai-backend:latest` | `digitranslab/dblock-backend:latest` |
| `digitranslab/kozmoai-frontend:latest` | `digitranslab/dblock-frontend:latest` |
| `digitranslab/kozmoai:test` | `digitranslab/dblock:test` |

### Files Updated

#### 1. `.github/workflows/docker-build.yml`
- ✅ Changed `TEST_TAG` from `digitranslab/kozmoai:test` to `digitranslab/dblock:test`
- ✅ Changed main image tag to `digitranslab/dblock:latest`
- ✅ Changed backend image tag to `digitranslab/dblock-backend:latest`
- ✅ Changed frontend image tag to `digitranslab/dblock-frontend:latest`
- ✅ Renamed `kozmoai_image` variable to `dblock_image`
- ✅ Updated build args from `KOZMOAI_IMAGE` to `DBLOCK_IMAGE`

#### 2. `docker/build_and_push.Dockerfile`
- ✅ Updated image labels:
  - `title`: kozmoai → dblock
  - `authors`: Kozmoai → DBLock
  - `url`: github.com/digitranslab/kozmoai → github.com/digitranslab/dblock
  - `source`: github.com/digitranslab/kozmoai → github.com/digitranslab/dblock

#### 3. `docker/build_and_push_backend.Dockerfile`
- ✅ Changed `ARG KOZMOAI_IMAGE` to `ARG DBLOCK_IMAGE`
- ✅ Changed `FROM $KOZMOAI_IMAGE` to `FROM $DBLOCK_IMAGE`

#### 4. `docker/frontend/build_and_push_frontend.Dockerfile`
- ✅ Updated image labels:
  - `title`: kozmoai-frontend → dblock-frontend
  - `authors`: Kozmoai → DBLock
  - `url`: github.com/digitranslab/kozmoai → github.com/digitranslab/dblock
  - `source`: github.com/digitranslab/kozmoai → github.com/digitranslab/dblock

## What This Means

### Docker Hub Images
When you run the workflow, it will now push to:
- `digitranslab/dblock:latest` (main image)
- `digitranslab/dblock-backend:latest` (backend only)
- `digitranslab/dblock-frontend:latest` (frontend only)

### Usage
To use the new images:

```bash
# Pull main image
docker pull digitranslab/dblock:latest

# Pull backend only
docker pull digitranslab/dblock-backend:latest

# Pull frontend only
docker pull digitranslab/dblock-frontend:latest

# Run the main image
docker run -p 7860:7860 digitranslab/dblock:latest
```

### Docker Compose
If you have docker-compose files, update them:

```yaml
services:
  dblock:
    image: digitranslab/dblock:latest
    # ... rest of config
```

## Next Steps

1. **Commit changes**:
   ```bash
   git add .github/workflows/docker-build.yml
   git add docker/build_and_push.Dockerfile
   git add docker/build_and_push_backend.Dockerfile
   git add docker/frontend/build_and_push_frontend.Dockerfile
   git commit -m "feat: rename Docker images from kozmoai to dblock"
   ```

2. **Push changes**:
   ```bash
   git push
   ```

3. **Run workflow**:
   - Go to GitHub Actions
   - Trigger "Kozmoai Release" workflow
   - Images will be pushed to Docker Hub as `digitranslab/dblock`

4. **Verify on Docker Hub**:
   - Check https://hub.docker.com/r/digitranslab/dblock
   - Verify all three images are published

## Important Notes

- ⚠️ The internal application code still uses "kozmoai" naming
- ⚠️ Only Docker image names have changed
- ⚠️ Environment variables still use `KOZMOAI_HOST` and `KOZMOAI_PORT`
- ⚠️ The command is still `kozmoai run`
- ✅ This is purely a Docker image branding change

## Rollback

If you need to revert to the old names, simply:
1. Change all instances of `dblock` back to `kozmoai`
2. Change all instances of `DBLock` back to `Kozmoai`
3. Commit and push
