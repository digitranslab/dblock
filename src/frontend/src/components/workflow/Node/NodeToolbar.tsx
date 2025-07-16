// NodeToolbar - Node Toolbar Component
// Displays action buttons for workflow nodes on hover/selection

import React from 'react';
import { Trash2, Copy, Settings, Play, Square } from 'lucide-react';
import { cn } from '../../../utils/utils';

export interface NodeToolbarProps {
  nodeId: string;
  visible?: boolean;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onConfigure?: (nodeId: string) => void;
  onRun?: (nodeId: string) => void;
  onStop?: (nodeId: string) => void;
  isRunning?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const NodeToolbar: React.FC<NodeToolbarProps> = ({
  nodeId,
  visible = false,
  onDelete,
  onDuplicate,
  onConfigure,
  onRun,
  onStop,
  isRunning = false,
  className,
  style,
}) => {
  // Toolbar classes
  const toolbarClasses = cn(
    'node-toolbar',
    {
      'node-toolbar--visible': visible,
    },
    className
  );

  // Handle button clicks
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(nodeId);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate?.(nodeId);
  };

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfigure?.(nodeId);
  };

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) {
      onStop?.(nodeId);
    } else {
      onRun?.(nodeId);
    }
  };

  return (
    <div
      className={toolbarClasses}
      style={{
        position: 'absolute',
        top: '-40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px',
        backgroundColor: 'var(--color-background-base)',
        border: '1px solid var(--color-border-base)',
        borderRadius: 'var(--ds-border-radius-md)',
        boxShadow: 'var(--ds-shadow-md)',
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        transition: 'opacity var(--ds-duration-fast)ms var(--ds-easing-ease), visibility var(--ds-duration-fast)ms var(--ds-easing-ease)',
        zIndex: 10,
        ...style,
      }}
    >
      {/* Configure Button */}
      {onConfigure && (
        <button
          className="node-toolbar__button"
          onClick={handleConfigure}
          title="Configure node"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            border: 'none',
            backgroundColor: 'transparent',
            borderRadius: 'var(--ds-border-radius-sm)',
            cursor: 'pointer',
            color: 'var(--color-text-base)',
            transition: 'background-color var(--ds-duration-fast)ms var(--ds-easing-ease)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-background-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Settings size={16} />
        </button>
      )}

      {/* Run/Stop Button */}
      {(onRun || onStop) && (
        <button
          className="node-toolbar__button"
          onClick={handleRun}
          title={isRunning ? 'Stop execution' : 'Run node'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            border: 'none',
            backgroundColor: 'transparent',
            borderRadius: 'var(--ds-border-radius-sm)',
            cursor: 'pointer',
            color: isRunning ? 'var(--color-danger)' : 'var(--color-success)',
            transition: 'background-color var(--ds-duration-fast)ms var(--ds-easing-ease)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-background-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {isRunning ? <Square size={16} /> : <Play size={16} />}
        </button>
      )}

      {/* Duplicate Button */}
      {onDuplicate && (
        <button
          className="node-toolbar__button"
          onClick={handleDuplicate}
          title="Duplicate node"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            border: 'none',
            backgroundColor: 'transparent',
            borderRadius: 'var(--ds-border-radius-sm)',
            cursor: 'pointer',
            color: 'var(--color-text-base)',
            transition: 'background-color var(--ds-duration-fast)ms var(--ds-easing-ease)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-background-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Copy size={16} />
        </button>
      )}

      {/* Delete Button */}
      {onDelete && (
        <button
          className="node-toolbar__button node-toolbar__button--danger"
          onClick={handleDelete}
          title="Delete node"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            border: 'none',
            backgroundColor: 'transparent',
            borderRadius: 'var(--ds-border-radius-sm)',
            cursor: 'pointer',
            color: 'var(--color-danger)',
            transition: 'background-color var(--ds-duration-fast)ms var(--ds-easing-ease)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-danger-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export default NodeToolbar; 