# Implementation Plan

- [x] 1. Update Handle Positioning
  - [x] 1.1 Update HandleRenderComponent to use Position.Top for input handles and Position.Bottom for output handles
    - Modify the Handle component's position prop from `Position.Left/Right` to `Position.Top/Bottom`
    - Update the `left` parameter semantics to represent input vs output
    - _Requirements: 1.1, 2.1_
  - [x] 1.2 Write property test for handle positioning
    - **Property 1: Input handles use Position.Top**
    - **Property 2: Output handles use Position.Bottom**
    - **Validates: Requirements 1.1, 2.1**
  - [x] 1.3 Update BASE_HANDLE_STYLES for horizontal centering
    - Change `top: "50%"` to `left: "50%"` for horizontal centering
    - Ensure handles are centered on the top/bottom edges
    - _Requirements: 7.1, 7.2_
  - [x] 1.4 Write property test for handle centering
    - **Property 5: Handle horizontal centering**
    - **Validates: Requirements 7.1, 7.2**

- [x] 2. Update Edge Path Calculation
  - [x] 2.1 Update CustomEdges component for vertical orientation
    - Calculate sourceY from node bottom (position.y + height)
    - Calculate targetY from node top (position.y)
    - Use Position.Bottom for sourcePosition and Position.Top for targetPosition
    - _Requirements: 3.1, 3.2_
  - [x] 2.2 Write property test for edge path orientation
    - **Property 3: Edge paths use vertical orientation**
    - **Validates: Requirements 3.1, 3.2**

- [x] 3. Update Connection Line Component
  - [x] 3.1 Update ConnectionLineComponent for vertical orthogonal paths
    - Calculate vertical midpoint for path routing
    - Generate orthogonal path with vertical segments
    - _Requirements: 4.1, 4.3, 4.4_
  - [x] 3.2 Write property test for connection line paths
    - **Property 4: Connection line uses vertical segments**
    - **Validates: Requirements 4.1, 4.3, 4.4**

- [x] 4. Update CSS Styles
  - [x] 4.1 Add CSS styles for top and bottom handles
    - Add `.react-flow__handle-top` styles with proper transform
    - Add `.react-flow__handle-bottom` styles with proper transform
    - _Requirements: 7.1, 7.2_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update Tooltip Positioning
  - [x] 6.1 Update tooltip side prop for vertical layout
    - Change tooltip side from "left"/"right" to "top"/"bottom"
    - Ensure tooltips don't overlap with handles
    - _Requirements: 1.3, 2.3_

- [x] 7. Handle Multiple Handles Spacing
  - [x] 7.1 Implement horizontal distribution for multiple input handles
    - Calculate equal spacing for multiple handles at top edge
    - Ensure minimum 32px spacing between adjacent handles
    - _Requirements: 1.2, 5.1, 5.3_
  - [x] 7.2 Implement horizontal distribution for multiple output handles
    - Calculate equal spacing for multiple handles at bottom edge
    - Ensure minimum 32px spacing between adjacent handles
    - _Requirements: 2.2, 5.2, 5.3_
  - [x] 7.3 Write property test for handle spacing
    - **Property 6: Multiple handles maintain minimum spacing**
    - **Validates: Requirements 5.3**

- [x] 8. Update Node State Handling
  - [x] 8.1 Ensure collapsed nodes maintain vertical handle positions
    - Verify handles remain at top/bottom in collapsed state
    - _Requirements: 6.1_
  - [x] 8.2 Ensure expanded nodes maintain vertical handle positions
    - Verify handles remain at top/bottom in expanded state
    - _Requirements: 6.2_
  - [x] 8.3 Write property test for state change edge persistence
    - **Property 7: Edge connections persist through state changes**
    - **Validates: Requirements 6.3**

- [x] 9. Update Edge Path Recalculation
  - [x] 9.1 Ensure edge paths update on node resize
    - Verify edge paths recalculate when node dimensions change
    - Use updateNodeInternals to trigger recalculation
    - _Requirements: 6.4_
  - [x] 9.2 Write property test for edge path updates
    - **Property 8: Edge paths update on node resize**
    - **Validates: Requirements 6.4**

- [x] 10. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
