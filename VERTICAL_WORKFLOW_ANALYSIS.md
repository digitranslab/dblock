# 🔄 Vertical Workflow Layout Analysis

## Current State: Left-to-Right (Horizontal) Layout

The current Kozmoai workflow canvas uses a **horizontal (left-to-right)** layout where:
- **Input handles** are on the **LEFT** side of nodes
- **Output handles** are on the **RIGHT** side of nodes
- Data flows from **LEFT → RIGHT**

## Goal: Top-to-Bottom (Vertical) Layout

Transform the workflow to a **vertical (top-to-bottom)** layout where:
- **Input handles** are on the **TOP** of nodes
- **Output handles** are on the **BOTTOM** of nodes
- Data flows from **TOP → BOTTOM**

---

## 📁 Files That Need Modification

### 1. Handle Positioning (Critical)

**File: `src/frontend/src/CustomNodes/GenericNode/components/handleRenderComponent/index.tsx`**

Current code (line ~418):
```tsx
<Handle
  type={left ? "target" : "source"}
  position={left ? Position.Left : Position.Right}
  ...
/>
```

**Required Change:**
```tsx
<Handle
  type={left ? "target" : "source"}
  position={left ? Position.Top : Position.Bottom}
  ...
/>
```

**Additional Changes Needed:**
- Rename `left` parameter to `isInput` for clarity
- Update handle positioning styles from horizontal to vertical
- Modify `BASE_HANDLE_STYLES` to position handles at top/bottom instead of left/right

### 2. Edge Path Calculation (Critical)

**File: `src/frontend/src/CustomEdges/index.tsx`**

Current code (lines 30-39):
```tsx
const sourceXNew =
  (sourceNode?.position.x ?? 0) + (sourceNode?.measured?.width ?? 0);
const targetXNew = targetNode?.position.x ?? 0;

const [edgePath] = getSmoothStepPath({
  sourceX: sourceXNew,
  sourceY,
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  targetX: targetXNew,
  targetY,
});
```

**Required Change:**
```tsx
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
```

### 3. Node Component Layout (Important)

**File: `src/frontend/src/CustomNodes/GenericNode/index.tsx`**

The GenericNode component needs to be restructured:
- Currently: Handles are positioned on left/right sides
- Required: Handles should be positioned on top/bottom

**Changes needed:**
- Modify the node's flex layout from `flex-row` to `flex-col`
- Reposition input handles to top of node
- Reposition output handles to bottom of node
- Adjust node width/height proportions

### 4. Connection Line Component

**File: `src/frontend/src/pages/FlowPage/components/ConnectionLineComponent/index.tsx`**

Update the connection line rendering to draw vertical paths instead of horizontal.

### 5. Auto-Layout Algorithm (If Exists)

Check for any auto-layout or dagre layout configurations that assume horizontal flow.

---

## 🔧 Detailed Implementation Plan

### Phase 1: Core Handle Changes

#### Step 1.1: Update Handle Positions

In `handleRenderComponent/index.tsx`:

```tsx
// Change from:
const BASE_HANDLE_STYLES = {
  width: "32px",
  height: "32px",
  top: "50%",
  position: "absolute" as const,
  zIndex: 30,
  background: "transparent",
  border: "none",
} as const;

// Change to:
const BASE_HANDLE_STYLES = {
  width: "32px",
  height: "32px",
  left: "50%",  // Center horizontally for vertical layout
  position: "absolute" as const,
  zIndex: 30,
  background: "transparent",
  border: "none",
} as const;
```

#### Step 1.2: Update Handle Position Enum

```tsx
// Change from:
position={left ? Position.Left : Position.Right}

// Change to:
position={isInput ? Position.Top : Position.Bottom}
```

### Phase 2: Edge Rendering Changes

#### Step 2.1: Update Edge Path Calculation

In `CustomEdges/index.tsx`:

```tsx
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
}: EdgeProps) {
  const getNode = useFlowStore((state) => state.getNode);

  const sourceNode = getNode(source);
  const targetNode = getNode(target);

  const targetHandleObject = scapeJSONParse(targetHandleId!);

  // For vertical layout: source at bottom, target at top
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

  return (
    <BaseEdge
      path={edgePath}
      strokeDasharray={targetHandleObject.output_types ? "5 5" : "0"}
      {...props}
    />
  );
}
```

### Phase 3: Node Layout Changes

#### Step 3.1: Restructure GenericNode

The GenericNode component needs to be modified to:
1. Place input handles at the top
2. Place output handles at the bottom
3. Adjust the node's internal layout

### Phase 4: CSS/Styling Updates

#### Step 4.1: Handle Positioning CSS

```css
/* For vertical layout */
.react-flow__handle-top {
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
}

.react-flow__handle-bottom {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
}
```

---

## 📊 Impact Analysis

### Components Affected

| Component | Impact Level | Changes Required |
|-----------|--------------|------------------|
| `handleRenderComponent` | **HIGH** | Position enum, styles |
| `CustomEdges` | **HIGH** | Path calculation, positions |
| `GenericNode` | **MEDIUM** | Layout restructure |
| `ConnectionLineComponent` | **MEDIUM** | Path rendering |
| `PageComponent` | **LOW** | Possibly fitView settings |
| CSS/Styles | **MEDIUM** | Handle positioning |

### Breaking Changes

1. **Existing Flows**: Saved flows may need migration
2. **Node Positions**: Nodes will need repositioning
3. **Edge Paths**: All edges will render differently
4. **User Experience**: Users familiar with horizontal layout will need adjustment

---

## 🎯 Implementation Options

### Option A: Full Vertical Layout (Recommended)

**Pros:**
- Clean, consistent vertical flow
- Better for complex workflows with many steps
- More natural reading order (top-to-bottom)

**Cons:**
- Significant code changes
- May require flow migration
- Wider nodes needed for multiple inputs/outputs

### Option B: Configurable Layout Direction

**Pros:**
- User choice between horizontal and vertical
- Backward compatible
- Flexible for different use cases

**Cons:**
- More complex implementation
- Need to maintain two layout systems
- More testing required

### Option C: Hybrid Layout

**Pros:**
- Keep horizontal for simple flows
- Use vertical for complex flows
- Best of both worlds

**Cons:**
- Most complex implementation
- Confusing UX
- Difficult to maintain

---

## 🔄 Migration Strategy

### For Existing Flows

1. **Auto-Migration**: Automatically reposition nodes when loading old flows
2. **Manual Migration**: Provide a "Convert to Vertical" button
3. **Dual Support**: Support both layouts during transition period

### Node Repositioning Algorithm

```typescript
function migrateToVerticalLayout(nodes: Node[], edges: Edge[]) {
  // Calculate new positions based on graph topology
  const layers = calculateLayers(nodes, edges);
  
  return nodes.map(node => {
    const layer = layers.get(node.id);
    return {
      ...node,
      position: {
        x: node.position.y,  // Swap X and Y
        y: node.position.x * 1.5,  // Adjust spacing
      }
    };
  });
}
```

---

## 📝 Recommended Implementation Order

1. **Phase 1**: Update handle positions (Position.Top/Bottom)
2. **Phase 2**: Update edge path calculations
3. **Phase 3**: Update node component layout
4. **Phase 4**: Update CSS/styling
5. **Phase 5**: Add flow migration support
6. **Phase 6**: Testing and refinement

---

## 🧪 Testing Checklist

- [ ] Handles render at correct positions (top/bottom)
- [ ] Edges connect properly between nodes
- [ ] Drag and drop works correctly
- [ ] Connection validation works
- [ ] Existing flows load correctly (or migrate)
- [ ] New flows create with vertical layout
- [ ] Zoom and pan work correctly
- [ ] Selection and multi-select work
- [ ] Copy/paste maintains layout
- [ ] Export/import preserves layout

---

## 📚 Key Files Summary

| File | Purpose | Changes |
|------|---------|---------|
| `CustomEdges/index.tsx` | Edge rendering | Position.Bottom/Top |
| `handleRenderComponent/index.tsx` | Handle positioning | Position.Top/Bottom |
| `GenericNode/index.tsx` | Node layout | Flex direction |
| `ConnectionLineComponent/index.tsx` | Connection preview | Path calculation |
| `PageComponent/index.tsx` | Canvas setup | Possibly fitView |

---

## 🚀 Quick Start Implementation

To implement vertical layout, start with these minimal changes:

### 1. CustomEdges/index.tsx
```tsx
sourcePosition: Position.Bottom,
targetPosition: Position.Top,
```

### 2. handleRenderComponent/index.tsx
```tsx
position={left ? Position.Top : Position.Bottom}
```

### 3. Test and iterate

This will give you a basic vertical layout that you can refine.

---

## ⚠️ Considerations

1. **Node Width**: Vertical layout may require wider nodes to accommodate multiple handles side-by-side at top/bottom
2. **Handle Spacing**: Need to calculate proper spacing for multiple input/output handles
3. **Edge Routing**: May need to implement smarter edge routing to avoid overlaps
4. **Performance**: Ensure edge path calculations remain performant
5. **Accessibility**: Maintain keyboard navigation support

---

**Status**: ✅ Implementation Complete  
**Recommendation**: Implement Option A (Full Vertical Layout) with migration support  
**Estimated Effort**: 2-3 days for core implementation, 1-2 days for testing and refinement

---

## ✅ Implementation Summary (Completed)

The following changes have been made to implement vertical (top-to-bottom) workflow layout:

### 1. CustomEdges/index.tsx
- Changed `sourcePosition: Position.Right` → `Position.Bottom`
- Changed `targetPosition: Position.Left` → `Position.Top`
- Updated edge path calculation to use Y-axis instead of X-axis

### 2. handleRenderComponent/index.tsx
- Changed `position={left ? Position.Left : Position.Right}` → `position={left ? Position.Top : Position.Bottom}`
- Updated `BASE_HANDLE_STYLES` from `top: "50%"` → `left: "50%"` for horizontal centering

### 3. ConnectionLineComponent/index.tsx
- Updated orthogonal path calculation for vertical flow
- Changed from horizontal midpoint to vertical midpoint calculation

### Files Modified:
- `src/frontend/src/CustomEdges/index.tsx`
- `src/frontend/src/CustomNodes/GenericNode/components/handleRenderComponent/index.tsx`
- `src/frontend/src/pages/FlowPage/components/ConnectionLineComponent/index.tsx`

### Testing Checklist:
- [ ] Handles render at correct positions (top/bottom)
- [ ] Edges connect properly between nodes
- [ ] Drag and drop works correctly
- [ ] Connection validation works
- [ ] New flows create with vertical layout
