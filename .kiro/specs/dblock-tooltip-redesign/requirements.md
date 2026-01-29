# Requirements Document

## Introduction

Redesign the handle tooltip component to match the DBlock branding with an orange background (#ffbd59), improved information structure, and the DBlock mascot (db smiley logo) appearing in the tooltip.

## Glossary

- **Handle_Tooltip**: The popup that appears when hovering over input/output handles on nodes
- **DBlock_Mascot**: The db smiley face logo - a chat bubble with "db" letters forming eyes and a smile
- **DBlock_Orange**: The brand color #ffbd59 used in the DBlock logo
- **Output_Category**: Either "Success" (green) or "Else" (orange) for output handles

## Requirements

### Requirement 1: Orange Background Theme

**User Story:** As a user, I want the tooltip to have the DBlock orange background, so that it matches the brand identity.

#### Acceptance Criteria

1. THE Handle_Tooltip SHALL have a background color of #ffbd59 (DBlock orange)
2. THE Handle_Tooltip SHALL have dark text (#1a1a1a or black) for readability on the orange background
3. THE Handle_Tooltip SHALL have rounded corners matching the chat bubble style of the DBlock logo
4. THE Handle_Tooltip SHALL have a subtle shadow for depth and visibility

### Requirement 2: DBlock Mascot Integration

**User Story:** As a user, I want to see the DBlock mascot in the tooltip, so that the interface feels friendly and branded.

#### Acceptance Criteria

1. THE Handle_Tooltip SHALL display a small DBlock mascot icon (db smiley face)
2. THE DBlock_Mascot SHALL be positioned on the left side of the tooltip content
3. THE DBlock_Mascot SHALL be sized appropriately (approximately 32-40px) to not overwhelm the content
4. THE DBlock_Mascot SHALL maintain its original proportions and styling

### Requirement 3: Improved Information Structure

**User Story:** As a user, I want the tooltip to show clear, well-organized information about the handle, so that I can understand what connections are possible.

#### Acceptance Criteria

1. THE Handle_Tooltip SHALL display the output type prominently (Success/Else badge or data type)
2. THE Handle_Tooltip SHALL show connection instructions in a clear, hierarchical format
3. WHEN displaying drag instructions, THE Handle_Tooltip SHALL use bold text for action words
4. WHEN displaying click instructions, THE Handle_Tooltip SHALL use bold text for action words
5. THE Handle_Tooltip SHALL separate the type information from the action instructions visually

### Requirement 4: Connection State Feedback

**User Story:** As a user, I want the tooltip to clearly indicate connection compatibility, so that I know if a connection is valid.

#### Acceptance Criteria

1. WHEN connecting and compatible, THE Handle_Tooltip SHALL display "Connect to" with positive styling
2. WHEN connecting and incompatible, THE Handle_Tooltip SHALL display "Incompatible with" with warning styling
3. WHEN attempting to connect to the same node, THE Handle_Tooltip SHALL display an error message
4. THE Handle_Tooltip SHALL maintain the orange theme while showing compatibility states

### Requirement 5: Responsive Layout

**User Story:** As a user, I want the tooltip to display correctly regardless of content length, so that all information is readable.

#### Acceptance Criteria

1. THE Handle_Tooltip SHALL have a minimum width to accommodate the mascot and content
2. THE Handle_Tooltip SHALL wrap text appropriately for longer type names
3. THE Handle_Tooltip SHALL maintain consistent padding and spacing
4. THE Handle_Tooltip SHALL position correctly relative to the handle (not overlapping the node)
