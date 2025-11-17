# Docker Build from Local Packages - Implementation Guide

## Overview

Updated the release pipeline to build Docker images using **local Python wheel files** instead of pulling packages from PyPI. This allows you to build and deploy Docker images without publishing to PyPI first.

## Changes Made

### 1. New Dockerfiles Created

Created three new Dockerfiles that install from local `.whl` files:

#### `docker/build_and_push_local.Dockerfile`
- Builds the main Flowai image
- Installs `flowai-base` and `flowai` from local wheels in `dist/` directory
- Dependencies are still pulled from PyPI (only the main packages are local)

#### `docker/build_and_push_base_local.Dockerfile`
- Builds the Flowai Base image
- Installs `flowai-base` from local wheel in `dist/` directory
- Dependencies are still pulled from PyPI

#### `docker/build_and_push_ep_local.Dockerfile`
- Builds the Flowai image with entrypoint
- Installs `flowai-base` and `flowai` from local wheels
- Configured for backend-only mode

### 2. Updated Release Workflow

Modified `.github/workflows/release.yml`:

#### New Input Parameter
```yaml
publish_to_pypi:
  description: "Publish packages to PyPI"
  required: false
  type: boolean
  default: false  # PyPI publishing is now OPTIONAL
```

#### PyPI Publishing Made Optional
- Added `if: inputs.publish_to_pypi == true` condition to both publish steps
- By default, packages are **NOT** published to PyPI
- Docker images are built from local packages instead

#### Replaced Docker Build Jobs
- Removed calls to `docker-build.yml` workflow
- Added inline Docker build jobs:
  - `docker_build_base` - Builds base image from local packages
  - `docker_build_main` - Builds main image from local packages
  - `docker_build_main_ep` - Builds entrypoint image from local packages

#### Docker Build Process
1. Downloads artifacts from previous build steps (`.whl` files)
2. Uses new local Dockerfiles
3. Builds multi-platform images (linux/amd64, linux/arm64)
4. Pushes to Docker Hub with version tags

## How It Works

### Build Flow

```
1. Build Python Packages
   ├─ release-base job
   │  ├─ Build flowai-base wheel
   │  └─ Upload to artifacts (dist-base)
   │
   └─ release-main job
      ├─ Build flowai wheel
      └─ Upload to artifacts (dist-main)

2. Build Docker Images (uses local packages)
   ├─ docker_build_base
   │  ├─ Download dist-base artifacts
   │  ├─ Build using build_and_push_base_local.Dockerfile
   │  └─ Push digitranslab/flowai:base-{version}
   │
   ├─ docker_build_main
   │  ├─ Download dist-base + dist-main artifacts
   │  ├─ Build using build_and_push_local.Dockerfile
   │  └─ Push digitranslab/flowai:{version}
   │
   └─ docker_build_main_ep
      ├─ Download dist-base + dist-main artifacts
      ├─ Build using build_and_push_ep_local.Dockerfile
      └─ Push digitranslab/flowai-ep:{version}

3. (Optional) Publish to PyPI
   └─ Only if publish_to_pypi == true
```

### Dockerfile Strategy

The new Dockerfiles use this approach:

```dockerfile
# 1. Copy local wheel files
COPY dist/*.whl /tmp/wheels/

# 2. Install from local wheels using uv
RUN uv venv /app/.venv && \
    uv pip install --python /app/.venv /tmp/wheels/flowai_base-*.whl && \
    uv pip install --python /app/.venv /tmp/wheels/flowai-*.whl

# 3. Dependencies are automatically resolved and installed from PyPI
```

**Key Points:**
- Only the main packages (flowai, flowai-base) are installed from local wheels
- All dependencies are still pulled from PyPI
- This ensures compatibility while avoiding PyPI publishing issues

## Usage

### Trigger a Release Without PyPI Publishing

```yaml
# In GitHub Actions UI, set:
- release_package_base: true
- release_package_main: true
- build_docker_base: true
- build_docker_main: true
- build_docker_ep: true
- publish_to_pypi: false  # ← Don't publish to PyPI
- pre_release: true
- create_release: true
```

### Trigger a Release With PyPI Publishing

```yaml
# In GitHub Actions UI, set:
- publish_to_pypi: true  # ← Publish to PyPI
# ... other options
```

## Docker Image Tags

### Base Image
- `digitranslab/flowai:base-{version}` - Specific version
- `digitranslab/flowai:base-latest` - Latest base version

### Main Image
- `digitranslab/flowai:{version}` - Specific version
- `digitranslab/flowai:latest` - Latest stable (only for non-pre-releases)

### Entrypoint Image
- `digitranslab/flowai-ep:{version}` - Specific version
- `digitranslab/flowai-ep:latest` - Latest version

## Benefits

### 1. No PyPI Dependency
- Build and deploy Docker images without PyPI access
- Useful when package name is unavailable on PyPI
- Faster iteration during development

### 2. Consistent Builds
- Docker images use exact same code as built in CI
- No risk of PyPI propagation delays
- Guaranteed version consistency

### 3. Flexible Deployment
- Can publish to PyPI later if needed
- Can deploy Docker images immediately
- Supports private deployments without public PyPI

### 4. Multi-Platform Support
- Builds for both AMD64 and ARM64
- Uses Docker BuildKit caching for faster builds
- Optimized layer caching

## Testing Locally

You can test the Docker build locally:

```bash
# 1. Build the Python packages
cd src/frontend && npm run build && cd ../..
make build base=true args="--wheel"
make build main=true args="--wheel"

# 2. Build Docker image from local packages
docker build -f docker/build_and_push_local.Dockerfile -t flowai:local .

# 3. Run the image
docker run -p 7860:7860 flowai:local
```

## Troubleshooting

### Issue: Wheel files not found
**Solution:** Ensure the `dist/` directory contains the wheel files before building Docker images. The workflow handles this automatically via artifacts.

### Issue: Multi-platform build fails
**Solution:** Ensure Docker Buildx is set up correctly. The workflow uses `docker/setup-buildx-action@v3`.

### Issue: Frontend build fails
**Solution:** The Dockerfiles copy and build the frontend. Ensure `src/frontend` exists and has valid `package.json`.

## Migration Notes

### Old Workflow (PyPI-based)
```yaml
# Old: Always published to PyPI first
- Build packages
- Publish to PyPI
- Wait for PyPI propagation
- Build Docker from PyPI packages
```

### New Workflow (Local packages)
```yaml
# New: Build Docker directly from local packages
- Build packages
- Build Docker from local packages
- (Optional) Publish to PyPI
```

## Future Enhancements

Possible improvements:

1. **Add GHCR support** - Push to GitHub Container Registry
2. **Add image scanning** - Security vulnerability scanning
3. **Add image signing** - Cosign for supply chain security
4. **Add SBOM generation** - Software Bill of Materials
5. **Add test stage** - Test images before pushing

---

**Status**: ✅ Implemented  
**Date**: November 17, 2025  
**Impact**: Docker images can now be built without PyPI publishing
