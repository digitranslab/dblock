// ConnectionHandle - Custom Connection Handle Component
// Provides custom styling for node connection points

import React from 'react';
import { Handle, Position, type HandleProps } from 'reactflow';
import { cn } from '../../../utils/utils';

export interface ConnectionHandleProps extends Omit<HandleProps, 'type' | 'position'> {
  type: 'source' | 'target';
  position: Position;
  connectionCount?: number;
  isConnecting?: boolean;
  isValid?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ConnectionHandle: React.FC<ConnectionHandleProps> = ({
  type,
  position,
  connectionCount = 0,
  isConnecting = false,
  isValid = true,
  label,
  className,
  style,
  ...props
}) => {
  // Handle classes
  const handleClasses = cn(
    'connection-handle',
    `connection-handle--${type}`,
    `connection-handle--${position}`,
    {
      'connection-handle--connecting': isConnecting,
      'connection-handle--connected': connectionCount > 0,
      'connection-handle--invalid': !isValid,
    },
    className
  );

  // Handle styles
  const handleStyles: React.CSSProperties = {
    background: isConnecting 
      ? 'var(--color-primary)' 
      : connectionCount > 0 
        ? 'var(--color-success)' 
        : 'var(--color-connection-handle)',
    border: '2px solid var(--color-background-base)',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'all var(--ds-duration-fast)ms var(--ds-easing-ease)',
    zIndex: 1,
    ...style,
  };

  // Handle hover styles
  const handleHoverStyles = {
    transform: 'scale(1.2)',
    boxShadow: '0 0 0 2px var(--color-primary-transparent)',
  };

  return (
    <div className="connection-handle-wrapper" style={{ position: 'relative' }}>
      <Handle
        type={type}
        position={position}
        className={handleClasses}
        style={handleStyles}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, handleHoverStyles);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      />
      
      {/* Handle label */}
      {label && (
        <div
          className="connection-handle__label ds-text-xs"
          style={{
            position: 'absolute',
            ...(position === Position.Left && {
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }),
            ...(position === Position.Right && {
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }),
            ...(position === Position.Top && {
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
            }),
            ...(position === Position.Bottom && {
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
            }),
            backgroundColor: 'var(--color-background-base)',
            border: '1px solid var(--color-border-base)',
            borderRadius: 'var(--ds-border-radius-sm)',
            padding: '2px 4px',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            color: 'var(--color-text-light)',
            pointerEvents: 'none',
            opacity: isConnecting ? 1 : 0,
            transition: 'opacity var(--ds-duration-fast)ms var(--ds-easing-ease)',
          }}
        >
          {label}
        </div>
      )}

      {/* Connection count indicator */}
      {connectionCount > 1 && (
        <div
          className="connection-handle__count ds-text-xs"
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            fontWeight: 600,
            border: '1px solid var(--color-background-base)',
          }}
        >
          {connectionCount}
        </div>
      )}
    </div>
  );
};

export default ConnectionHandle; 