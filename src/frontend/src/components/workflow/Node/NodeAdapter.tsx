// NodeAdapter - Migration Bridge Component
// Provides seamless transition from GenericNode to WorkflowNode architecture

import React, { memo, useCallback, useMemo } from 'react';
import { WorkflowNode, type WorkflowNodeData, type WorkflowNodeProps } from './WorkflowNode';
import useFlowStore from '../../../stores/flowStore';

// Legacy GenericNode data structure (for reference)
interface LegacyNodeData {
  id?: string;
  type?: string;
  node?: {
    id?: string;
    type?: string;
    display_name?: string;
    description?: string;
    icon?: string;
    template?: Record<string, any>;
    data?: Record<string, any>;
    base_classes?: string[];
    documentation?: string;
    custom_fields?: Record<string, any>;
    beta?: boolean;
    error?: any;
    frozen?: boolean;
    flow?: string;
    lf_version?: string;
  };
  value?: any;
  status?: string;
  disabled?: boolean;
  selected?: boolean;
  // Additional legacy properties
  [key: string]: any;
}

// Props for the adapter component
export interface NodeAdapterProps {
  // Legacy props from GenericNode
  data: LegacyNodeData;
  selected?: boolean;
  xPos?: number;
  yPos?: number;
  id?: string;
  
  // Additional ReactFlow props
  dragging?: boolean;
  targetPosition?: any;
  sourcePosition?: any;
  
  // Event handlers (optional overrides)
  onNodeClick?: (event: React.MouseEvent, node: any) => void;
  onNodeDoubleClick?: (event: React.MouseEvent, node: any) => void;
  onNodeContextMenu?: (event: React.MouseEvent, node: any) => void;
  
  // Migration flags
  useLegacyBehavior?: boolean;
  enableNewFeatures?: boolean;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
}

// Data transformation utilities
const transformLegacyData = (legacyData: LegacyNodeData, nodeId: string): WorkflowNodeData => {
  const node = legacyData.node;
  
  return {
    id: nodeId || legacyData.id || node?.id || 'unknown',
    type: node?.type || legacyData.type || 'unknown',
    display_name: node?.display_name || node?.type || 'Node',
    description: node?.description || node?.documentation,
    icon: node?.icon,
    status: determineNodeStatus(legacyData),
    disabled: legacyData.disabled || node?.frozen || false,
    template: node?.template,
    parameters: node?.data || legacyData.value,
    // Preserve legacy data for compatibility
    node: node,
    data: legacyData,
  };
};

// Status determination logic
const determineNodeStatus = (legacyData: LegacyNodeData): 'idle' | 'running' | 'success' | 'error' | 'warning' => {
  if (legacyData.status) {
    // Map legacy status values
    switch (legacyData.status.toLowerCase()) {
      case 'building':
      case 'running':
      case 'executing':
        return 'running';
      case 'built':
      case 'success':
      case 'completed':
        return 'success';
      case 'error':
      case 'failed':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'idle';
    }
  }
  
  // Check for error indicators
  if (legacyData.node?.error || legacyData.error) {
    return 'error';
  }
  
  // Check for beta/experimental status
  if (legacyData.node?.beta) {
    return 'warning';
  }
  
  return 'idle';
};

// Main NodeAdapter component
export const NodeAdapter: React.FC<NodeAdapterProps> = memo(({
  data,
  selected = false,
  xPos = 0,
  yPos = 0,
  id,
  dragging = false,
  targetPosition,
  sourcePosition,
  onNodeClick,
  onNodeDoubleClick,
  onNodeContextMenu,
  useLegacyBehavior = false,
  enableNewFeatures = true,
  className,
  style,
}) => {
  // Get flow store for state management
  const { 
    setSelectedNodeId, 
    setParameterPanelOpen,
    deleteNode,
  } = useFlowStore();

  // Transform legacy data to new format
  const transformedData = useMemo(() => {
    const nodeId = id || data.id || data.node?.id || 'unknown';
    return transformLegacyData(data, nodeId);
  }, [data, id]);

  // Enhanced event handlers
  const handleSelect = useCallback((nodeId: string) => {
    if (useLegacyBehavior && onNodeClick) {
      // Use legacy click handler
      const mockEvent = new MouseEvent('click') as any;
      onNodeClick(mockEvent, { id: nodeId, data: transformedData });
    } else {
      // Use new behavior
      setSelectedNodeId(nodeId);
      if (enableNewFeatures) {
        setParameterPanelOpen(true);
      }
    }
  }, [useLegacyBehavior, onNodeClick, transformedData, setSelectedNodeId, setParameterPanelOpen, enableNewFeatures]);

  const handleDoubleClick = useCallback((nodeId: string) => {
    if (useLegacyBehavior && onNodeDoubleClick) {
      const mockEvent = new MouseEvent('dblclick') as any;
      onNodeDoubleClick(mockEvent, { id: nodeId, data: transformedData });
    } else {
      // Open parameter panel on double click
      setSelectedNodeId(nodeId);
      setParameterPanelOpen(true);
    }
  }, [useLegacyBehavior, onNodeDoubleClick, transformedData, setSelectedNodeId, setParameterPanelOpen]);

  const handleContextMenu = useCallback((nodeId: string, event: React.MouseEvent) => {
    if (useLegacyBehavior && onNodeContextMenu) {
      onNodeContextMenu(event, { id: nodeId, data: transformedData });
    } else {
      // Default context menu behavior
      console.log('Context menu for node:', nodeId);
    }
  }, [useLegacyBehavior, onNodeContextMenu, transformedData]);

  // Toolbar action handlers
  const handleDelete = useCallback((nodeId: string) => {
    if (enableNewFeatures) {
      deleteNode(nodeId);
    }
  }, [enableNewFeatures, deleteNode]);

  const handleDuplicate = useCallback((nodeId: string) => {
    if (enableNewFeatures) {
      // For now, just log the action - duplication logic can be implemented later
      console.log('Duplicate node:', nodeId);
    }
  }, [enableNewFeatures]);

  const handleConfigure = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setParameterPanelOpen(true);
  }, [setSelectedNodeId, setParameterPanelOpen]);

  const handleParameterChange = useCallback((nodeId: string, parameters: Record<string, any>) => {
    if (enableNewFeatures) {
      // For now, just log the change - parameter update logic can be implemented later
      console.log('Parameter change for node:', nodeId, parameters);
    }
  }, [enableNewFeatures]);

  // Prepare props for WorkflowNode
  const workflowNodeProps: WorkflowNodeProps = {
    id: transformedData.id,
    data: transformedData,
    selected,
    dragging,
    xPos,
    yPos,
    onSelect: handleSelect,
    onDoubleClick: handleDoubleClick,
    onContextMenu: handleContextMenu,
    onParameterChange: handleParameterChange,
    className: className ? `${className} node-adapter` : 'node-adapter',
    style,
  };

  // Add toolbar actions if new features are enabled
  if (enableNewFeatures) {
    workflowNodeProps.onDelete = handleDelete;
    workflowNodeProps.onDuplicate = handleDuplicate;
    workflowNodeProps.onConfigure = handleConfigure;
  }

  return <WorkflowNode {...workflowNodeProps} />;
});

NodeAdapter.displayName = 'NodeAdapter';

// Utility function to check if data is legacy format
export const isLegacyNodeData = (data: any): data is LegacyNodeData => {
  return data && typeof data === 'object' && (
    data.node !== undefined ||
    data.type !== undefined ||
    data.value !== undefined
  );
};

// Migration helper for batch node updates
export const migrateLegacyNodes = (legacyNodes: LegacyNodeData[]): WorkflowNodeData[] => {
  return legacyNodes.map((legacyData, index) => {
    const nodeId = legacyData.id || legacyData.node?.id || `migrated-${index}`;
    return transformLegacyData(legacyData, nodeId);
  });
};

// Export types for external use
export type { LegacyNodeData, WorkflowNodeData, WorkflowNodeProps };

export default NodeAdapter; 