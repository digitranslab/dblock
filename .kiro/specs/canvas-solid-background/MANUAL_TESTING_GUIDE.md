# Manual Testing Guide - Canvas Solid Background

## Prerequisites
Before starting the manual tests, ensure:
1. The application is built successfully (✓ Verified)
2. Backend server is running
3. Frontend development server is running

## Starting the Application

### Option 1: Development Mode
```bash
# Terminal 1 - Start backend (from project root)
make dev

# Terminal 2 - Start frontend (from project root)
cd src/frontend
npm start
```

### Option 2: Docker Compose
```bash
# From project root
docker-compose -f docker-compose.local.yml up
```

The application should be accessible at `http://localhost:3000` (or the configured port).

---

## Test Checklist

### Test 1: Canvas in Light Theme
**Requirement**: 1.2, 1.3

**Steps**:
1. Open the application in your browser
2. If not already in light theme, switch to light theme (look for theme toggle in header)
3. Navigate to a flow page or create a new flow
4. Observe the canvas background

**Expected Result**:
- ✅ Canvas displays a solid light gray background
- ✅ No dotted pattern visible
- ✅ Background color matches the light theme aesthetic
- ✅ No visual artifacts or rendering issues

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________________________________

---

### Test 2: Canvas in Dark Theme
**Requirement**: 1.2, 1.3

**Steps**:
1. Switch to dark theme (click theme toggle in header)
2. Observe the canvas background

**Expected Result**:
- ✅ Canvas displays a solid dark background (black or very dark gray)
- ✅ No dotted pattern visible
- ✅ Background color matches the dark theme aesthetic
- ✅ Nodes and edges are clearly visible against dark background

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________________________________

---

### Test 3: Theme Switching
**Requirement**: 1.2, 1.3, 1.4

**Steps**:
1. Start in light theme
2. Switch to dark theme
3. Switch back to light theme
4. Repeat 2-3 times rapidly

**Expected Result**:
- ✅ Canvas background updates immediately on theme change
- ✅ No flickering or visual glitches during transition
- ✅ Background color consistently matches the active theme
- ✅ No console errors during theme switching

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________________________________

---

### Test 4: Node Dragging
**Requirement**: 2.1

**Steps**:
1. Create or open a flow with at least one node
2. Click and hold on a node
3. Drag the node to different positions on the canvas
4. Release the mouse button
5. Repeat with multiple nodes

**Expected Result**:
- ✅ Nodes can be dragged smoothly
- ✅ No visual artifacts appear during dragging
- ✅ Node position updates correctly when released
- ✅ Solid background remains consistent during drag operation
- ✅ No console errors

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________________________________

---

### Test 5: Node Connections
**Requirement**: 2.2

**Steps**:
1. Create or open a flow with at least two nodes
2. Click on an output handle of one node
3. Drag to create a connection
4. Connect to an input handle of another node
5. Observe the connection edge
6. Create multiple connections between different nodes

**Expected Result**:
- ✅ Connection creation works smoothly
- ✅ Connection edges render correctly on solid background
- ✅ Edge lines are clearly visible
- ✅ No visual artifacts during connection creation
- ✅ No console errors

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________________________________

---

### Test 6: Canvas Zoom
**Requirement**: 1.4, 2.3

**Steps**:
1. Use mouse wheel to zoom in on the canvas
2. Zoom in to maximum level
3. Use mouse wheel to zoom out
4. Zoom out to minimum level
5. Test zoom at various levels (25%, 50%, 100%, 150%, 200%)

**Expected Result**:
- ✅ Zoom in/out works smoothly
- ✅ Solid background remains consistent at all zoom levels
- ✅ No dotted pattern appears at any zoom level
- ✅ No visual artifacts or rendering issues
- ✅ Nodes and edges scale correctly
- ✅ No console errors

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________________________________

---

### Test 7: Canvas Pan
**Requirement**: 1.4, 2.4

**Steps**:
1. Click and hold on empty canvas area (not on a node)
2. Drag to pan the canvas in different directions:
   - Pan left
   - Pan right
   - Pan up
   - Pan down
   - Pan diagonally
3. Release and repeat

**Expected Result**:
- ✅ Canvas pans smoothly in all directions
- ✅ Solid background remains consistent during panning
- ✅ No visual artifacts appear
- ✅ Viewport moves correctly
- ✅ No console errors

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________________________________

---

### Test 8: Multi-Node Selection
**Requirement**: 2.5

**Steps**:
1. Create or open a flow with multiple nodes
2. Click on empty canvas and drag to create a selection box
3. Select multiple nodes at once
4. Observe the selection highlighting
5. Try selecting nodes in different areas of the canvas
6. Test with both light and dark themes

**Expected Result**:
- ✅ Selection box appears correctly
- ✅ Multiple nodes can be selected
- ✅ Selected nodes are highlighted correctly
- ✅ Selection works on solid background
- ✅ No visual artifacts during selection
- ✅ No console errors

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________________________________

---

### Test 9: Combined Interactions
**Requirement**: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5

**Steps**:
1. Perform a combination of actions:
   - Zoom in
   - Drag a node
   - Create a connection
   - Pan the canvas
   - Switch theme
   - Select multiple nodes
   - Zoom out
2. Repeat in different orders

**Expected Result**:
- ✅ All interactions work correctly together
- ✅ Solid background remains consistent throughout
- ✅ No visual glitches or artifacts
- ✅ No console errors or warnings
- ✅ Application remains responsive

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________________________________

---

## Browser Testing

Test the above scenarios in multiple browsers:

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Edge

**Notes on browser-specific issues**: _______________________________________

---

## Console Check

Throughout all tests, monitor the browser console for:
- ❌ No errors related to Background component
- ❌ No warnings about unused imports
- ❌ No ReactFlow errors
- ❌ No rendering errors

**Console Issues Found**: _______________________________________

---

## Performance Check

Observe application performance during testing:
- Canvas rendering speed
- Interaction responsiveness
- Theme switching speed
- Memory usage (check browser dev tools)

**Performance Notes**: _______________________________________

---

## Final Verification

After completing all tests:

1. **All Tests Passed**: [ ] Yes [ ] No
2. **No Console Errors**: [ ] Yes [ ] No
3. **No Visual Artifacts**: [ ] Yes [ ] No
4. **Performance Acceptable**: [ ] Yes [ ] No

---

## Issues Found

List any issues discovered during testing:

1. _______________________________________
2. _______________________________________
3. _______________________________________

---

## Sign-off

**Tester Name**: _______________________________________

**Date**: _______________________________________

**Overall Result**: [ ] PASS [ ] FAIL

**Additional Comments**: 
_______________________________________
_______________________________________
_______________________________________
