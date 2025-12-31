# Implementation Plan

- [x] 1. Update DefaultEdge component to use orthogonal routing
  - Modify `src/frontend/src/CustomEdges/index.tsx` to use `getSmoothStepPath` instead of `getBezierPath`
  - Remove custom Bezier curve calculations (distance, distanceY, sourceDistanceY, edgePathLoop variables)
  - Update imports to include `getSmoothStepPath` from `@xyflow/react`
  - Maintain existing logic for source/target position calculations
  - Preserve strokeDasharray styling for special connection types
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.3_

- [x] 1.1 Write property test for orthogonal path generation
  - **Property 1: Orthogonal path generation**
  - **Validates: Requirements 1.1, 1.2, 1.3**

- [x] 1.2 Write property test for dynamic path recalculation
  - **Property 2: Dynamic path recalculation**
  - **Validates: Requirements 1.4**

- [x] 1.3 Write property test for multiple edge independence
  - **Property 3: Multiple edge independence**
  - **Validates: Requirements 2.4, 2.5**

- [x] 1.4 Write property test for style attribute preservation
  - **Property 4: Style attribute preservation**
  - **Validates: Requirements 3.1**

- [x] 1.5 Write property test for dashed line preservation
  - **Property 5: Dashed line preservation**
  - **Validates: Requirements 3.3**

- [x] 2. Update ConnectionLineComponent for orthogonal preview
  - Modify `src/frontend/src/pages/FlowPage/components/ConnectionLineComponent/index.tsx`
  - Replace Bezier curve path calculation with orthogonal path
  - Create path using horizontal and vertical line segments
  - Calculate intermediate points for orthogonal routing
  - Maintain existing color and styling logic
  - Preserve connection endpoint circle indicator
  - _Requirements: 4.1, 4.5_

- [x] 2.1 Write unit test for horizontal alignment
  - Create test with nodes at same Y coordinate
  - Verify edge path includes vertical segments
  - _Requirements: 2.1_

- [x] 2.2 Write unit test for vertical alignment
  - Create test with nodes at same X coordinate
  - Verify edge path includes horizontal segments
  - _Requirements: 2.2_

- [x] 2.3 Write unit test for backward connection
  - Create test with source node to the right of target node
  - Verify path routes appropriately without overlapping
  - _Requirements: 2.3_

- [x] 2.4 Write unit test for connection preview
  - Verify ConnectionLineComponent generates orthogonal path during drag
  - Test with various from/to coordinate combinations
  - _Requirements: 4.1_

- [x] 2.5 Write unit test for selection state
  - Verify selected edges maintain appropriate CSS classes and styling
  - Test selection state preservation with orthogonal paths
  - _Requirements: 3.2_

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
