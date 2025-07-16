import React, { memo, useCallback, useMemo } from 'react';
import { NodeProps } from 'reactflow';
import { useNodeMigration } from '../../../hooks/useNodeMigration';
import { WorkflowNode } from './WorkflowNode';
import { GenericNode } from '../../CustomNodes/GenericNode';
import { ErrorBoundary } from '../../common/ErrorBoundary';

// ============================================================================
// Types
// ============================================================================

interface MigrationAwareNodeRendererProps extends NodeProps {
  nodeType: string;
  fallbackComponent?: React.ComponentType<NodeProps>;
}

interface ErrorFallbackProps {
  error: Error;
  nodeType: string;
  onRetry: () => void;
  onRollback: () => void;
}

// ============================================================================
// Error Fallback Component
// ============================================================================

const ErrorFallback: React.FC<ErrorFallbackProps> = memo(({ 
  error, 
  nodeType, 
  onRetry, 
  onRollback 
}) => (
  <div className="workflow-node workflow-node--error">
    <div className="workflow-node__content">
      <div className="workflow-node__icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div className="workflow-node__label">
        {nodeType} Error
      </div>
    </div>
    
    <div className="workflow-node__error-actions">
      <button 
        onClick={onRetry}
        className="error-action-button error-action-button--retry"
        title="Retry with new component"
      >
        Retry
      </button>
      <button 
        onClick={onRollback}
        className="error-action-button error-action-button--rollback"
        title="Use old component"
      >
        Fallback
      </button>
    </div>
  </div>
));

ErrorFallback.displayName = 'ErrorFallback';

// ============================================================================
// Migration Aware Node Renderer
// ============================================================================

export const MigrationAwareNodeRenderer: React.FC<MigrationAwareNodeRendererProps> = memo(({
  nodeType,
  fallbackComponent: FallbackComponent = GenericNode,
  ...nodeProps
}) => {
  const {
    shouldUseMigratedNode,
    recordError,
    recordSuccess,
    rollbackNodeType,
    measureRenderTime,
    config
  } = useNodeMigration();

  // Determine which component to use
  const shouldUseMigrated = useMemo(() => 
    shouldUseMigratedNode(nodeType), 
    [shouldUseMigratedNode, nodeType]
  );

  // Error handling callbacks
  const handleError = useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.error(`[MigrationAwareNodeRenderer] Error in ${nodeType}:`, error, errorInfo);
    recordError(nodeType, error, 'high');
  }, [nodeType, recordError]);

  const handleRetry = useCallback(() => {
    // Force re-render by updating a key or state
    window.location.reload(); // Simple approach for now
  }, []);

  const handleRollback = useCallback(() => {
    rollbackNodeType(nodeType, 'User triggered rollback from error state');
  }, [rollbackNodeType, nodeType]);

  const handleSuccess = useCallback(() => {
    recordSuccess(nodeType);
  }, [recordSuccess, nodeType]);

  // Render function with performance measurement
  const renderWithMeasurement = useCallback((renderFn: () => React.ReactElement) => {
    if (!config.enablePerformanceTracking) {
      return renderFn();
    }

    let result: React.ReactElement;
    measureRenderTime(nodeType, () => {
      result = renderFn();
    });
    return result!;
  }, [config.enablePerformanceTracking, measureRenderTime, nodeType]);

  // Main render logic
  const renderNode = useCallback(() => {
    if (shouldUseMigrated) {
      // Use new WorkflowNode component
      return renderWithMeasurement(() => {
        const result = <WorkflowNode {...nodeProps} onRenderSuccess={handleSuccess} />;
        handleSuccess(); // Record successful render
        return result;
      });
    } else {
      // Use fallback component (old GenericNode)
      return renderWithMeasurement(() => {
        const result = <FallbackComponent {...nodeProps} />;
        recordSuccess(`${nodeType}-fallback`);
        return result;
      });
    }
  }, [
    shouldUseMigrated,
    renderWithMeasurement,
    nodeProps,
    handleSuccess,
    FallbackComponent,
    recordSuccess,
    nodeType
  ]);

  // Error boundary configuration
  const errorBoundaryProps = useMemo(() => ({
    onError: handleError,
    fallback: ({ error }: { error: Error }) => (
      <ErrorFallback
        error={error}
        nodeType={nodeType}
        onRetry={handleRetry}
        onRollback={handleRollback}
      />
    ),
  }), [handleError, nodeType, handleRetry, handleRollback]);

  // Debug logging
  if (config.debugMode) {
    console.log(`[MigrationAwareNodeRenderer] Rendering ${nodeType} with ${shouldUseMigrated ? 'new' : 'old'} component`);
  }

  return (
    <ErrorBoundary {...errorBoundaryProps}>
      {renderNode()}
    </ErrorBoundary>
  );
});

MigrationAwareNodeRenderer.displayName = 'MigrationAwareNodeRenderer';

// ============================================================================
// HOC for easy migration wrapping
// ============================================================================

export const withMigrationAwareness = <P extends NodeProps>(
  Component: React.ComponentType<P>,
  nodeType: string,
  fallbackComponent?: React.ComponentType<NodeProps>
) => {
  const WrappedComponent = memo((props: P) => (
    <MigrationAwareNodeRenderer
      {...props}
      nodeType={nodeType}
      fallbackComponent={fallbackComponent}
    />
  ));
  
  WrappedComponent.displayName = `WithMigrationAwareness(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// ============================================================================
// Utility function to create migrated node types
// ============================================================================

export const createMigratedNodeType = (
  nodeType: string,
  fallbackComponent?: React.ComponentType<NodeProps>
) => {
  return (props: NodeProps) => (
    <MigrationAwareNodeRenderer
      {...props}
      nodeType={nodeType}
      fallbackComponent={fallbackComponent}
    />
  );
}; 