# Design Document: DBlock Tooltip Redesign

## Overview

This design transforms the handle tooltip component to match the DBlock branding with an orange chat bubble background, the db smiley mascot, and improved information hierarchy. The tooltip will provide a friendly, branded experience while maintaining clear functionality for showing connection information.

## Architecture

The tooltip redesign involves:
1. **Visual Styling** - Orange background (#ffbd59), dark text, rounded corners with chat bubble shape
2. **Mascot Component** - Inline SVG or component for the db smiley face
3. **Content Structure** - Reorganized layout with mascot on left, content on right
4. **State Handling** - Different visual treatments for connecting/compatible/incompatible states

```
┌─────────────────────────────────────────────┐
│  ┌────┐                                     │
│  │ db │  Output: [Success]                  │
│  │ 😊 │                                     │
│  └────┘  Drag to connect compatible inputs  │
│          Click to filter components         │
└─────────────────────────────────────────────┘
```

## Components and Interfaces

### HandleTooltipComponent (Updated)

```typescript
interface HandleTooltipProps {
  isInput: boolean;
  tooltipTitle: string;
  isConnecting: boolean;
  isCompatible: boolean;
  isSameNode: boolean;
  left: boolean;
  outputCategory?: "success" | "else" | null;
}
```

### DBlockMascot Component (New)

```typescript
interface DBlockMascotProps {
  size?: number; // Default 36px
  className?: string;
}

// Inline SVG component rendering the db smiley face
export function DBlockMascot({ size = 36, className }: DBlockMascotProps): JSX.Element
```

### Styling Constants

```typescript
// DBlock brand colors
const DBLOCK_ORANGE = "#ffbd59";
const DBLOCK_TEXT = "#1a1a1a";
const DBLOCK_TEXT_SECONDARY = "#4a4a4a";

// Badge colors (maintained for type indicators)
const SUCCESS_COLOR = "#10B981";
const ELSE_COLOR = "#FF9500";
```

## Data Models

No new data models required. The component uses existing props from the handle system.

## Visual Design

### Tooltip Container
- Background: #ffbd59 (DBlock orange)
- Border-radius: 12px (matching chat bubble style)
- Padding: 12px 16px
- Box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
- Min-width: 240px

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│ [Mascot]  │  [Content Area]                     │
│  36x36    │  - Type/Status line                 │
│           │  - Instructions (when not connecting)│
└─────────────────────────────────────────────────┘
```

### Typography
- Primary text: #1a1a1a, font-weight 500
- Secondary text: #4a4a4a, font-weight 400
- Action words (Drag, Click): font-weight 700

### State Variations

1. **Default (Hover)**: Orange background, shows type and instructions
2. **Connecting + Compatible**: Orange background, "Connect to" message
3. **Connecting + Incompatible**: Slightly muted orange, "Incompatible with" message
4. **Same Node Error**: Error styling with warning icon



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Output Type Display Correctness

*For any* output handle with a category (success/else), the tooltip SHALL display the corresponding badge with the correct label and color.

**Validates: Requirements 3.1**

### Property 2: Connection State Message Correctness

*For any* combination of isConnecting, isCompatible, and isSameNode props:
- When isSameNode is true, display "Can't connect to the same node"
- When isConnecting is true and isCompatible is true, display "Connect to"
- When isConnecting is true and isCompatible is false, display "Incompatible with"

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 3: Instructions Visibility

*For any* tooltip state where isConnecting is false, the drag and click instructions SHALL be visible.

**Validates: Requirements 3.2**

## Error Handling

- If tooltipTitle is empty or undefined, display a fallback "Unknown type"
- If outputCategory is invalid, fall back to displaying the tooltipTitle types
- SVG mascot should have fallback if it fails to render

## Testing Strategy

### Unit Tests
- Verify DBlockMascot component renders correctly with different sizes
- Verify tooltip renders with correct background color
- Verify tooltip displays mascot element
- Verify bold styling on action words

### Property-Based Tests
- Test that for all valid prop combinations, the correct message is displayed
- Test that output category badges render with correct colors

### Integration Tests
- Test tooltip appears on handle hover
- Test tooltip content updates during connection drag
