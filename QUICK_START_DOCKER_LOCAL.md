# Quick Start: Docker Build from Local Packages

## TL;DR

Your release pipeline now builds Docker images from **local Python packages** instead of PyPI. PyPI publishing is **optional**.

## What Changed

### Before ❌
```
Build → Publish to PyPI → Wait → Build Docker from PyPI
```

### After ✅
```
Build → Build Docker from Local → (Optional) Publish to PyPI
```

## How to Use

### Option 1: Build Docker Only (No PyPI)

**Recommended for now since `flowai` name is taken on PyPI**

1. Go to GitHub Actions → Flowai Release
2. Click "Run workflow"
3. Set these options:
   ```
   ✅ Release Flowai Base: true
   ✅ Release Flowai: true
   ✅ Build Docker Image for Flowai Base: true
   ✅ Build Docker Image for Flowai: true
   ✅ Build Docker Image for Flowai with Entrypoint: true
   ❌ Publish to PyPI: false  ← IMPORTANT!
   ✅ Pre-release: true
   ✅ Create gh release: true
   ```
4. Click "Run workflow"

**Result:**
- ✅ Python packages built
- ✅ Docker images pushed to Docker Hub
- ❌ Nothing published to PyPI
- ✅ GitHub release created with artifacts

### Option 2: Build Docker + Publish to PyPI

**Only use this after resolving the PyPI name issue**

Same as above, but set:
```
✅ Publish to PyPI: true
```

## Docker Images Created

After the workflow completes, you'll have:

### Base Image
```bash
docker pull digitranslab/flowai:base-1.1.9.dev0
docker pull digitranslab/flowai:base-latest
```

### Main Image
```bash
docker pull digitranslab/flowai:1.1.9.dev0
# latest tag only for non-pre-releases
```

### Entrypoint Image
```bash
docker pull digitranslab/flowai-ep:1.1.9.dev0
docker pull digitranslab/flowai-ep:latest
```

## Test Locally

```bash
# Pull and run the image
docker pull digitranslab/flowai:1.1.9.dev0
docker run -p 7860:7860 digitranslab/flowai:1.1.9.dev0

# Access at http://localhost:7860
```

## Files Created

### New Dockerfiles (use local packages)
- `docker/build_and_push_local.Dockerfile` - Main image
- `docker/build_and_push_base_local.Dockerfile` - Base image
- `docker/build_and_push_ep_local.Dockerfile` - Entrypoint image

### Old Dockerfiles (use PyPI)
- `docker/build_and_push.Dockerfile` - Still available
- `docker/build_and_push_base.Dockerfile` - Still available
- `docker/build_and_push_ep.Dockerfile` - Still available

## Workflow Changes

### New Input
```yaml
publish_to_pypi:
  description: "Publish packages to PyPI"
  default: false  # ← PyPI is now optional
```

### New Jobs
- `docker_build_base` - Builds from local packages
- `docker_build_main` - Builds from local packages
- `docker_build_main_ep` - Builds from local packages

### Modified Jobs
- `release-base` - PyPI publish is now conditional
- `release-main` - PyPI publish is now conditional

## Benefits

✅ **No PyPI required** - Build Docker without PyPI access  
✅ **Faster** - No waiting for PyPI propagation  
✅ **Consistent** - Docker uses exact same code as CI build  
✅ **Flexible** - Publish to PyPI later if needed  
✅ **Multi-platform** - Supports AMD64 and ARM64  

## Next Steps

1. **Test the workflow** - Run it with `publish_to_pypi: false`
2. **Verify Docker images** - Pull and test the images
3. **Resolve PyPI name** - Contact PyPI or choose new name
4. **Enable PyPI** - Set `publish_to_pypi: true` when ready

## Troubleshooting

### Workflow fails at Docker build
- Check if artifacts were uploaded correctly
- Verify Docker Hub credentials in secrets
- Check Dockerfile syntax

### Docker image doesn't work
- Check if all wheel files are in dist/
- Verify frontend build succeeded
- Check container logs: `docker logs <container>`

### Can't pull image
- Verify image was pushed: Check Docker Hub
- Check image tag matches version
- Ensure you're logged in to Docker Hub

---

**Ready to go!** Your pipeline now builds Docker images without needing PyPI. 🚀
