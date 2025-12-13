# Design Document: Vertical Workflow Layout

## Overview

This design document describes the implementation of a vertical (top-to-bottom) workflow layout for the Kozmoai canvas. The transformation changes the data flow direction from horizontal (left-to-right) to vertical (top-to-bottom), providing a more natural reading order for complex workflows.

### Current State
- Input handles positioned on the **left** side of nodes
- Output handles positioned on the **right** side of nodes
- Data flows from **left → right**
- Edges render horizontally between nodes

### Target State
- Input handles positioned at the **top** of nodes
- Output handles positioned at the **bottom** of nodes
- Data flows from **top → bottom**
- Edges render vertically between nodes

## Architecture

The vertical layout implementation affects the following layers of the application:

```
┌─────────────────────────────────────────────────────────────┐
│                    React Flow Canvas                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ GenericNode │  │ CustomEdges │  │ ConnectionLine      │  │
│  │             │  │             │  │ Component           │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────────▼──────────┐  │
│  │ Handle      │  │ Edge Path   │  │ Path Calculation    │  │
│  │ Render      │  │ Calculation │  │                     │  │
│  │ Component   │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    CSS Styles (classes.css)                  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. HandleRenderComponent

**File:** `src/frontend/src/CustomNodes/GenericNode/components/handleRenderComponent/index.tsx`

**Purpose:** Renders connection handles on nodes with correct positioning.

**Key Changes:**
- Change `Position.Left` → `Position.Top` for input handles
- Change `Position.Right` → `Position.Bottom` for output handles
- Update `BASE_HANDLE_STYLES` to use `left: "50%"` for horizontal centering

```typescript
// Handle position configuration
const BASE_HANDLE_STYLES = {
  width: "32px",
  height: "32px",
  left: "50%",  // Center horizontally for vertical layout
  position: "absolute" as const,
  zIndex: 30,
  background: "transparent",
  border: "none",
} as const;

// Handle component
<Handle
  type={left ? "target" : "source"}
  position={left ? Position.Top : Position.Bottom}
  // ... other props
/>
```

### 2. CustomEdges Component

**File:** `src/frontend/src/CustomEdges/index.tsx`

**Purpose:** Renders edge paths between connected nodes.

**Key Changes:**
- Calculate source Y position from node bottom
- Calculate target Y position from node top
- Use `Position.Bottom` for source and `Position.Top` for target

```typescript
export function DefaultEdge({ ... }: EdgeProps) {
  // Vertical layout: source at bottom, target at top
  const sourceYNew =
    (sourceNode?.position.y ?? 0) + (sourceNode?.measured?.height ?? 0);
  const targetYNew = targetNode?.position.y ?? 0;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY: sourceYNew,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    targetX,
    targetY: targetYNew,
  });
  // ...
}
```

### 3. ConnectionLineComponent

**File:** `src/frontend/src/pages/FlowPage/components/ConnectionLineComponent/index.tsx`

**Purpose:** Renders the preview line while dragging to create a new connection.

**Key Changes:**
- Calculate orthogonal path with vertical segments
- Use vertical midpoint for path routing

```typescript
const ConnectionLineComponent = ({ fromX, fromY, toX, toY, ... }) => {
  // Calculate orthogonal path for vertical layout
  const midY = fromY + (toY - fromY) / 2;
  const orthogonalPath = `M${fromX},${fromY} L${fromX},${midY} L${toX},${midY} L${toX},${toY}`;
  // ...
};
```

### 4. CSS Styles

**File:** `src/frontend/src/style/classes.css`

**Purpose:** Provides positioning styles for handles.

**Key Changes:**
- Add styles for `.react-flow__handle-top`
- Add styles for `.react-flow__handle-bottom`

```css
/* Vertical layout handle styles */
.react-flow__handle-top {
  top: 0 !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}

.react-flow__handle-bottom {
  bottom: 0 !important;
  left: 50% !important;
  transform: translate(-50%, 50%) !important;
}
```

## Data Models

### Handle Position Configuration

```typescript
interface HandleConfig {
  position: Position;  // Position.Top | Position.Bottom
  type: "source" | "target";
  style: HandleStyles;
}

interface HandleStyles {
  width: string;
  height: string;
  left: string;  // "50%" for horizontal centering
  position: "absolute";
  zIndex: number;
  background: string;
  border: string;
}
```

### Edge Path Configuration

```typescript
interface EdgePathConfig {
  sourceX: number;
  sourceY: number;  // Bottom of source node
  sourcePosition: Position.Bottom;
  targetX: number;
  targetY: number;  // Top of target node
  targetPosition: Position.Top;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties have been identified:

### Property 1: Input handles use Position.Top
*For any* rendered node with input handles, all input handles should have their position property set to Position.Top.
**Validates: Requirements 1.1**

### Property 2: Output handles use Position.Bottom
*For any* rendered node with output handles, all output handles should have their position property set to Position.Bottom.
**Validates: Requirements 2.1**

### Property 3: Edge paths use vertical orientation
*For any* edge connecting two nodes, the edge path should be calculated with sourcePosition=Position.Bottom and targetPosition=Position.Top.
**Validates: Requirements 3.1, 3.2**

### Property 4: Connection line uses vertical segments
*For any* connection line being dragged, the orthogonal path should contain vertical segments (changes in Y coordinate before changes in X coordinate at midpoint).
**Validates: Requirements 4.1, 4.3, 4.4**

### Property 5: Handle horizontal centering
*For any* handle rendered at top or bottom position, the CSS left property should be set to "50%" and the transform should include translateX(-50%) for horizontal centering.
**Validates: Requirements 7.1, 7.2**

### Property 6: Multiple handles maintain minimum spacing
*For any* node with multiple input or output handles, the horizontal spacing between adjacent handles should be at least 32 pixels.
**Validates: Requirements 5.3**

### Property 7: Edge connections persist through state changes
*For any* node that toggles between collapsed and expanded states, all connected edges should remain valid and connected after the state change.
**Validates: Requirements 6.3**

### Property 8: Edge paths update on node resize
*For any* node that changes size, all connected edge paths should be recalculated to reflect the new node dimensions.
**Validates: Requirements 6.4**

## Error Handling

### Invalid Handle Position
If a handle is rendered with an invalid position, the system should fall back to the default vertical layout positions (Top for inputs, Bottom for outputs).

### Edge Path Calculation Failure
If edge path calculation fails due to invalid node positions, the system should render a straight line between the source and target as a fallback.

### Missing Node Dimensions
If node dimensions are not available during edge calculation, the system should use default dimensions (width: 320px, height: 200px).

## Testing Strategy

### Dual Testing Approach

The implementation will use both unit tests and property-based tests to ensure correctness:

#### Unit Tests
- Test specific handle position values
- Test edge path calculation with known inputs
- Test CSS class application
- Test connection line path generation

#### Property-Based Tests

**Library:** fast-check (JavaScript property-based testing library)

**Configuration:** Minimum 100 iterations per property test

**Test Structure:**
```typescript
// Example property test structure
describe('Vertical Layout Properties', () => {
  it('Property 1: Input handles use Position.Top', () => {
    fc.assert(
      fc.property(
        fc.array(generateNodeWithInputs()),
        (nodes) => {
          nodes.forEach(node => {
            node.inputHandles.forEach(handle => {
              expect(handle.position).toBe(Position.Top);
            });
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Categories

1. **Handle Positioning Tests**
   - Verify Position.Top for all input handles
   - Verify Position.Bottom for all output handles
   - Verify CSS transforms for centering

2. **Edge Path Tests**
   - Verify source position uses node bottom
   - Verify target position uses node top
   - Verify smooth step path orientation

3. **Connection Line Tests**
   - Verify orthogonal path calculation
   - Verify vertical segment generation
   - Verify midpoint calculation

4. **Integration Tests**
   - Test drag and drop connections
   - Test node collapse/expand with edges
   - Test node resize with edges

### Test File Locations
- Unit tests: `src/frontend/tests/core/unit/verticalLayout.spec.ts`
- Property tests: `src/frontend/tests/core/unit/verticalLayout.property.spec.ts`
