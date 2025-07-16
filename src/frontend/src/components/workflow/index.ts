// Workflow Components - Main Export
// Exports all workflow-related components for the new n8n-style architecture

// Canvas Components
export { default as WorkflowCanvas, WorkflowCanvasProvider } from './Canvas/WorkflowCanvas';
export type { WorkflowCanvasProps, WorkflowCanvasProviderProps } from './Canvas/WorkflowCanvas';

export { default as CanvasBackground } from './Canvas/CanvasBackground';
export type { CanvasBackgroundProps } from './Canvas/CanvasBackground';

export { default as CanvasControls } from './Canvas/CanvasControls';
export type { CanvasControlsProps } from './Canvas/CanvasControls';

// Node Components - Phase 2 Enhanced
export { default as WorkflowNode, LegacyWorkflowNode } from './Node/WorkflowNode';
export type { WorkflowNodeData, WorkflowNodeProps, LegacyNodeProps } from './Node/WorkflowNode';

export { default as NodeAdapter } from './Node/NodeAdapter';
export type { NodeAdapterProps, LegacyNodeData } from './Node/NodeAdapter';
export { isLegacyNodeData, migrateLegacyNodes } from './Node/NodeAdapter';

export { default as NodeTypeRegistry } from './Node/NodeTypeRegistry';
export type { NodeTypeConfig } from './Node/NodeTypeRegistry';
export { 
  NODE_CATEGORIES, 
  useNodeTypeRegistry, 
  withNodeTypeRegistration, 
  createNodeTypeConfig, 
  migrateLegacyNodeType 
} from './Node/NodeTypeRegistry';

export { default as NodeRenderer } from './Node/NodeRenderer';
export type { NodeRendererProps } from './Node/NodeRenderer';

export { default as NodeToolbar } from './Node/NodeToolbar';
export type { NodeToolbarProps } from './Node/NodeToolbar';

export { default as NodeIcon } from './Node/NodeIcon';
export type { NodeIconProps } from './Node/NodeIcon';

// Connection Components
export { default as WorkflowConnection } from './Connection/WorkflowConnection';
export type { WorkflowConnectionData } from './Connection/WorkflowConnection';

export { default as ConnectionHandle } from './Connection/ConnectionHandle';
export type { ConnectionHandleProps } from './Connection/ConnectionHandle';

// Panel Components
export { default as ParameterPanel } from './Panel/ParameterPanel';
export type { ParameterPanelProps } from './Panel/ParameterPanel';

export { default as PanelHeader } from './Panel/PanelHeader';
export type { PanelHeaderProps } from './Panel/PanelHeader';

export { default as PanelContent } from './Panel/PanelContent';
export type { PanelContentProps } from './Panel/PanelContent'; 