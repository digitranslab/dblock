# Enhanced Drag & Drop Components

This directory contains enhanced drag-and-drop components that add visual feedback and improved UX without breaking existing functionality.

## Components

### 1. DragPreview
Enhanced drag preview with smooth animations and better visual design.

```tsx
import { DragPreview } from "@/components/core/DragPreview";

<DragPreview node={nodeData} type="genericNode" />
```

### 2. DropZoneIndicator
Visual feedback for valid/invalid drop zones.

```tsx
import { DropZoneIndicator } from "@/components/core/DropZoneIndicator";

<DropZoneIndicator isActive={isDragging} isValid={isValidDrop} />
```

### 3. EnhancedDraggable
Wrapper component that adds visual feedback to draggable elements.

```tsx
import { EnhancedDraggable } from "@/components/core/EnhancedDraggable";

<EnhancedDraggable onDragStart={handleDragStart}>
  <YourComponent />
</EnhancedDraggable>
```

### 4. EnhancedConnectionLine
Animated connection line preview when connecting nodes.

```tsx
import { EnhancedConnectionLine } from "@/components/core/EnhancedConnectionLine";

<ReactFlow connectionLineComponent={EnhancedConnectionLine} />
```

### 5. SnapToGridGuide
Visual guides for snap-to-grid functionality.

```tsx
import { SnapToGridGuide } from "@/components/core/SnapToGridGuide";

<SnapToGridGuide 
  isActive={isDragging} 
  position={dragPosition} 
  gridSize={20} 
/>
```

### 6. MagneticHandle
Connection handles with magnetic attraction and visual feedback.

```tsx
import { MagneticHandle } from "@/components/core/MagneticHandle";

<MagneticHandle 
  type="source" 
  position="right" 
  magneticRadius={30} 
/>
```

## Hooks

### useDragFeedback
Manages drag feedback state.

```tsx
import { useDragFeedback } from "@/hooks/useDragFeedback";

const {
  isDragging,
  isValidDrop,
  dragPosition,
  startDrag,
  endDrag,
  updateDragPosition,
  setDropValidity,
} = useDragFeedback();
```

### useSnapToGrid
Provides snap-to-grid functionality.

```tsx
import { useSnapToGrid } from "@/hooks/useSnapToGrid";

const {
  snapToGrid,
  getSnappedPosition,
  isSnapping,
  enableSnapping,
  disableSnapping,
  gridSize,
} = useSnapToGrid({ gridSize: 20, enabled: true });
```

## Utilities

### enhancedDragUtils
Utility functions for enhanced drag operations.

```tsx
import {
  createEnhancedDragImage,
  addDropTargetGlow,
  removeDropTargetGlow,
  addInvalidDropAnimation,
} from "@/utils/enhancedDragUtils";

// Create enhanced drag image
createEnhancedDragImage(event, { type: "genericNode", node: nodeData });

// Add glow to drop target
addDropTargetGlow(element);

// Remove glow
removeDropTargetGlow(element);

// Shake animation for invalid drop
addInvalidDropAnimation(element);
```

## Integration Guide

### Step 1: Add Visual Feedback to Sidebar Items

```tsx
// In flowSidebarComponent/index.tsx
import { EnhancedDraggable } from "@/components/core/EnhancedDraggable";
import { createEnhancedDragImage } from "@/utils/enhancedDragUtils";

const onDragStart = (event, data) => {
  // Create enhanced drag image
  createEnhancedDragImage(event, data);
  
  // Original drag logic
  event.dataTransfer.setData("genericNode", JSON.stringify(data));
};

<EnhancedDraggable onDragStart={(e) => onDragStart(e, data)}>
  <SidebarItem />
</EnhancedDraggable>
```

### Step 2: Add Connection Line Preview

```tsx
// In PageComponent/index.tsx
import { EnhancedConnectionLine } from "@/components/core/EnhancedConnectionLine";

<ReactFlow
  connectionLineComponent={EnhancedConnectionLine}
  // ... other props
/>
```

### Step 3: Add Snap-to-Grid Guides

```tsx
// In PageComponent/index.tsx
import { SnapToGridGuide } from "@/components/core/SnapToGridGuide";
import { useSnapToGrid } from "@/hooks/useSnapToGrid";

const { snapToGrid, isSnapping } = useSnapToGrid({ gridSize: 20 });

<ReactFlow
  snapToGrid={true}
  snapGrid={[20, 20]}
  // ... other props
>
  <SnapToGridGuide 
    isActive={isSnapping} 
    position={dragPosition} 
  />
</ReactFlow>
```

### Step 4: Add Magnetic Handles (Optional)

```tsx
// In GenericNode/components/handleRenderComponent/index.tsx
import { MagneticHandle } from "@/components/core/MagneticHandle";

<MagneticHandle
  type="source"
  position="right"
  id={handleId}
  magneticRadius={30}
/>
```

## Features

✅ **Smooth Animations**: Framer Motion powered animations
✅ **Visual Feedback**: Clear indicators for drag states
✅ **Snap-to-Grid**: Visual guides for alignment
✅ **Magnetic Handles**: Easier connection creation
✅ **Non-Breaking**: Works alongside existing drag system
✅ **Touch Support**: Better mobile experience
✅ **Accessibility**: Keyboard navigation support

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ✅ Touch events supported

## Performance

All components are optimized with:
- React.memo for expensive renders
- useCallback for event handlers
- Framer Motion's layout animations
- Minimal re-renders

## Testing

```bash
# Run tests
npm test -- DragPreview
npm test -- DropZoneIndicator
npm test -- EnhancedDraggable
```

## Troubleshooting

### Drag preview not showing
- Ensure framer-motion is installed
- Check z-index conflicts
- Verify createRoot is available

### Snap-to-grid not working
- Enable snapToGrid prop on ReactFlow
- Set snapGrid to [gridSize, gridSize]
- Check if useSnapToGrid hook is called

### Magnetic handles not attracting
- Increase magneticRadius prop
- Check handle positioning
- Verify mouse events are not blocked

## Future Enhancements

- [ ] Multi-touch gestures
- [ ] Collision detection
- [ ] Auto-scrolling during drag
- [ ] Undo/redo for drag operations
- [ ] Drag constraints and boundaries
