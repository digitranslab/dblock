// PanelHeader - Parameter Panel Header Component
// Displays node information and close button in the parameter panel

import React, { memo } from 'react';
import { X, Info } from 'lucide-react';
import { useDesignValues } from '../../../design-system';
import NodeIcon from '../Node/NodeIcon';

// Mock node data interface - this should be replaced with actual node data from store
interface NodeData {
  id: string;
  type: string;
  display_name?: string;
  description?: string;
  icon?: string;
  status?: 'idle' | 'running' | 'success' | 'error' | 'warning';
  disabled?: boolean;
}

// ============================================================================
// Types
// ============================================================================

export interface PanelHeaderProps {
  node: any;
  isDirty?: boolean;
  isSaving?: boolean;
  hasErrors?: boolean;
  onClose: () => void;
}

// ============================================================================
// Panel Header Component
// ============================================================================

export const PanelHeader: React.FC<PanelHeaderProps> = memo(({
  node,
  isDirty = false,
  isSaving = false,
  hasErrors = false,
  onClose
}) => {
  // Get node information
  const nodeType = node?.type || 'Unknown';
  const displayName = node?.data?.display_name || node?.data?.name || nodeType;
  const description = node?.data?.description || node?.data?.template?.description;
  
  // Get node status
  const getStatusClass = () => {
    if (hasErrors) return 'panel-header__status--error';
    if (isSaving) return 'panel-header__status--saving';
    if (isDirty) return 'panel-header__status--modified';
    return 'panel-header__status--idle';
  };

  const getStatusText = () => {
    if (hasErrors) return 'Has Errors';
    if (isSaving) return 'Saving...';
    if (isDirty) return 'Modified';
    return 'Idle';
  };

  return (
    <div className="parameter-panel__header">
      <div className="panel-header">
        {/* Node Icon */}
        <div className="panel-header__icon">
          {node?.data?.icon ? (
            <img 
              src={node.data.icon} 
              alt={`${nodeType} icon`}
              className="panel-header__icon-image"
            />
          ) : (
            <div className="panel-header__icon-placeholder">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </div>
          )}
        </div>

        {/* Node Details */}
        <div className="panel-header__details">
          <h2 
            className="panel-header__title"
            id="parameter-panel-title"
          >
            {displayName}
          </h2>
          <p className="panel-header__type">
            {nodeType}
          </p>
          {description && (
            <p 
              className="panel-header__description"
              id="parameter-panel-description"
            >
              {description}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div className={`panel-header__status ${getStatusClass()}`}>
          {isSaving && (
            <div className="panel-header__spinner">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
            </div>
          )}
          <span className="panel-header__status-text">
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Close Button */}
      <button 
        className="panel-header__close-button"
        onClick={onClose}
        aria-label="Close parameter panel"
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
});

PanelHeader.displayName = 'PanelHeader';

export default PanelHeader; 