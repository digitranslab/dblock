# Design Document: Orthogonal Edge Routing

## Overview

This design implements orthogonal (right-angle) edge routing for the flow canvas, replacing the current Bezier curve implementation. The solution leverages ReactFlow's built-in `getSmoothStepPath` function from `@xyflow/react`, which provides smooth orthogonal routing with rounded corners at turns. This approach ensures compatibility with the existing ReactFlow infrastructure while providing the visual clarity benefits of orthogonal edges.

The implementation will modify the `DefaultEdge` component and the `ConnectionLineComponent` to use orthogonal path calculations instead of Bezier curves.

## Architecture

### Component Structure

```
PageComponent (src/frontend/src/pages/FlowPage/components/PageComponent/index.tsx)
├── ReactFlow
│   ├── edgeTypes: { default: DefaultEdge }
│   └── connectionLineComponent: ConnectionLineComponent
│
CustomEdges (src/frontend/src/CustomEdges/index.tsx)
└── DefaultEdge (modified to use getSmoothStepPath)
│
ConnectionLineComponent (src/frontend/src/pages/FlowPage/components/ConnectionLineComponent/index.tsx)
└── (modified to use orthogonal path for connection preview)
```

### Data Flow

1. **Edge Rendering**: ReactFlow calls `DefaultEdge` component for each edge
2. **Path Calculation**: `DefaultEdge` uses `getSmoothStepPath` to compute orthogonal path
3. **Path Rendering**: `BaseEdge` renders the computed path with appropriate styling
4. **Connection Preview**: During edge creation/reconnection, `ConnectionLineComponent` shows orthogonal preview

## Components and Interfaces

### Modified Components

#### 1. DefaultEdge Component

**Location**: `src/frontend/src/CustomEdges/index.tsx`

**Current Implementation**: Uses `getBezierPath` with custom curve calculations

**New Implementation**: Uses `getSmoothStepPath` from `@xyflow/react`

**Interface**:
```typescript
import { EdgeProps, getSmoothStepPath, Position } from "@xyflow/react";

export function DefaultEdge({
  sourceHandleId,
  source,
  sourceX,
  sourceY,
  target,
  targetHandleId,
  targetX,
  targetY,
  ...props
}: EdgeProps): JSX.Element
```

**Key Changes**:
- Replace `getBezierPath` import with `getSmoothStepPath`
- Remove custom Bezier curve calculations (distance, distanceY, sourceDistanceY, edgePathLoop)
- Use `getSmoothStepPath` for both regular and special edge types
- Maintain existing logic for determining source/target positions
- Preserve dashed line styling for specific connection types

#### 2. ConnectionLineComponent

**Location**: `src/frontend/src/pages/FlowPage/components/ConnectionLineComponent/index.tsx`

**Current Implementation**: Uses cubic Bezier curve path (`C` command)

**New Implementation**: Uses orthogonal path with line segments

**Interface**:
```typescript
import { ConnectionLineComponentProps } from "@xyflow/react";

const ConnectionLineComponent = ({
  fromX,
  fromY,
  toX,
  toY,
  connectionLineStyle,
}: ConnectionLineComponentProps): JSX.Element
```

**Key Changes**:
- Replace Bezier curve path with orthogonal path calculation
- Create path using horizontal and vertical line segments
- Maintain existing styling and color logic
- Preserve the connection endpoint circle indicator

## Data Models

### Edge Path Data

The `getSmoothStepPath` function returns:

```typescript
type PathResult = [
  path: string,        // SVG path string
  labelX: number,      // X coordinate for edge label
  labelY: number,      // Y coordinate for edge label
  offsetX: number,     // X offset for label positioning
  offsetY: number      // Y offset for label positioning
]
```

### Edge Props (Existing)

```typescript
interface EdgeProps {
  id: string;
  source: string;
  target: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourceHandleId?: string;
  targetHandleId?: string;
  // ... other ReactFlow edge props
}
```

## Correc
tness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Orthogonal path generation

*For any* edge with source and target coordinates, the generated path should contain only horizontal and vertical line segments (using SVG L, H, V commands) and no curve commands (C, Q, S, T, A commands), except for optional smooth corners.

**Validates: Requirements 1.1, 1.2, 1.3**

**Reasoning**: This property ensures that all edges use orthogonal routing. By testing that the path calculation function produces only straight line segments, we verify the core requirement. Since the same path calculation is used for all edges, testing this property once validates that all edges will be orthogonal. Requirements 1.2 and 1.3 are logically implied by 1.1 - if the path generation function produces orthogonal paths, then all edges will use orthogonal routing consistently.

### Property 2: Dynamic path recalculation

*For any* edge, when the source or target node position changes, the recalculated path should remain orthogonal and connect the updated positions correctly.

**Validates: Requirements 1.4**

**Reasoning**: This property verifies that orthogonal routing is maintained when nodes are moved. We can test this by generating random initial positions, calculating the path, then changing positions and verifying the new path is still orthogonal and connects the correct points.

### Property 3: Multiple edge independence

*For any* component with multiple outgoing or incoming edges at different vertical positions, each edge should generate a valid orthogonal path independently.

**Validates: Requirements 2.4, 2.5**

**Reasoning**: This property combines testing for multiple connections and varying handle positions. By generating components with multiple edges at different vertical offsets, we verify that each edge routes correctly without depending on others. This consolidates two related requirements into a single comprehensive property.

### Property 4: Style attribute preservation

*For any* edge with styling properties (color, stroke width, selection state), the rendered path should include all specified style attributes in the output.

**Validates: Requirements 3.1**

**Reasoning**: This property ensures that the orthogonal path implementation doesn't lose styling information. We can test this by creating edges with various style properties and verifying they appear in the rendered output.

### Property 5: Dashed line preservation

*For any* edge that should use dashed lines (strokeDasharray), the orthogonal path should maintain the dash pattern.

**Validates: Requirements 3.3**

**Reasoning**: This property specifically tests that the dashed line styling for certain connection types is preserved when using orthogonal routing. We can test this by creating edges that require dashed lines and verifying the strokeDasharray attribute is present.

## Error Handling

### Invalid Coordinates

**Scenario**: Source or target coordinates are undefined, null, or NaN

**Handling**: 
- Use fallback coordinates (0, 0) or previous valid coordinates
- Log warning to console for debugging
- Render a straight line between available points

### Overlapping Nodes

**Scenario**: Source and target nodes are at the same or very close positions

**Handling**:
- Calculate minimum separation distance
- Add small offset to create visible edge
- Use simplified orthogonal path for very short distances

### Missing Node References

**Scenario**: Edge references a node that doesn't exist in the flow

**Handling**:
- ReactFlow handles this at the framework level
- Our component receives valid coordinates from ReactFlow
- No additional handling needed in edge component

## Testing Strategy

### Unit Testing

Unit tests will verify specific edge cases and examples:

1. **Horizontal alignment test**: Create two nodes at the same Y coordinate and verify the edge path includes vertical segments
2. **Vertical alignment test**: Create two nodes at the same X coordinate and verify the edge path includes horizontal segments  
3. **Backward connection test**: Create a source node to the right of a target node and verify the path routes appropriately
4. **Connection preview test**: Verify the ConnectionLineComponent generates an orthogonal path during drag operations
5. **Selection state test**: Verify that selected edges maintain the appropriate CSS classes and styling

### Property-Based Testing

Property-based tests will verify universal correctness properties across many randomly generated inputs using the **fast-check** library for TypeScript/JavaScript:

1. **Property 1 Test**: Generate random source/target coordinates and verify all generated paths are orthogonal
   - Generate: Random x, y coordinates for source and target (within reasonable canvas bounds)
   - Verify: Parse SVG path and confirm only L, H, V, M commands (no C, Q, S, T, A)
   - Iterations: 100+

2. **Property 2 Test**: Generate random initial positions, then random position changes, verify paths remain orthogonal
   - Generate: Random initial positions, then random delta movements
   - Verify: Both initial and updated paths are orthogonal
   - Iterations: 100+

3. **Property 3 Test**: Generate components with multiple edges at random vertical positions
   - Generate: Random number of edges (2-10), random handle positions
   - Verify: Each edge produces a valid orthogonal path
   - Iterations: 100+

4. **Property 4 Test**: Generate edges with random style properties
   - Generate: Random colors, stroke widths, selection states
   - Verify: Rendered output includes all style attributes
   - Iterations: 100+

5. **Property 5 Test**: Generate edges that require dashed lines
   - Generate: Random edges with dashed line requirement
   - Verify: strokeDasharray attribute is present in output
   - Iterations: 100+

Each property-based test will be tagged with a comment referencing the design document property:
- Format: `// Feature: orthogonal-edges, Property {number}: {property_text}`

### Integration Testing

Integration tests will verify the orthogonal edges work correctly within the full ReactFlow context:

1. Test edge rendering in a complete flow with multiple nodes
2. Test edge updates when nodes are dragged
3. Test edge reconnection operations
4. Test zoom and pan operations with orthogonal edges
5. Test edge selection and deletion

## Implementation Notes

### ReactFlow getSmoothStepPath

The `getSmoothStepPath` function from `@xyflow/react` provides:
- Automatic orthogonal routing with smooth corners
- Proper handling of different node positions
- Built-in support for ReactFlow's coordinate system
- Consistent behavior with other ReactFlow features

### Path Calculation Parameters

```typescript
getSmoothStepPath({
  sourceX: number,
  sourceY: number,
  sourcePosition: Position,  // Position.Right for our use case
  targetX: number,
  targetY: number,
  targetPosition: Position,  // Position.Left for our use case
  borderRadius?: number,     // Optional: controls corner smoothness
  offset?: number,           // Optional: controls path offset
})
```

### Backward Compatibility

The implementation maintains backward compatibility by:
- Preserving all existing edge props and styling
- Maintaining the same component interfaces
- Supporting all existing edge features (selection, reconnection, etc.)
- Only changing the path calculation method

### Performance Considerations

- `getSmoothStepPath` is optimized by ReactFlow team
- Path calculation is memoized by React when props don't change
- No additional performance overhead compared to Bezier curves
- Rendering performance is equivalent to current implementation

## Alternative Approaches Considered

### 1. Custom Orthogonal Algorithm

**Approach**: Implement custom orthogonal routing algorithm from scratch

**Pros**: Full control over routing logic

**Cons**: 
- Significant development time
- Need to handle many edge cases
- Potential bugs and maintenance burden
- Reinventing existing ReactFlow functionality

**Decision**: Rejected in favor of using ReactFlow's built-in solution

### 2. Third-Party Routing Library

**Approach**: Use external library like elkjs for edge routing

**Pros**: Advanced routing algorithms

**Cons**:
- Additional dependency
- Integration complexity with ReactFlow
- Overkill for this use case
- Performance overhead

**Decision**: Rejected - ReactFlow's built-in solution is sufficient

### 3. Straight Lines Only

**Approach**: Use completely straight lines without any turns

**Pros**: Simplest implementation

**Cons**:
- Edges would overlap nodes
- Poor visual quality
- Doesn't meet requirements for proper routing

**Decision**: Rejected - doesn't satisfy requirements

## Migration Path

### Phase 1: Implementation
1. Update `DefaultEdge` component to use `getSmoothStepPath`
2. Update `ConnectionLineComponent` to use orthogonal preview
3. Add unit tests for edge cases
4. Add property-based tests for correctness properties

### Phase 2: Testing
1. Run all tests to verify correctness
2. Manual testing with various flow configurations
3. Visual regression testing if available

### Phase 3: Deployment
1. Deploy to development environment
2. Gather feedback from internal users
3. Deploy to production

No feature flag is needed as this is a pure visual change with no functional impact on flow execution.
