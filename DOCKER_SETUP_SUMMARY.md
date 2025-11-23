# Docker Setup Summary - Kozmoai to DBLock Migration

## Overview
This document summarizes the changes made to migrate from `kozmoai` Docker images to `dblock` Docker images.

## Image Naming Changes

### Before (Kozmoai)
- `digitranslab/kozmoai:latest` - Monolithic image
- `digitranslab/kozmoai-backend:latest` - Backend only
- `digitranslab/kozmoai-frontend:latest` - Frontend only

### After (DBLock)
- `digitranslab/dblock:latest` - Monolithic image
- `digitranslab/dblock-backend:latest` - Backend only
- `digitranslab/dblock-frontend:latest` - Frontend only

## Files Modified

### 1. GitHub Actions Workflows

#### `.github/workflows/docker-build.yml`
- Fixed `build-args` syntax from multi-line to single-line format
- Changed `KOZMOAI_IMAGE` → `DBLOCK_IMAGE` build argument
- Added `no-cache: true` and `pull: true` for fresh builds
- Updated matrix to use `dblock_image` instead of `kozmoai_image`

#### `.github/workflows/release.yml`
- Added `ref` input parameter to specify which branch to build from
- Updated all docker build job calls to pass the `ref` parameter
- This ensures the workflow builds from the correct branch (e.g., `feature/rename-dblock`)

### 2. Dockerfiles

#### `docker/build_and_push_backend.Dockerfile`
- Changed `ARG KOZMOAI_IMAGE` → `ARG DBLOCK_IMAGE`
- Changed `FROM $KOZMOAI_IMAGE` → `FROM $DBLOCK_IMAGE`

#### `docker/build_and_push.Dockerfile`
- Updated labels from `kozmoai` to `dblock`
- Changed image title, authors, and source URLs

#### `docker/frontend/build_and_push_frontend.Dockerfile`
- Updated labels from `kozmoai-frontend` to `dblock-frontend`

### 3. Deployment Files

#### `deploy/docker-compose.yml`
- Changed `digitranslab/kozmoai-backend:latest` → `digitranslab/dblock-backend:latest`
- Changed `digitranslab/kozmoai-frontend:latest` → `digitranslab/dblock-frontend:latest`

### 4. New Local Development Files

#### `docker-compose.local.yml` (NEW)
- Split frontend/backend setup for local development
- Backend on port 7860
- Frontend on port 3000
- PostgreSQL on port 5432
- Includes healthchecks for all services

#### `docker-compose.monolithic.yml` (NEW)
- Simpler monolithic setup using `digitranslab/dblock:latest`
- Single service on port 7860
- PostgreSQL on port 5432

#### `LOCAL_DEVELOPMENT.md` (NEW)
- Comprehensive guide for running DBLock locally
- Instructions for both monolithic and split setups
- Common commands and troubleshooting

## Key Technical Changes

### Build Argument Fix
**Problem**: The `build-args` in GitHub Actions was using multi-line YAML syntax which wasn't properly passing the argument to Docker.

**Solution**: Changed from:
```yaml
build-args: |
  DBLOCK_IMAGE=${{ matrix.dblock_image }}
```

To:
```yaml
build-args: DBLOCK_IMAGE=${{ matrix.dblock_image }}
```

### Branch Checkout Issue
**Problem**: When running the release workflow, it was checking out the `main` branch which still had the old `KOZMOAI_IMAGE` variable.

**Solution**: Added `ref` input parameter to `release.yml` and passed it through to `docker-build.yml`, allowing users to specify which branch to build from.

### Cache Busting
**Problem**: Docker BuildKit might cache old Dockerfile layers with the old variable names.

**Solution**: Added `no-cache: true` and `pull: true` to force fresh builds without cached layers.

## How to Use

### For Local Development
```bash
# Option 1: Monolithic (simpler)
docker-compose -f docker-compose.monolithic.yml up -d

# Option 2: Split frontend/backend (production-like)
docker-compose -f docker-compose.local.yml up -d
```

### For Production Deployment
```bash
cd deploy
docker-compose up -d
```

### For GitHub Actions
When triggering the release workflow manually:
1. Go to Actions → Kozmoai Release → Run workflow
2. Select branch: `feature/rename-dblock`
3. Fill in the `ref` field with: `feature/rename-dblock`
4. Click "Run workflow"

## Testing Checklist

- [ ] Build main image (`dblock:latest`)
- [ ] Build backend image (`dblock-backend:latest`)
- [ ] Build frontend image (`dblock-frontend:latest`)
- [ ] Test monolithic setup locally
- [ ] Test split setup locally
- [ ] Test production deployment
- [ ] Verify all images are pushed to Docker Hub
- [ ] Verify GitHub Actions workflow completes successfully

## Next Steps

1. **Merge to main**: Once testing is complete, merge `feature/rename-dblock` to `main`
2. **Update documentation**: Update any remaining references to `kozmoai` in docs
3. **Update examples**: Update `docker_example/` folder to use new image names
4. **Tag release**: Create a version tag to trigger production builds
5. **Deprecate old images**: Add deprecation notice to old `kozmoai` images on Docker Hub

## Environment Variables Still Using "KOZMOAI"

Note: The following environment variables still use the `KOZMOAI_` prefix for backward compatibility:
- `KOZMOAI_DATABASE_URL`
- `KOZMOAI_CONFIG_DIR`
- `KOZMOAI_HOST`
- `KOZMOAI_PORT`
- `KOZMOAI_LOG_LEVEL`
- etc.

These can be renamed in a future update if desired, but it's not required for the Docker image rename.
