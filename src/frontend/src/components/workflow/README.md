# Workflow Components

This directory contains the new n8n-style workflow components for KozmoAI, implementing a modern, minimalistic design system for workflow creation and editing.

## Architecture Overview

The workflow system is organized into four main component categories:

```
src/components/workflow/
├── Canvas/          # Canvas container and controls
├── Node/            # Node rendering and interactions
├── Connection/      # Edge/connection components
├── Panel/           # Parameter editing panel
└── examples/        # Usage examples
```

## Design System Integration

All components use the design system from `src/design-system/`:

- **Design Tokens**: Consistent spacing, colors, and typography
- **Utility Functions**: Helper functions for styling and classes
- **CSS Variables**: Theme-aware styling with CSS custom properties
- **Responsive Design**: Adaptive layouts for different screen sizes

## Component Categories

### Canvas Components

#### WorkflowCanvas
Main container component that orchestrates the entire workflow interface.

```tsx
import { WorkflowCanvas } from '@/components/workflow';

<WorkflowCanvas
  nodes={nodes}
  edges={edges}
  onNodeClick={handleNodeClick}
  selectedNodeId={selectedNodeId}
  parameterPanelOpen={parameterPanelOpen}
  onParameterPanelClose={handleClose}
  showMiniMap={true}
  showControls={true}
  showBackground={true}
/>
```

#### CanvasBackground
Provides the grid background pattern for the workflow canvas.

#### CanvasControls
Zoom and navigation controls for the canvas.

### Node Components

#### WorkflowNode
Main node component implementing n8n-style minimalistic design:
- **Size**: 140px × 80px (configurable via design system)
- **Layout**: Vertical icon + label layout
- **Status**: Visual status indicators (idle, running, success, error, warning)
- **Interactions**: Click, hover, and selection states

```tsx
// Node data structure
interface WorkflowNodeData {
  id: string;
  type: string;
  display_name?: string;
  description?: string;
  icon?: string;
  status?: 'idle' | 'running' | 'success' | 'error' | 'warning';
  disabled?: boolean;
  template?: Record<string, any>;
  parameters?: Record<string, any>;
}
```

#### NodeIcon
Intelligent icon component with:
- **Type-based Icons**: Automatic icon selection based on node type
- **Status Colors**: Color-coded status indicators
- **Custom Icons**: Support for custom icon strings
- **Animations**: Pulse animation for running state

#### NodeToolbar
Contextual toolbar that appears on node hover/selection:
- **Actions**: Configure, Run/Stop, Duplicate, Delete
- **Positioning**: Automatically positioned above nodes
- **Styling**: n8n-inspired button design

#### NodeRenderer
Flexible renderer supporting multiple display modes:
- **Default**: Standard 140×80 layout
- **Compact**: Smaller icon-only version
- **Detailed**: Expanded version with description

### Connection Components

#### WorkflowConnection
Custom edge component with n8n-style smooth curves:
- **Smooth Paths**: Bezier curves with configurable border radius
- **Labels**: Optional connection labels
- **Delete Button**: Contextual delete button when selected
- **Animation**: Support for animated connections

#### ConnectionHandle
Enhanced connection points with:
- **Visual Feedback**: Hover effects and connection states
- **Connection Count**: Badge showing number of connections
- **Labels**: Optional handle labels
- **Validation**: Visual feedback for valid/invalid connections

### Panel Components

#### ParameterPanel
Side panel for node configuration:
- **Width**: 480px (configurable via design system)
- **Animation**: Smooth slide-in from right
- **Backdrop**: Blur overlay with click-to-close
- **Keyboard**: ESC key support

#### PanelHeader
Panel header with node information:
- **Node Info**: Icon, name, type, and status
- **Status Badge**: Color-coded status indicator
- **Close Button**: Consistent close button styling

#### PanelContent
Parameter editing interface:
- **Form Fields**: Support for string, number, boolean, select, textarea
- **Validation**: Visual feedback for required fields
- **Actions**: Save and Reset buttons
- **Responsive**: Scrollable content area

## Usage Examples

### Basic Workflow Canvas

```tsx
import React, { useState } from 'react';
import { WorkflowCanvas } from '@/components/workflow';
import type { Node, Edge } from 'reactflow';

const MyWorkflow: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const handleNodeClick = (event: any, node: any) => {
    setSelectedNodeId(node.id);
    setPanelOpen(true);
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <WorkflowCanvas
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        selectedNodeId={selectedNodeId}
        parameterPanelOpen={panelOpen}
        onParameterPanelClose={() => setPanelOpen(false)}
      />
    </div>
  );
};
```

### Custom Node Types

```tsx
import { WorkflowNode } from '@/components/workflow';

// Create custom node data
const customNodeData: WorkflowNodeData = {
  id: 'custom-1',
  type: 'custom',
  display_name: 'My Custom Node',
  description: 'A custom node implementation',
  icon: 'custom-icon',
  status: 'idle',
  parameters: {
    setting1: 'value1',
    setting2: 42,
  },
};

// Register with ReactFlow
const nodeTypes = {
  workflowNode: WorkflowNode,
  customNode: MyCustomNode,
};
```

### Parameter Panel Integration

```tsx
import { ParameterPanel } from '@/components/workflow';

const MyComponent: React.FC = () => {
  const handleParameterSave = (nodeId: string, parameters: Record<string, unknown>) => {
    // Update node parameters
    console.log('Saving parameters for node:', nodeId, parameters);
  };

  return (
    <ParameterPanel
      isOpen={panelOpen}
      nodeId={selectedNodeId}
      onClose={() => setPanelOpen(false)}
      onSave={handleParameterSave}
    />
  );
};
```

## Styling and Theming

### Design System Classes

Components use design system classes for consistent styling:

```tsx
// Typography
className="ds-text-sm ds-font-medium"

// Spacing
className="ds-p-4 ds-m-2"

// Colors
style={{ color: 'var(--color-text-base)' }}

// Borders
className="ds-border ds-border-radius-md"
```

### CSS Variables

Key CSS variables used throughout:

```css
/* Node dimensions */
--ds-node-width: 140px;
--ds-node-height: 80px;

/* Panel dimensions */
--ds-panel-width: 480px;

/* Grid and spacing */
--ds-grid-size: 20px;
--ds-spacing-md: 16px;

/* Animation */
--ds-duration-fast: 150ms;
--ds-duration-normal: 300ms;
--ds-easing-expo: cubic-bezier(0.19, 1, 0.22, 1);
```

### Custom Styling

Components accept `className` and `style` props for customization:

```tsx
<WorkflowNode
  className="my-custom-node"
  style={{ borderColor: 'red' }}
  data={nodeData}
/>
```

## Performance Considerations

- **Memoization**: Components use `React.memo` for performance
- **Lazy Loading**: Large workflows can implement virtualization
- **Event Handling**: Debounced parameter updates
- **ReactFlow**: Leverages ReactFlow's built-in optimizations

## Migration Guide

### From GenericNode to WorkflowNode

```tsx
// Old
<GenericNode
  data={nodeData}
  selected={selected}
  xPos={xPos}
  yPos={yPos}
/>

// New
<WorkflowNode
  id={id}
  data={nodeData}
  selected={selected}
  xPos={xPos}
  yPos={yPos}
/>
```

### From EditNodeModal to ParameterPanel

```tsx
// Old
<EditNodeModal
  isOpen={isOpen}
  onClose={onClose}
  nodeData={nodeData}
/>

// New
<ParameterPanel
  isOpen={isOpen}
  nodeId={nodeId}
  onClose={onClose}
  onSave={onSave}
/>
```

## Future Enhancements

1. **Drag & Drop**: Component palette with drag-and-drop support
2. **Minimap**: Enhanced minimap with custom node rendering
3. **Keyboard Shortcuts**: Comprehensive keyboard navigation
4. **Accessibility**: ARIA labels and keyboard navigation
5. **Themes**: Multiple color themes and customization options
6. **Performance**: Virtual scrolling for large workflows
7. **Collaboration**: Real-time collaborative editing
8. **Export**: Export workflows as images or code

## Contributing

When adding new components:

1. Follow the existing directory structure
2. Use the design system for consistent styling
3. Include TypeScript interfaces for all props
4. Add comprehensive JSDoc comments
5. Create usage examples
6. Update this README with new components

## Testing

Components should be tested with:

- **Unit Tests**: Component rendering and behavior
- **Integration Tests**: Component interactions
- **Visual Tests**: Screenshot comparisons
- **Accessibility Tests**: ARIA compliance and keyboard navigation 