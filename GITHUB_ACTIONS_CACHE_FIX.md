# GitHub Actions Cache Hang Fix

## Problem
The "Release Minerva Base" workflow was stuck for 2h 52m in the "Post job cleanup" phase, specifically during cache pruning. This is abnormal and indicates a cache-related issue.

## Root Causes

### 1. UV Cache Issue
The `setup-uv` action had `enable-cache: true` which can cause hanging during cleanup when:
- The cache grows too large
- There are many cache entries to prune
- Network issues during cache operations

### 2. Docker Build Cache Issue  
The Docker build was using `cache-to: type=gha,mode=max` which:
- Saves the maximum amount of cache layers
- Can create very large cache entries (multi-GB)
- Causes timeouts during cache pruning in post-job cleanup

## Solutions Applied

### Fix 1: Disable UV Built-in Cache
**File**: `.github/actions/setup-uv/action.yml`

Changed from:
```yaml
enable-cache: true
cache-dependency-glob: "uv.lock"
```

To:
```yaml
enable-cache: false
```

Added manual cache directory setup for better control.

### Fix 2: Reduce Docker Cache Size
**File**: `.github/workflows/docker-build.yml`

Changed from:
```yaml
cache-to: type=gha,mode=max
```

To:
```yaml
cache-to: type=gha,mode=min
```

This reduces cache size significantly while still providing benefits.

## Expected Results

- Workflows should complete cleanup in < 30 seconds
- No more 2+ hour hangs
- Slightly slower builds (but still cached)
- More reliable CI/CD pipeline

## Next Steps

1. Cancel the stuck workflow run
2. Push these changes
3. Trigger a new release workflow
4. Monitor the post-job cleanup time

## Additional Recommendations

If issues persist, consider:
- Using `cache-from: type=registry` instead of GHA cache
- Implementing cache cleanup workflows
- Splitting large builds into smaller jobs
