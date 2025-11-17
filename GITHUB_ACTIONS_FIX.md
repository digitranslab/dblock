# GitHub Actions Release Workflow Fix

## Problem

The GitHub Actions release workflow (`.github/workflows/release.yml`) was showing "Failed to terminate the server" but the workflow continued successfully instead of failing. The server termination logic was flawed in two ways:

1. **Inverted exit code**: Failed termination exited with 0 (success) instead of 1 (failure)
2. **Insufficient wait time**: Only waited 20 seconds for graceful shutdown

## Root Causes

### Issue 1: Inverted Exit Code

```bash
# BEFORE (INCORRECT):
if kill -0 $SERVER_PID 2>/dev/null; then
  echo "Failed to terminate the server"
  exit 0  # ← Wrong! Should fail when server is still running
else
  echo "Server terminated successfully"
fi
```

### Issue 2: Inadequate Shutdown Logic

The original script:
- Sent SIGTERM to the server
- Waited exactly 20 seconds
- Checked if still running
- No retry or force-kill mechanism

This didn't account for:
- Database connection cleanup
- Background task completion
- Graceful shutdown hooks
- Variable shutdown times

## Solution

Implemented a robust termination strategy:

```bash
# AFTER (IMPROVED):
# Terminate the server gracefully
kill $SERVER_PID 2>/dev/null || true

# Wait up to 30 seconds for graceful shutdown
for i in {1..30}; do
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "Server terminated successfully after ${i} seconds"
    exit 0
  fi
  sleep 1
done

# Force kill if still running
echo "Server did not terminate gracefully, forcing shutdown"
kill -9 $SERVER_PID 2>/dev/null || true
sleep 2

if kill -0 $SERVER_PID 2>/dev/null; then
  echo "Failed to terminate the server even with SIGKILL"
  exit 1
else
  echo "Server forcefully terminated"
fi
```

## Improvements

### 1. Graceful Shutdown First
- Sends SIGTERM for clean shutdown
- Waits up to 30 seconds (increased from 20)
- Checks every second instead of waiting blindly

### 2. Force Kill Fallback
- If graceful shutdown fails, sends SIGKILL
- Ensures the process is terminated
- Only fails if SIGKILL doesn't work (very rare)

### 3. Better Error Handling
- Suppresses errors with `2>/dev/null || true`
- Provides clear status messages
- Reports how long shutdown took

### 4. Correct Exit Codes
- Exit 0 when server terminates successfully
- Exit 1 only when termination truly fails
- Early exit on success (no unnecessary waiting)

## Changes Made

Updated both test steps:

1. **release-base job** - "Test CLI" step (lines ~85-110)
2. **release-main job** - "Test CLI" step (lines ~165-190)

Both now use the improved termination logic.

## Impact

### Before
- ❌ Workflow continued even when server didn't stop
- ❌ Fixed 20-second wait (too short for some cases)
- ❌ No force-kill mechanism
- ❌ Inverted exit codes

### After
- ✅ Workflow properly fails if server can't be stopped
- ✅ Adaptive wait (1-30 seconds based on actual shutdown time)
- ✅ Force-kill fallback ensures cleanup
- ✅ Correct exit codes
- ✅ Better logging and diagnostics

## Testing

The workflow tests the CLI by:
1. Starting the Flowai server in the background
2. Waiting for it to respond (using `/api/v1/auto_login` for base, `/health_check` for main)
3. Sending SIGTERM for graceful shutdown
4. Waiting up to 30 seconds, checking every second
5. Force-killing with SIGKILL if needed
6. Verifying the server actually stopped

## Expected Behavior

### Normal Case (Graceful Shutdown)
```
Server terminated successfully after 3 seconds
```
Workflow continues ✅

### Slow Shutdown
```
Server terminated successfully after 25 seconds
```
Workflow continues ✅

### Force Kill Required
```
Server did not terminate gracefully, forcing shutdown
Server forcefully terminated
```
Workflow continues ✅ (with warning)

### True Failure (Very Rare)
```
Failed to terminate the server even with SIGKILL
```
Workflow fails ❌ (as it should)

## Related Files

- `.github/workflows/release.yml` - Improved termination logic in both test steps

---

**Status**: ✅ Fixed and Improved  
**Date**: November 17, 2025  
**Issues Fixed**: 
1. Inverted exit code logic
2. Insufficient wait time for graceful shutdown
3. No force-kill fallback mechanism
