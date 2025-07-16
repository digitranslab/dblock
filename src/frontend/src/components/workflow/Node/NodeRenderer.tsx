// NodeRenderer - Node Rendering Component
// Handles different rendering modes and states for workflow nodes

import React from 'react';
import { WorkflowNodeData } from './WorkflowNode';
import NodeIcon from './NodeIcon';
import { useDesignValues } from '../../../design-system';

export interface NodeRendererProps {
  data: WorkflowNodeData;
  selected?: boolean;
  dragging?: boolean;
  mode?: 'default' | 'compact' | 'detailed';
  className?: string;
  style?: React.CSSProperties;
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({
  data,
  selected = false,
  dragging = false,
  mode = 'default',
  className,
  style,
}) => {
  const designValues = useDesignValues();

  const {
    type,
    display_name,
    description,
    icon,
    status = 'idle',
    disabled = false,
  } = data;

  // Node display name fallback
  const nodeLabel = display_name || type || 'Node';

  // Render based on mode
  const renderContent = () => {
    switch (mode) {
      case 'compact':
        return (
          <div
            className={`node-renderer node-renderer--compact ${className || ''}`}
            style={{
              width: designValues.nodeWidth * 0.8,
              height: designValues.nodeHeight * 0.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...style,
            }}
          >
            <NodeIcon
              type={type}
              icon={icon}
              status={status}
              disabled={disabled}
              size={16}
            />
          </div>
        );

      case 'detailed':
        return (
          <div
            className={`node-renderer node-renderer--detailed ${className || ''}`}
            style={{
              width: designValues.nodeWidth * 1.2,
              height: designValues.nodeHeight * 1.2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              ...style,
            }}
          >
            <NodeIcon
              type={type}
              icon={icon}
              status={status}
              disabled={disabled}
              size={32}
            />
            <div
              className="node-renderer__label ds-text-sm ds-font-medium"
              style={{
                marginTop: '8px',
                textAlign: 'center',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {nodeLabel}
            </div>
            {description && (
              <div
                className="node-renderer__description ds-text-xs"
                style={{
                  marginTop: '4px',
                  textAlign: 'center',
                  color: 'var(--color-text-light)',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {description}
              </div>
            )}
          </div>
        );

      case 'default':
      default:
        return (
          <div
            className={`node-renderer node-renderer--default ${className || ''}`}
            style={{
              width: designValues.nodeWidth,
              height: designValues.nodeHeight,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              ...style,
            }}
          >
            <NodeIcon
              type={type}
              icon={icon}
              status={status}
              disabled={disabled}
              size={24}
            />
            <div
              className="node-renderer__label ds-text-sm ds-font-medium"
              style={{
                marginTop: '4px',
                textAlign: 'center',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: disabled ? 'var(--color-text-light)' : 'var(--color-text-base)',
              }}
            >
              {nodeLabel}
            </div>
          </div>
        );
    }
  };

  return renderContent();
};

export default NodeRenderer; 