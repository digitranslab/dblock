import React, { memo, useState, useCallback } from 'react';
import { useNodeMigration } from '../../../hooks/useNodeMigration';

// ============================================================================
// Types
// ============================================================================

interface MigrationControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  color?: 'success' | 'warning' | 'error' | 'info';
  children?: React.ReactNode;
}

// ============================================================================
// Metric Card Component
// ============================================================================

const MetricCard: React.FC<MetricCardProps> = memo(({ 
  title, 
  value, 
  trend, 
  color = 'info',
  children 
}) => (
  <div className={`metric-card metric-card--${color}`}>
    <div className="metric-card__header">
      <h3 className="metric-card__title">{title}</h3>
      {trend && (
        <div className={`metric-card__trend metric-card__trend--${trend}`}>
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
        </div>
      )}
    </div>
    <div className="metric-card__value">{value}</div>
    {children && (
      <div className="metric-card__content">
        {children}
      </div>
    )}
  </div>
));

MetricCard.displayName = 'MetricCard';

// ============================================================================
// Migration Control Panel
// ============================================================================

export const MigrationControlPanel: React.FC<MigrationControlPanelProps> = memo(({
  isOpen,
  onClose,
  className = ''
}) => {
  const {
    config,
    migrationState,
    shouldUseMigratedNode,
    enableNodeType,
    disableNodeType,
    toggleGlobalMigration,
    rollbackNodeType,
    rollbackAll,
    getDebugInfo,
    useNewNodes,
    migratedNodeCount,
    errorCount,
    rollbackCount
  } = useNodeMigration();

  const [selectedNodeType, setSelectedNodeType] = useState<string>('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Get debug information
  const debugInfo = getDebugInfo();

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleToggleGlobal = useCallback(() => {
    toggleGlobalMigration(!useNewNodes);
  }, [toggleGlobalMigration, useNewNodes]);

  const handleEnableNodeType = useCallback(() => {
    if (selectedNodeType.trim()) {
      enableNodeType(selectedNodeType.trim());
      setSelectedNodeType('');
    }
  }, [enableNodeType, selectedNodeType]);

  const handleDisableNodeType = useCallback((nodeType: string) => {
    disableNodeType(nodeType);
  }, [disableNodeType]);

  const handleRollbackNodeType = useCallback((nodeType: string) => {
    rollbackNodeType(nodeType, 'Manual rollback from control panel');
  }, [rollbackNodeType]);

  const handleRollbackAll = useCallback(() => {
    if (window.confirm('Are you sure you want to rollback all migrations? This will disable all new components.')) {
      rollbackAll('Manual rollback all from control panel');
    }
  }, [rollbackAll]);

  // ============================================================================
  // Statistics Calculations
  // ============================================================================

  const statistics = React.useMemo(() => {
    const totalErrors = errorCount;
    const totalMigrated = migratedNodeCount;
    const totalRollbacks = rollbackCount;
    
    // Calculate error rate
    const totalOperations = debugInfo?.statistics?.totalMigratedTypes || 0;
    const errorRate = totalOperations > 0 ? (totalErrors / totalOperations * 100).toFixed(1) : '0';
    
    // Calculate average render time
    const renderTimes = debugInfo?.statistics?.averageRenderTimes || {};
    const avgRenderTime = Object.values(renderTimes).length > 0 
      ? Object.values(renderTimes).reduce((sum: number, time: unknown) => 
          sum + (typeof time === 'number' ? time : 0), 0) / Object.values(renderTimes).length
      : 0;

    return {
      totalErrors,
      totalMigrated,
      totalRollbacks,
      errorRate,
      avgRenderTime: avgRenderTime.toFixed(2)
    };
  }, [errorCount, migratedNodeCount, rollbackCount, debugInfo]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`migration-control-panel ${className}`}>
      {/* Header */}
      <div className="migration-control-panel__header">
        <h2 className="migration-control-panel__title">Migration Control Panel</h2>
        <button 
          className="migration-control-panel__close"
          onClick={onClose}
          aria-label="Close migration control panel"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Global Controls */}
      <div className="migration-control-panel__section">
        <h3 className="section-title">Global Migration Control</h3>
        <div className="global-controls">
          <div className="control-item">
            <label className="control-label">
              <input
                type="checkbox"
                checked={useNewNodes}
                onChange={handleToggleGlobal}
                className="control-checkbox"
              />
              Enable New Node Components
            </label>
          </div>
          <div className="control-item">
            <button
              className="control-button control-button--danger"
              onClick={handleRollbackAll}
              disabled={!useNewNodes}
            >
              Rollback All Migrations
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="migration-control-panel__section">
        <h3 className="section-title">Migration Statistics</h3>
        <div className="metrics-grid">
          <MetricCard
            title="Migrated Node Types"
            value={statistics.totalMigrated}
            color="success"
          />
          <MetricCard
            title="Total Errors"
            value={statistics.totalErrors}
            color={statistics.totalErrors > 0 ? 'error' : 'success'}
          />
          <MetricCard
            title="Error Rate"
            value={`${statistics.errorRate}%`}
            color={parseFloat(statistics.errorRate) > 10 ? 'error' : 'success'}
          />
          <MetricCard
            title="Rollbacks"
            value={statistics.totalRollbacks}
            color={statistics.totalRollbacks > 0 ? 'warning' : 'success'}
          />
          <MetricCard
            title="Avg Render Time"
            value={`${statistics.avgRenderTime}ms`}
            color="info"
          />
        </div>
      </div>

      {/* Node Type Management */}
      <div className="migration-control-panel__section">
        <h3 className="section-title">Node Type Management</h3>
        
        {/* Add Node Type */}
        <div className="node-type-controls">
          <div className="input-group">
            <input
              type="text"
              value={selectedNodeType}
              onChange={(e) => setSelectedNodeType(e.target.value)}
              placeholder="Enter node type to enable..."
              className="node-type-input"
            />
            <button
              onClick={handleEnableNodeType}
              disabled={!selectedNodeType.trim()}
              className="control-button control-button--primary"
            >
              Enable Node Type
            </button>
          </div>
        </div>

        {/* Enabled Node Types */}
        <div className="node-type-list">
          <h4 className="node-list-title">Enabled Node Types</h4>
          {config.enabledNodeTypes.length > 0 ? (
            <ul className="node-list">
              {config.enabledNodeTypes.map((nodeType) => (
                <li key={nodeType} className="node-list-item">
                  <span className="node-type-name">{nodeType}</span>
                  <div className="node-type-actions">
                    <button
                      onClick={() => handleRollbackNodeType(nodeType)}
                      className="node-action-button node-action-button--warning"
                      title="Rollback this node type"
                    >
                      Rollback
                    </button>
                    <button
                      onClick={() => handleDisableNodeType(nodeType)}
                      className="node-action-button node-action-button--danger"
                      title="Disable this node type"
                    >
                      Disable
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No node types explicitly enabled</p>
          )}
        </div>

        {/* Disabled Node Types */}
        {config.disabledNodeTypes.length > 0 && (
          <div className="node-type-list">
            <h4 className="node-list-title">Disabled Node Types</h4>
            <ul className="node-list">
              {config.disabledNodeTypes.map((nodeType) => (
                <li key={nodeType} className="node-list-item node-list-item--disabled">
                  <span className="node-type-name">{nodeType}</span>
                  <div className="node-type-actions">
                    <button
                      onClick={() => enableNodeType(nodeType)}
                      className="node-action-button node-action-button--success"
                      title="Re-enable this node type"
                    >
                      Enable
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recent Errors */}
      {migrationState.errors.length > 0 && (
        <div className="migration-control-panel__section">
          <h3 className="section-title">Recent Errors</h3>
          <div className="error-list">
            {migrationState.errors.slice(-5).map((error) => (
              <div key={error.id} className={`error-item error-item--${error.severity}`}>
                <div className="error-header">
                  <span className="error-node-type">{error.nodeType}</span>
                  <span className="error-timestamp">
                    {error.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="error-message">{error.error.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug Information */}
      {config.debugMode && (
        <div className="migration-control-panel__section">
          <div className="debug-section-header">
            <h3 className="section-title">Debug Information</h3>
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="control-button control-button--secondary"
            >
              {showDebugInfo ? 'Hide' : 'Show'} Debug Info
            </button>
          </div>
          
          {showDebugInfo && debugInfo && (
            <div className="debug-info">
              <pre className="debug-json">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

MigrationControlPanel.displayName = 'MigrationControlPanel'; 