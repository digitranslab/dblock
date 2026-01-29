# Implementation Plan: DBlock Tooltip Redesign

## Overview

Transform the handle tooltip to match DBlock branding with orange background, db mascot, and improved information structure.

## Tasks

- [x] 1. Create DBlockMascot component
  - [x] 1.1 Create new component file at `src/frontend/src/components/common/dblockMascot/index.tsx`
    - Create inline SVG component based on DBlockLogo.svg
    - Accept size prop (default 36px)
    - Accept className prop for additional styling
    - Export as default and named export
    - _Requirements: 2.1, 2.3_

- [x] 2. Update HandleTooltipComponent styling
  - [x] 2.1 Add DBlock brand color constants
    - Define DBLOCK_ORANGE (#ffbd59)
    - Define DBLOCK_TEXT (#1a1a1a)
    - Define DBLOCK_TEXT_SECONDARY (#4a4a4a)
    - _Requirements: 1.1, 1.2_

  - [x] 2.2 Update tooltip container styles
    - Apply orange background color
    - Add rounded corners (12px border-radius)
    - Add box shadow for depth
    - Set minimum width (240px)
    - Add consistent padding (12px 16px)
    - _Requirements: 1.1, 1.3, 1.4, 5.1, 5.3_

- [x] 3. Restructure tooltip layout
  - [x] 3.1 Import and integrate DBlockMascot component
    - Import DBlockMascot at top of file
    - Add mascot to left side of tooltip content
    - _Requirements: 2.1, 2.2_

  - [x] 3.2 Create flex layout with mascot and content areas
    - Use flexbox with gap between mascot and content
    - Mascot fixed width, content flexible
    - Align items to start for proper vertical alignment
    - _Requirements: 2.2, 3.5_

  - [x] 3.3 Update content area structure
    - Separate type/status line from instructions
    - Add visual spacing between sections
    - _Requirements: 3.2, 3.5_

- [x] 4. Update text styling
  - [x] 4.1 Apply dark text color for readability
    - Primary text: #1a1a1a
    - Secondary text: #4a4a4a
    - _Requirements: 1.2_

  - [x] 4.2 Add bold styling to action words
    - Make "Drag" bold in drag instruction
    - Make "Click" bold in click instruction
    - _Requirements: 3.3, 3.4_

- [x] 5. Update connection state displays
  - [x] 5.1 Style "Connect to" message for compatible connections
    - Maintain orange theme
    - Use positive/encouraging styling
    - _Requirements: 4.1, 4.4_

  - [x] 5.2 Style "Incompatible with" message
    - Slightly muted styling while maintaining orange theme
    - Clear warning indication
    - _Requirements: 4.2, 4.4_

  - [x] 5.3 Style same-node error message
    - Clear error indication
    - Maintain brand consistency
    - _Requirements: 4.3_

- [x] 6. Checkpoint - Visual verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify tooltip appears correctly on handle hover
  - Verify mascot displays properly
  - Verify all text is readable on orange background

- [x] 7. Write property tests
  - [x] 7.1 Write property test for connection state messages
    - **Property 2: Connection State Message Correctness**
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [x] 7.2 Write property test for output type display
    - **Property 1: Output Type Display Correctness**
    - **Validates: Requirements 3.1**

- [x] 8. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - Verify complete implementation matches design

## Notes

- The DBlockMascot SVG is derived from the existing DBlockLogo.svg
- Maintain backward compatibility with existing tooltip functionality
- Property tests validate universal correctness properties
