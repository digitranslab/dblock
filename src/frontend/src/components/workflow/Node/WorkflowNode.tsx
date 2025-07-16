// WorkflowNode - Enhanced Node Component for Phase 2 Migration
// Implements the new n8n-style node architecture with improved event handling

import React, { memo, useCallback, useMemo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { useDesignClasses, useInlineStyles, COMMON_VALUES } from '../../../design-system';
import { cn } from '../../../utils/utils';
import NodeIcon from './NodeIcon';
import NodeToolbar from './NodeToolbar';

// Enhanced Node data interface for Phase 2
export interface WorkflowNodeData {
  id: string;
  type: string;
  display_name?: string;
  description?: string;
  icon?: string;
  status?: 'idle' | 'running' | 'success' | 'error' | 'warning';
  disabled?: boolean;
  template?: Record<string, any>;
  parameters?: Record<string, any>;
  // Additional KozmoAI-specific properties
  node?: any;
  // Legacy compatibility
  data?: any;
}

// Enhanced props interface for Phase 2 migration
export interface WorkflowNodeProps {
  id: string;
  data: WorkflowNodeData;
  position?: { x: number; y: number };
  selected?: boolean;
  disabled?: boolean;
  status?: 'idle' | 'running' | 'success' | 'error' | 'warning';
  dragging?: boolean;
  xPos?: number;
  yPos?: number;
  // Enhanced event handlers
  onSelect?: (id: string) => void;
  onDoubleClick?: (id: string) => void;
  onContextMenu?: (id: string, event: React.MouseEvent) => void;
  onParameterChange?: (id: string, parameters: Record<string, any>) => void;
  onStatusChange?: (id: string, status: string) => void;
  // Toolbar actions
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onConfigure?: (id: string) => void;
  onRun?: (id: string) => void;
  onStop?: (id: string) => void;
  // Additional props
  className?: string;
  style?: React.CSSProperties;
}

// Main WorkflowNode component with enhanced architecture
export const WorkflowNode: React.FC<WorkflowNodeProps> = memo(({
  id,
  data,
  position,
  selected = false,
  disabled = false,
  status,
  dragging = false,
  onSelect,
  onDoubleClick,
  onContextMenu,
  onParameterChange,
  onStatusChange,
  onDelete,
  onDuplicate,
  onConfigure,
  onRun,
  onStop,
  className,
  style,
  // ReactFlow props
  xPos,
  yPos,
  ...reactFlowProps
}) => {
  const classes = useDesignClasses();
  const styles = useInlineStyles();

  // Extract node properties with fallbacks
  const {
    type,
    display_name,
    description,
    icon,
    template,
    parameters,
    node: legacyNode,
    data: legacyData,
  } = data;

  // Determine node status (props override data)
  const nodeStatus = status || data.status || 'idle';
  const nodeDisabled = disabled || data.disabled || false;
  const nodeLabel = display_name || type || 'Node';

  // Handle node selection
  const handleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (!nodeDisabled && onSelect) {
      onSelect(id);
    }
  }, [id, nodeDisabled, onSelect]);

  // Handle double click for configuration
  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (!nodeDisabled) {
      if (onDoubleClick) {
        onDoubleClick(id);
      } else if (onConfigure) {
        // Fallback to configure if no double click handler
        onConfigure(id);
      }
    }
  }, [id, nodeDisabled, onDoubleClick, onConfigure]);

  // Handle context menu
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!nodeDisabled && onContextMenu) {
      onContextMenu(id, event);
    }
  }, [id, nodeDisabled, onContextMenu]);

  // Node classes with enhanced styling
  const nodeClasses = cn(
    'workflow-node',
    `workflow-node--${nodeStatus}`,
    classes.node(nodeStatus, selected, nodeDisabled),
    'ds-node',
    {
      'workflow-node--selected': selected,
      'workflow-node--disabled': nodeDisabled,
      'workflow-node--dragging': dragging,
    },
    className
  );

  // Memoized node dimensions
  const nodeDimensions = useMemo(() => ({
    width: COMMON_VALUES.NODE_WIDTH,
    height: COMMON_VALUES.NODE_HEIGHT,
  }), []);

  // Toolbar visibility logic
  const showToolbar = selected || (!nodeDisabled && (onDelete || onDuplicate || onConfigure || onRun || onStop));

  return (
    <div className={nodeClasses} style={style}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="workflow-node__handle workflow-node__handle--input"
        style={{
          background: 'var(--color-connection-handle)',
          border: '2px solid var(--color-background-base)',
          width: '8px',
          height: '8px',
          left: '-4px',
        }}
        isConnectable={!nodeDisabled}
      />

      {/* Node Content */}
      <div
        className="workflow-node__content"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        style={{
          width: nodeDimensions.width,
          height: nodeDimensions.height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          cursor: nodeDisabled ? 'not-allowed' : 'pointer',
          backgroundColor: selected 
            ? 'var(--color-node-selected-background)' 
            : 'var(--color-node-background)',
          border: `2px solid ${
            selected 
              ? 'var(--color-primary)' 
              : nodeStatus === 'error' 
                ? 'var(--color-danger)' 
                : nodeStatus === 'success' 
                  ? 'var(--color-success)' 
                  : nodeStatus === 'warning' 
                    ? 'var(--color-warning)' 
                    : nodeStatus === 'running' 
                      ? 'var(--color-primary)' 
                      : 'var(--color-border-base)'
          }`,
          borderRadius: 'var(--ds-border-radius-lg)',
          boxShadow: selected 
            ? 'var(--ds-shadow-lg)' 
            : dragging 
              ? 'var(--ds-shadow-xl)' 
              : 'var(--ds-shadow-sm)',
          transition: 'all var(--ds-duration-fast)ms var(--ds-easing-ease)',
          opacity: nodeDisabled ? 0.6 : 1,
        }}
      >
        {/* Node Icon */}
        <NodeIcon
          type={type}
          icon={icon}
          status={nodeStatus}
          disabled={nodeDisabled}
          size={24}
          style={{
            marginBottom: '4px',
          }}
        />

        {/* Node Label */}
        <div
          className="workflow-node__label ds-text-sm ds-font-medium"
          style={{
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            color: nodeDisabled 
              ? 'var(--color-text-light)' 
              : selected 
                ? 'var(--color-primary)' 
                : 'var(--color-text-base)',
            transition: 'color var(--ds-duration-fast)ms var(--ds-easing-ease)',
          }}
          title={nodeLabel}
        >
          {nodeLabel}
        </div>

        {/* Status Indicator */}
        {nodeStatus === 'running' && (
          <div
            className="workflow-node__status-indicator"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--color-primary)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
            }}
          />
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="workflow-node__handle workflow-node__handle--output"
        style={{
          background: 'var(--color-connection-handle)',
          border: '2px solid var(--color-background-base)',
          width: '8px',
          height: '8px',
          right: '-4px',
        }}
        isConnectable={!nodeDisabled}
      />

      {/* Node Toolbar */}
      {showToolbar && (
        <NodeToolbar
          nodeId={id}
          visible={selected}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onConfigure={onConfigure}
          onRun={onRun}
          onStop={onStop}
          isRunning={nodeStatus === 'running'}
        />
      )}
    </div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';

// Legacy compatibility wrapper for existing GenericNode usage
export interface LegacyNodeProps {
  data: any;
  selected?: boolean;
  xPos?: number;
  yPos?: number;
  id?: string;
  [key: string]: any;
}

export const LegacyWorkflowNode: React.FC<LegacyNodeProps> = memo((props) => {
  const { data, selected, xPos, yPos, id, ...rest } = props;
  
  // Transform legacy data to new format
  const transformedData: WorkflowNodeData = {
    id: id || data?.id || 'unknown',
    type: data?.type || data?.node?.type || 'unknown',
    display_name: data?.node?.display_name || data?.display_name || data?.type,
    description: data?.node?.description || data?.description,
    icon: data?.node?.icon || data?.icon,
    status: data?.status || 'idle',
    disabled: data?.disabled || false,
    template: data?.node?.template || data?.template,
    parameters: data?.node?.data || data?.parameters,
    node: data?.node,
    data: data,
  };

  return (
    <WorkflowNode
      id={transformedData.id}
      data={transformedData}
      selected={selected}
      xPos={xPos}
      yPos={yPos}
      {...rest}
    />
  );
});

LegacyWorkflowNode.displayName = 'LegacyWorkflowNode';

export default WorkflowNode; 