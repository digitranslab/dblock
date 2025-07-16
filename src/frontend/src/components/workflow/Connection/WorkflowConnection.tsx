// WorkflowConnection - Custom Edge Component
// Provides n8n-style connection styling for workflow edges

import React from 'react';
import {
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  Edge,
  MarkerType,
} from 'reactflow';
import { X } from 'lucide-react';

export interface WorkflowConnectionData {
  label?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  onDelete?: (edgeId: string) => void;
}

export const WorkflowConnection: React.FC<EdgeProps<WorkflowConnectionData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
  style,
}) => {
  // Generate smooth step path (n8n style)
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8, // Smooth curves like n8n
  });

  // Connection styles
  const connectionStyle = {
    stroke: selected ? 'var(--color-primary)' : 'var(--color-connection-default)',
    strokeWidth: selected ? 3 : 2,
    transition: 'stroke var(--ds-duration-fast)ms var(--ds-easing-ease), stroke-width var(--ds-duration-fast)ms var(--ds-easing-ease)',
    ...style,
    ...data?.style,
  };

  // Handle delete button click
  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    data?.onDelete?.(id);
  };

  return (
    <>
      {/* Main edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={connectionStyle}
      />

      {/* Edge label and controls */}
      {(data?.label || selected) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="workflow-connection__label-container"
          >
            {/* Connection label */}
            {data?.label && (
              <div
                className="workflow-connection__label ds-text-xs ds-font-medium"
                style={{
                  backgroundColor: 'var(--color-background-base)',
                  border: '1px solid var(--color-border-base)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  padding: '2px 6px',
                  color: 'var(--color-text-base)',
                  fontSize: '11px',
                  whiteSpace: 'nowrap',
                  boxShadow: 'var(--ds-shadow-sm)',
                }}
              >
                {data.label}
              </div>
            )}

            {/* Delete button (shown when selected) */}
            {selected && data?.onDelete && (
              <button
                className="workflow-connection__delete-button"
                onClick={handleDelete}
                style={{
                  position: 'absolute',
                  top: data?.label ? '24px' : '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'var(--color-danger)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  transition: 'transform var(--ds-duration-fast)ms var(--ds-easing-ease)',
                  zIndex: 10,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
                }}
                title="Delete connection"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default WorkflowConnection; 