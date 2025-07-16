// ParameterPanel - Enhanced Parameter Panel Component
// Provides n8n-style parameter editing panel for workflow nodes

import React, { memo, useCallback, useState, useEffect, useMemo } from 'react';
import useFlowStore from '../../../stores/flowStore';
import { useNodeMigration } from '../../../hooks/useNodeMigration';
import { PanelHeader } from './PanelHeader';
import { PanelContent } from './PanelContent';
import { PanelFooter } from './PanelFooter';
import './ParameterPanel.scss';

// ============================================================================
// Types
// ============================================================================

export interface ParameterPanelProps {
  isOpen: boolean;
  nodeId: string | null;
  onClose: () => void;
  onSave?: (nodeId: string, parameters: Record<string, unknown>) => void;
  className?: string;
}

interface PanelState {
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  parameters: Record<string, unknown>;
}

// ============================================================================
// Enhanced Parameter Panel Component (with Step 3.2 Integration)
// ============================================================================

export const ParameterPanel: React.FC<ParameterPanelProps> = memo(({
  isOpen,
  nodeId,
  onClose,
  onSave,
  className = ''
}) => {
  // Migration hook for conditional rendering
  const { shouldUseMigratedPanel, recordError, recordSuccess } = useNodeMigration();
  
  // Flow store integration
  const node = useFlowStore(state => 
    state.nodes.find(n => n.id === nodeId)
  );
  
  const setNode = useFlowStore(state => state.setNode);
  const selectedNodeId = useFlowStore(state => state.selectedNodeId);
  const setSelectedNodeId = useFlowStore(state => state.setSelectedNodeId);
  
  // Local state management for panel-level features
  const [panelState, setPanelState] = useState<PanelState>({
    isDirty: false,
    isLoading: false,
    isSaving: false,
    errors: {},
    parameters: {}
  });

  // ============================================================================
  // State Synchronization with Step 3.2 PanelContent
  // ============================================================================

  // Handle parameters changes from Step 3.2 PanelContent
  const handleParametersChange = useCallback((parameters: Record<string, unknown>) => {
    setPanelState(prev => ({
      ...prev,
      parameters,
      isDirty: JSON.stringify(parameters) !== JSON.stringify(node?.data || {})
    }));
  }, [node?.data]);

  // Handle errors changes from Step 3.2 PanelContent
  const handleErrorsChange = useCallback((errors: Record<string, string>) => {
    setPanelState(prev => ({
      ...prev,
      errors
    }));
  }, []);

  // Auto-select node when panel opens
  useEffect(() => {
    if (isOpen && nodeId && selectedNodeId !== nodeId) {
      setSelectedNodeId(nodeId);
    }
  }, [isOpen, nodeId, selectedNodeId, setSelectedNodeId]);

  // Initialize parameters when node changes
  useEffect(() => {
    if (node?.data) {
      setPanelState(prev => ({
        ...prev,
        parameters: { ...node.data },
        isDirty: false,
        errors: {}
      }));
    }
  }, [node?.data, nodeId]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleClose = useCallback(() => {
    try {
      // Check for unsaved changes
      if (panelState.isDirty) {
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to close without saving?'
        );
        if (!confirmed) return;
      }

      // Clear selection and close
      setSelectedNodeId(null);
      onClose();
      
      // Reset local state
      setPanelState(prev => ({
        ...prev,
        isDirty: false,
        errors: {},
        parameters: node?.data || {}
      }));

      recordSuccess('ParameterPanel-close');
    } catch (error) {
      recordError('ParameterPanel', error as Error, 'medium');
    }
  }, [panelState.isDirty, onClose, setSelectedNodeId, node?.data, recordSuccess, recordError]);

  const handleSave = useCallback(async () => {
    if (!node || !nodeId) return;

    try {
      setPanelState(prev => ({ ...prev, isSaving: true }));

      // Check for validation errors
      if (Object.keys(panelState.errors).length > 0) {
        setPanelState(prev => ({ ...prev, isSaving: false }));
        return;
      }

      // Update node data in store
      setNode(nodeId, (oldNode) => ({
        ...oldNode,
        data: {
          ...oldNode.data,
          ...panelState.parameters
        }
      }));

      // Call external save handler if provided
      if (onSave) {
        await onSave(nodeId, panelState.parameters);
      }

      // Update state
      setPanelState(prev => ({
        ...prev,
        isDirty: false,
        isSaving: false
      }));

      recordSuccess('ParameterPanel-save');
    } catch (error) {
      console.error('Error saving parameters:', error);
      setPanelState(prev => ({
        ...prev,
        isSaving: false
      }));
      recordError('ParameterPanel', error as Error, 'high');
    }
  }, [node, nodeId, panelState.parameters, panelState.errors, setNode, onSave, recordSuccess, recordError]);

  const handleReset = useCallback(() => {
    if (!node) return;

    const confirmed = window.confirm(
      'Are you sure you want to reset all parameters to their original values?'
    );

    if (confirmed) {
      setPanelState(prev => ({
        ...prev,
        parameters: { ...node.data },
        isDirty: false,
        errors: {}
      }));
    }
  }, [node]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (event.key === 'Escape') {
      event.preventDefault();
      handleClose();
    } else if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSave();
    }
  }, [handleClose, handleSave]);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const panelData = useMemo(() => {
    if (!node) return null;

    // Convert node data to Step 3.2 NodeData format
    const nodeData = {
      id: node.id,
      type: node.type || 'unknown',
      display_name: node.data?.display_name || node.data?.name || node.type,
      description: node.data?.description || node.data?.template?.description,
      template: node.data?.template || {},
      parameters: panelState.parameters
    };

    return {
      node: nodeData,
      isDirty: panelState.isDirty,
      isLoading: panelState.isLoading,
      isSaving: panelState.isSaving,
      errors: panelState.errors,
      hasErrors: Object.keys(panelState.errors).length > 0
    };
  }, [node, panelState]);

  // ============================================================================
  // Migration Check
  // ============================================================================

  // Use migration system to determine if we should use the new panel
  if (!shouldUseMigratedPanel()) {
    // Return null or legacy panel component
    return null;
  }

  // ============================================================================
  // Render Guards
  // ============================================================================

  if (!isOpen || !node || !panelData) {
    return null;
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`parameter-panel__backdrop ${isOpen ? 'parameter-panel__backdrop--visible' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel Container */}
      <div 
        className={`parameter-panel ${isOpen ? 'parameter-panel--open' : ''} ${className}`}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="parameter-panel-title"
        aria-describedby="parameter-panel-description"
      >
        {/* Header */}
        <PanelHeader
          node={node}
          isDirty={panelData.isDirty}
          isSaving={panelData.isSaving}
          hasErrors={panelData.hasErrors}
          onClose={handleClose}
        />

        {/* Content - Step 3.2 Architecture */}
        <div className="parameter-panel__content">
          <PanelContent
            node={panelData.node}
            onParametersChange={handleParametersChange}
            onErrorsChange={handleErrorsChange}
          />
        </div>

        {/* Footer */}
        <PanelFooter
          isDirty={panelData.isDirty}
          isSaving={panelData.isSaving}
          hasErrors={panelData.hasErrors}
          onSave={handleSave}
          onReset={handleReset}
          onClose={handleClose}
        />
      </div>
    </>
  );
});

ParameterPanel.displayName = 'ParameterPanel';

// ============================================================================
// Default Export
// ============================================================================

export default ParameterPanel; 