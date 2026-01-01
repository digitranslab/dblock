# Design Document: GitHub Actions-Style Handles

## Overview

This design transforms the workflow canvas handles from circular buttons with neon glow effects to minimal, pill-shaped connectors inspired by GitHub Actions pipeline design. The new design creates a cleaner, more professional appearance while maintaining full functionality for connection management.

The key visual changes include:
- Replacing 10px circular handles with 16x8px pill-shaped handles
- Removing neon glow animations in favor of subtle opacity and scale transitions
- Positioning handles flush with node edges (extending 4px beyond)
- Using smoothstep edges for curved, professional-looking connections

## Architecture

The handle system consists of three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                     GenericNode                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              NodeInputHandles                        │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │         HandleRenderComponent                 │   │    │
│  │  │  (Input Handle - Gray, Top Center)           │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│                    [Node Content]                            │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              NodeOutputHandles                       │    │
│  │  ┌────────────────┐    ┌────────────────┐           │    │
│  │  │ HandleRender   │    │ HandleRender   │           │    │
│  │  │ (Success-Green)│    │ (Else-Orange)  │           │    │
│  │  └────────────────┘    └────────────────┘           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### HandleRenderComponent

The core component responsible for rendering individual handles.

```typescript
interface HandleRenderProps {
  left: boolean;                    // true = input (top), false = output (bottom)
  nodes: AllNodeType[];
  tooltipTitle: string;
  proxy?: any;
  id: HandleIdType;
  title: string;
  edges: EdgeType[];
  myData: any;
  colors: string[];
  setFilterEdge: (edges: any) => void;
  showNode: boolean;
  testIdComplement?: string;
  nodeId: string;
  colorName?: string[];
  outputCategory?: "success" | "else" | null;
}

// Handle style constants
const HANDLE_STYLES = {
  width: 16,           // px
  height: 8,           // px
  borderRadius: 4,     // px (pill shape)
  defaultOpacity: 0.8,
  hoverOpacity: 1.0,
  hoverScale: 1.1,
  disabledOpacity: 0.4,
  incompatibleOpacity: 0.3,
  transitionDuration: 150, // ms
};

// Color constants
const HANDLE_COLORS = {
  input: "#9CA3AF",      // Gray
  success: "#10B981",    // Green
  else: "#FF9500",       // Orange
  disabled: "#6B7280",   // Muted gray
};
```

### HandleContent Subcomponent

Renders the visual pill shape inside the React Flow Handle.

```typescript
interface HandleContentProps {
  isNullHandle: boolean;
  handleColor: string;
  isHovered: boolean;
  isCompatible: boolean;
  isDragging: boolean;
  outputCategory?: "success" | "else" | null;
}

// Computed styles based on state
function getHandleContentStyle(props: HandleContentProps): CSSProperties {
  const baseStyle = {
    width: `${HANDLE_STYLES.width}px`,
    height: `${HANDLE_STYLES.height}px`,
    borderRadius: `${HANDLE_STYLES.borderRadius}px`,
    backgroundColor: props.handleColor,
    border: `1px solid ${props.handleColor}80`, // 50% opacity border
    transition: `all ${HANDLE_STYLES.transitionDuration}ms ease`,
  };

  if (props.isNullHandle || !props.isCompatible) {
    return {
      ...baseStyle,
      opacity: HANDLE_STYLES.incompatibleOpacity,
      backgroundColor: HANDLE_COLORS.disabled,
    };
  }

  if (props.isHovered) {
    return {
      ...baseStyle,
      opacity: HANDLE_STYLES.hoverOpacity,
      transform: `scale(${HANDLE_STYLES.hoverScale})`,
      boxShadow: props.isDragging ? `0 0 4px ${props.handleColor}` : 'none',
    };
  }

  return {
    ...baseStyle,
    opacity: HANDLE_STYLES.defaultOpacity,
  };
}
```

### NodeInputHandles

Renders the unified input handle at the top center of nodes.

```typescript
// Positioning styles
const inputHandleContainerStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 50,
};
```

### NodeOutputHandles

Renders Success and Else output handles at the bottom of nodes.

```typescript
// Positioning styles for multiple handles
const outputHandleContainerStyle: CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: '50%',
  transform: 'translate(-50%, 50%)',
  display: 'flex',
  gap: '16px',
  zIndex: 50,
};
```

## Data Models

### Handle State Model

```typescript
interface HandleState {
  isHovered: boolean;
  isDragging: boolean;
  isCompatible: boolean;
  isConnected: boolean;
  isDisabled: boolean;
}

// State transitions
type HandleStateAction = 
  | { type: 'HOVER_START' }
  | { type: 'HOVER_END' }
  | { type: 'DRAG_START' }
  | { type: 'DRAG_END' }
  | { type: 'SET_COMPATIBLE'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean };
```

### Edge Style Model

```typescript
interface EdgeStyleConfig {
  type: 'smoothstep';
  strokeWidth: number;
  strokeColor: string;
  animated: boolean;
  selected: boolean;
}

const DEFAULT_EDGE_STYLE: EdgeStyleConfig = {
  type: 'smoothstep',
  strokeWidth: 2,
  strokeColor: '#9CA3AF',
  animated: false,
  selected: false,
};

const SELECTED_EDGE_STYLE: Partial<EdgeStyleConfig> = {
  strokeWidth: 3,
  // Add subtle glow via CSS filter
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Handle Dimensions Consistency

*For any* rendered handle (input or output), the handle content element SHALL have dimensions of 16px width and 8px height with a border-radius of 4px.

**Validates: Requirements 1.1**

### Property 2: Handle Spacing Consistency

*For any* node with multiple output handles, the gap between adjacent handles SHALL be exactly 16px.

**Validates: Requirements 2.3**

### Property 3: Handle Color by Type

*For any* handle, the background color SHALL be determined by its type:
- Input handles: #9CA3AF (gray)
- Success output handles: #10B981 (green)
- Else output handles: #FF9500 (orange)

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: Edge Color Matching

*For any* edge in the canvas, the stroke color SHALL match the color of its source output handle.

**Validates: Requirements 5.3**

### Property 5: Accessibility Contrast Ratio

*For any* handle color against the canvas background, the contrast ratio SHALL be at least 4.5:1.

**Validates: Requirements 6.1**

### Property 6: ARIA Labels Presence

*For any* rendered handle, the element SHALL have an aria-label attribute describing the handle type and current connection status.

**Validates: Requirements 6.3**

## Error Handling

### Invalid Handle States

- If a handle receives an unknown `outputCategory`, default to gray color
- If handle positioning calculations fail, fall back to centered positioning
- If edge color lookup fails, use default gray (#9CA3AF)

### Connection Validation

- Maintain existing `isValidConnection` logic for type compatibility
- Handle edge cases where source/target nodes are deleted during drag
- Gracefully handle rapid connect/disconnect sequences

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Handle rendering tests**
   - Verify handle renders with correct dimensions
   - Verify correct colors for each handle type
   - Verify hover state style changes
   - Verify disabled state appearance

2. **Edge styling tests**
   - Verify smoothstep edge type is applied
   - Verify stroke width values
   - Verify selected state styling

3. **Accessibility tests**
   - Verify aria-labels are present
   - Verify keyboard focus works

### Property-Based Tests

Property-based tests will use a testing library (e.g., fast-check) to verify universal properties:

1. **Handle dimensions property test**
   - Generate random handle configurations
   - Verify all handles have 16x8px dimensions
   - Minimum 100 iterations

2. **Handle color property test**
   - Generate handles with random types (input/success/else)
   - Verify color matches expected value for type
   - Minimum 100 iterations

3. **Edge color matching property test**
   - Generate random edges with various source handle types
   - Verify edge color matches source handle color
   - Minimum 100 iterations

4. **Contrast ratio property test**
   - Generate all handle colors against various backgrounds
   - Calculate contrast ratio
   - Verify >= 4.5:1
   - Minimum 100 iterations

### Test Configuration

```typescript
// Property test configuration
const PBT_CONFIG = {
  numRuns: 100,
  seed: 42, // For reproducibility
};

// Test tag format
// **Feature: github-actions-handles, Property 1: Handle Dimensions Consistency**
```
