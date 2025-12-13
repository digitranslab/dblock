# Requirements Document

## Introduction

This document specifies the requirements for transforming the Kozmoai workflow canvas from a horizontal (left-to-right) layout to a vertical (top-to-bottom) layout. The vertical layout will improve readability for complex workflows and provide a more natural reading order that aligns with how users typically read content (top to bottom).

## Glossary

- **Canvas**: The main workflow editing area where nodes are placed and connected
- **Node**: A visual component representing a processing step in the workflow
- **Handle**: A connection point on a node where edges can be attached
- **Input Handle**: A handle that receives data from another node (currently on left, will be on top)
- **Output Handle**: A handle that sends data to another node (currently on right, will be on bottom)
- **Edge**: A visual connection line between two nodes
- **Connection Line**: A temporary line shown while dragging to create a new connection
- **React Flow**: The underlying library used for the node-based canvas

## Requirements

### Requirement 1

**User Story:** As a workflow designer, I want input handles positioned at the top of nodes, so that data flows naturally from top to bottom.

#### Acceptance Criteria

1. WHEN a node is rendered THEN the system SHALL position all input handles at the top edge of the node
2. WHEN multiple input handles exist on a node THEN the system SHALL distribute them horizontally along the top edge with equal spacing
3. WHEN an input handle is hovered THEN the system SHALL display the tooltip above the handle
4. WHEN a connection is dragged to an input handle THEN the system SHALL validate the connection from the top position

### Requirement 2

**User Story:** As a workflow designer, I want output handles positioned at the bottom of nodes, so that data flows naturally from top to bottom.

#### Acceptance Criteria

1. WHEN a node is rendered THEN the system SHALL position all output handles at the bottom edge of the node
2. WHEN multiple output handles exist on a node THEN the system SHALL distribute them horizontally along the bottom edge with equal spacing
3. WHEN an output handle is hovered THEN the system SHALL display the tooltip below the handle
4. WHEN a connection is dragged from an output handle THEN the system SHALL start the connection from the bottom position

### Requirement 3

**User Story:** As a workflow designer, I want edges to render vertically between nodes, so that the visual flow matches the data flow direction.

#### Acceptance Criteria

1. WHEN an edge connects two nodes THEN the system SHALL render the edge path from the source node's bottom to the target node's top
2. WHEN calculating edge paths THEN the system SHALL use smooth step paths with vertical orientation
3. WHEN edges cross other nodes THEN the system SHALL route the edge path to minimize visual overlap
4. WHEN an edge is selected THEN the system SHALL highlight the edge with the appropriate styling

### Requirement 4

**User Story:** As a workflow designer, I want the connection line preview to show vertical paths while dragging, so that I can see where the connection will be made.

#### Acceptance Criteria

1. WHEN dragging a new connection THEN the system SHALL render an orthogonal path with vertical segments
2. WHEN the connection line reaches the target THEN the system SHALL show a visual indicator at the connection point
3. WHEN dragging from an output handle THEN the system SHALL start the line from the bottom of the source node
4. WHEN dragging to an input handle THEN the system SHALL end the line at the top of the target node

### Requirement 5

**User Story:** As a workflow designer, I want nodes to have appropriate dimensions for vertical layout, so that handles are clearly visible and accessible.

#### Acceptance Criteria

1. WHEN a node has multiple input handles THEN the system SHALL ensure the node width accommodates all handles with proper spacing
2. WHEN a node has multiple output handles THEN the system SHALL ensure the node width accommodates all handles with proper spacing
3. WHEN handles are positioned THEN the system SHALL maintain a minimum spacing of 32 pixels between adjacent handles
4. WHEN the node content changes THEN the system SHALL recalculate handle positions accordingly

### Requirement 6

**User Story:** As a workflow designer, I want the canvas to support both collapsed and expanded node views with vertical layout, so that I can manage complex workflows efficiently.

#### Acceptance Criteria

1. WHEN a node is collapsed THEN the system SHALL position handles at the top and bottom of the collapsed view
2. WHEN a node is expanded THEN the system SHALL position handles at the top and bottom of the expanded view
3. WHEN toggling between collapsed and expanded states THEN the system SHALL maintain edge connections correctly
4. WHEN a node changes size THEN the system SHALL update connected edge paths automatically

### Requirement 7

**User Story:** As a workflow designer, I want handle styling to be consistent with the vertical layout, so that the interface looks polished and professional.

#### Acceptance Criteria

1. WHEN a handle is rendered at the top THEN the system SHALL apply CSS transform to center it horizontally
2. WHEN a handle is rendered at the bottom THEN the system SHALL apply CSS transform to center it horizontally
3. WHEN a handle is in hover state THEN the system SHALL display the neon glow effect correctly for vertical positioning
4. WHEN a handle is connected THEN the system SHALL display the connection indicator at the correct position
