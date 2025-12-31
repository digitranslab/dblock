# PageComponent Background Property Tests

## Overview
This test suite verifies three properties from the canvas-solid-background feature spec:

### Property 1: Background Removal Completeness
**Property**: For any canvas render, the DOM should not contain any ReactFlow Background component elements (no elements with class `react-flow__background`)

**Validates**: Requirements 1.1

### Property 2: Theme-Aware Background Color
**Property**: For any theme state (light or dark), the canvas background color should match the corresponding --canvas CSS variable value

**Validates**: Requirements 1.2, 1.3

### Property 3: Canvas Interaction Preservation
**Property**: For any canvas interaction (node drag, zoom, pan, connection creation), the interaction should complete successfully without errors or visual artifacts

**Validates**: Requirements 2.1, 2.2, 2.3, 2.4, 2.5

## Test Implementation
The tests are implemented in `pageComponent-background.spec.ts` and use Playwright to verify the properties across 100+ different states.

## Running the Tests

### Prerequisites
1. Ensure the backend server is running
2. Ensure the frontend development server is running

### Run all tests
```bash
cd src/frontend
npx playwright test tests/core/unit/pageComponent-background.spec.ts
```

### Run with UI mode (for debugging)
```bash
cd src/frontend
npx playwright test tests/core/unit/pageComponent-background.spec.ts --ui
```

### Run with headed browser (to see the test in action)
```bash
cd src/frontend
npx playwright test tests/core/unit/pageComponent-background.spec.ts --headed
```

## Test Coverage

### Property 1 Test Coverage
The property-based test checks the invariant across:
- Blank flow states
- Canvas with components
- Zoomed in states
- Zoomed out states
- Fit view states
- Various intermediate states

Each iteration verifies that no `.react-flow__background` elements exist in the DOM.

### Property 2 Test Coverage
The property-based test checks the theme-aware background color across:
- Light theme states
- Dark theme states
- Theme switches
- Canvas interactions (zoom, pan) during theme changes
- Various intermediate states

Each iteration verifies that the computed background color matches:
- Light theme: `rgb(244, 244, 246)` (from `--canvas: 240 5% 96%`)
- Dark theme: `rgb(0, 0, 0)` (from `--canvas: 0 0% 0%`)

### Property 3 Test Coverage
The property-based test checks canvas interactions across 100+ operations including:
- **Node drag from sidebar** (Requirement 2.1): Adding new components by dragging from sidebar to canvas
- **Node drag on canvas** (Requirement 2.1): Moving existing nodes to different positions
- **Zoom in/out** (Requirement 2.3): Testing canvas zoom controls
- **Fit view** (Requirement 2.3): Testing canvas viewport reset
- **Canvas panning** (Requirement 2.4): Dragging the canvas to move the viewport
- **Multi-node selection** (Requirement 2.5): Selecting multiple nodes using Shift+click
- **Connection creation** (Requirement 2.2): Creating edges between node handles

Each iteration verifies that:
1. No console errors or page errors occur during the interaction
2. The ReactFlow canvas element remains present and functional
3. All interactions complete without throwing exceptions

## Expected Result
All 100 iterations for each property should pass, confirming that:
1. The Background component has been successfully removed
2. The canvas uses a solid background color that correctly adapts to the current theme
3. All canvas interactions work correctly without errors or visual artifacts
