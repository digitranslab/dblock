# GitHub Actions Release Workflow Fix

## Problem

The GitHub Actions release workflow (`.github/workflows/release.yml`) was getting stuck at the "Test CLI" step with the message "Failed to terminate the server" but the workflow continued successfully instead of failing.

## Root Cause

The exit code logic was inverted in the server termination check:

```bash
# BEFORE (INCORRECT):
if kill -0 $SERVER_PID 2>/dev/null; then
  echo "Failed to terminate the server"
  exit 0  # ← Wrong! Should fail when server is still running
else
  echo "Server terminated successfully"
fi
```

When the server failed to terminate (still running), the script exited with code 0 (success), which allowed the workflow to continue even though the test should have failed.

## Solution

Changed the exit code from `0` to `1` when the server fails to terminate:

```bash
# AFTER (CORRECT):
if kill -0 $SERVER_PID 2>/dev/null; then
  echo "Failed to terminate the server"
  exit 1  # ← Correct! Fail when server is still running
else
  echo "Server terminated successfully"
fi
```

## Changes Made

Fixed two occurrences of this bug:

1. **Line 103** - In the `release-base` job's "Test CLI" step
2. **Line 177** - In the `release-main` job's "Test CLI" step

Both now correctly exit with code 1 (failure) when the server fails to terminate.

## Impact

- **Before**: Workflow would continue even if the server couldn't be terminated, potentially causing issues in subsequent steps
- **After**: Workflow will properly fail if the server can't be terminated, ensuring clean test execution

## Testing

The workflow tests the CLI by:
1. Starting the Flowai server in the background
2. Waiting for it to respond (using `/api/v1/auto_login` for base, `/health_check` for main)
3. Terminating the server
4. Verifying the server actually stopped

With this fix, if step 4 fails (server still running), the workflow will now properly fail instead of continuing.

## Related Files

- `.github/workflows/release.yml` - Fixed exit codes in both test steps

---

**Status**: ✅ Fixed  
**Date**: November 17, 2025  
**Issue**: Server termination check had inverted exit code logic
