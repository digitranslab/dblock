import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

// ============================================================================
// Types for Migration System
// ============================================================================

export interface NodeMigrationConfig {
  // Global feature flags
  enableNewNodes: boolean;
  enableNewCanvas: boolean;
  enableNewPanel: boolean;
  
  // Component-specific migration flags
  enabledNodeTypes: string[];
  disabledNodeTypes: string[];
  
  // Migration settings
  gradualMigration: boolean;
  fallbackToOld: boolean;
  debugMode: boolean;
  
  // Performance monitoring
  enablePerformanceTracking: boolean;
  maxMigrationErrors: number;
}

export interface MigrationState {
  isEnabled: boolean;
  migratedNodeTypes: Set<string>;
  errors: MigrationError[];
  performanceMetrics: PerformanceMetrics;
  lastMigrationAttempt: Date | null;
}

export interface MigrationError {
  id: string;
  nodeType: string;
  error: Error;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceMetrics {
  renderTime: Record<string, number[]>;
  errorCount: Record<string, number>;
  successCount: Record<string, number>;
  rollbackCount: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: NodeMigrationConfig = {
  enableNewNodes: false,
  enableNewCanvas: false,
  enableNewPanel: false,
  enabledNodeTypes: [],
  disabledNodeTypes: [],
  gradualMigration: true,
  fallbackToOld: true,
  debugMode: false,
  enablePerformanceTracking: true,
  maxMigrationErrors: 5,
};

const DEFAULT_STATE: MigrationState = {
  isEnabled: false,
  migratedNodeTypes: new Set(),
  errors: [],
  performanceMetrics: {
    renderTime: {},
    errorCount: {},
    successCount: {},
    rollbackCount: 0,
  },
  lastMigrationAttempt: null,
};

// ============================================================================
// Migration Hook
// ============================================================================

export const useNodeMigration = () => {
  // Persistent storage for user preferences
  const [userConfig, setUserConfig] = useLocalStorage<Partial<NodeMigrationConfig>>(
    'kozmoai-node-migration-config',
    {}
  );
  
  // Runtime state
  const [migrationState, setMigrationState] = useState<MigrationState>(DEFAULT_STATE);
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================================================
  // Configuration Management
  // ============================================================================

  const config = useMemo<NodeMigrationConfig>(() => {
    // Environment variables take precedence
    const envConfig: Partial<NodeMigrationConfig> = {
      enableNewNodes: process.env.REACT_APP_ENABLE_NEW_NODES === 'true',
      enableNewCanvas: process.env.REACT_APP_ENABLE_NEW_CANVAS === 'true',
      enableNewPanel: process.env.REACT_APP_ENABLE_NEW_PANEL === 'true',
      debugMode: process.env.NODE_ENV === 'development' || process.env.REACT_APP_MIGRATION_DEBUG === 'true',
      gradualMigration: process.env.REACT_APP_GRADUAL_MIGRATION !== 'false',
      fallbackToOld: process.env.REACT_APP_FALLBACK_TO_OLD !== 'false',
    };

    // Filter out undefined values
    const filteredEnvConfig = Object.fromEntries(
      Object.entries(envConfig).filter(([, value]) => value !== undefined)
    );

    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
      ...filteredEnvConfig,
    };
  }, [userConfig]);

  // ============================================================================
  // Migration State Management
  // ============================================================================

  const updateMigrationState = useCallback((updates: Partial<MigrationState>) => {
    setMigrationState(prev => ({
      ...prev,
      ...updates,
      lastMigrationAttempt: new Date(),
    }));
  }, []);

  const recordError = useCallback((nodeType: string, error: Error, severity: MigrationError['severity'] = 'medium') => {
    const migrationError: MigrationError = {
      id: `${nodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nodeType,
      error,
      timestamp: new Date(),
      severity,
    };

    setMigrationState(prev => {
      const newErrors = [...prev.errors, migrationError];
      
      // Keep only recent errors (last 50)
      const trimmedErrors = newErrors.slice(-50);
      
      // Update error count metrics
      const newErrorCount = {
        ...prev.performanceMetrics.errorCount,
        [nodeType]: (prev.performanceMetrics.errorCount[nodeType] || 0) + 1,
      };

      return {
        ...prev,
        errors: trimmedErrors,
        performanceMetrics: {
          ...prev.performanceMetrics,
          errorCount: newErrorCount,
        },
      };
    });

    // Log error in debug mode
    if (config.debugMode) {
      console.error(`[NodeMigration] Error in ${nodeType}:`, error);
    }
  }, [config.debugMode]);

  const recordSuccess = useCallback((nodeType: string, renderTime?: number) => {
    setMigrationState(prev => {
      const newSuccessCount = {
        ...prev.performanceMetrics.successCount,
        [nodeType]: (prev.performanceMetrics.successCount[nodeType] || 0) + 1,
      };

      const newRenderTime = renderTime ? {
        ...prev.performanceMetrics.renderTime,
        [nodeType]: [
          ...(prev.performanceMetrics.renderTime[nodeType] || []).slice(-9), // Keep last 10 measurements
          renderTime,
        ],
      } : prev.performanceMetrics.renderTime;

      return {
        ...prev,
        performanceMetrics: {
          ...prev.performanceMetrics,
          successCount: newSuccessCount,
          renderTime: newRenderTime,
        },
      };
    });
  }, []);

  // ============================================================================
  // Migration Decision Logic
  // ============================================================================

  const shouldUseMigratedNode = useCallback((nodeType: string): boolean => {
    // Global flag check
    if (!config.enableNewNodes) {
      return false;
    }

    // Check if this node type is explicitly disabled
    if (config.disabledNodeTypes.includes(nodeType)) {
      return false;
    }

    // Check if this node type is explicitly enabled
    if (config.enabledNodeTypes.length > 0 && !config.enabledNodeTypes.includes(nodeType)) {
      return false;
    }

    // Check error threshold for this node type
    const errorCount = migrationState.performanceMetrics.errorCount[nodeType] || 0;
    if (errorCount >= config.maxMigrationErrors) {
      if (config.debugMode) {
        console.warn(`[NodeMigration] Node type ${nodeType} disabled due to errors: ${errorCount}`);
      }
      return false;
    }

    // Check if node has been successfully migrated before
    if (config.gradualMigration && !migrationState.migratedNodeTypes.has(nodeType)) {
      // For gradual migration, only migrate if we've seen this node type work before
      const successCount = migrationState.performanceMetrics.successCount[nodeType] || 0;
      return successCount > 0;
    }

    return true;
  }, [config, migrationState]);

  const shouldUseMigratedCanvas = useCallback((): boolean => {
    return config.enableNewCanvas && migrationState.performanceMetrics.rollbackCount < 3;
  }, [config.enableNewCanvas, migrationState.performanceMetrics.rollbackCount]);

  const shouldUseMigratedPanel = useCallback((): boolean => {
    return config.enableNewPanel;
  }, [config.enableNewPanel]);

  // ============================================================================
  // Rollback and Recovery
  // ============================================================================

  const rollbackNodeType = useCallback((nodeType: string, reason?: string) => {
    setMigrationState(prev => {
      const newMigratedTypes = new Set(prev.migratedNodeTypes);
      newMigratedTypes.delete(nodeType);

      return {
        ...prev,
        migratedNodeTypes: newMigratedTypes,
        performanceMetrics: {
          ...prev.performanceMetrics,
          rollbackCount: prev.performanceMetrics.rollbackCount + 1,
        },
      };
    });

    // Update user config to disable this node type
    setUserConfig(prev => ({
      ...prev,
      disabledNodeTypes: [...(prev.disabledNodeTypes || []), nodeType],
    }));

    if (config.debugMode) {
      console.warn(`[NodeMigration] Rolled back node type: ${nodeType}`, { reason });
    }
  }, [config.debugMode, setUserConfig]);

  const rollbackAll = useCallback((reason?: string) => {
    setMigrationState(prev => ({
      ...prev,
      migratedNodeTypes: new Set(),
      performanceMetrics: {
        ...prev.performanceMetrics,
        rollbackCount: prev.performanceMetrics.rollbackCount + 1,
      },
    }));

    setUserConfig(prev => ({
      ...prev,
      enableNewNodes: false,
      enableNewCanvas: false,
      enableNewPanel: false,
    }));

    if (config.debugMode) {
      console.warn(`[NodeMigration] Complete rollback triggered`, { reason });
    }
  }, [config.debugMode, setUserConfig]);

  // ============================================================================
  // Configuration Updates
  // ============================================================================

  const enableNodeType = useCallback((nodeType: string) => {
    setUserConfig(prev => ({
      ...prev,
      enabledNodeTypes: [...(prev.enabledNodeTypes || []), nodeType],
      disabledNodeTypes: (prev.disabledNodeTypes || []).filter(type => type !== nodeType),
    }));

    setMigrationState(prev => ({
      ...prev,
      migratedNodeTypes: new Set([...prev.migratedNodeTypes, nodeType]),
    }));
  }, [setUserConfig]);

  const disableNodeType = useCallback((nodeType: string) => {
    setUserConfig(prev => ({
      ...prev,
      disabledNodeTypes: [...(prev.disabledNodeTypes || []), nodeType],
      enabledNodeTypes: (prev.enabledNodeTypes || []).filter(type => type !== nodeType),
    }));

    setMigrationState(prev => {
      const newMigratedTypes = new Set(prev.migratedNodeTypes);
      newMigratedTypes.delete(nodeType);
      
      return {
        ...prev,
        migratedNodeTypes: newMigratedTypes,
      };
    });
  }, [setUserConfig]);

  const toggleGlobalMigration = useCallback((enabled: boolean) => {
    setUserConfig(prev => ({
      ...prev,
      enableNewNodes: enabled,
    }));
  }, [setUserConfig]);

  // ============================================================================
  // Performance Monitoring
  // ============================================================================

  const measureRenderTime = useCallback((nodeType: string, renderFn: () => void) => {
    if (!config.enablePerformanceTracking) {
      renderFn();
      return;
    }

    const startTime = performance.now();
    try {
      renderFn();
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      recordSuccess(nodeType, renderTime);
    } catch (error) {
      recordError(nodeType, error as Error, 'high');
      throw error;
    }
  }, [config.enablePerformanceTracking, recordSuccess, recordError]);

  // ============================================================================
  // Initialization
  // ============================================================================

  useEffect(() => {
    if (!isInitialized) {
      setMigrationState(prev => ({
        ...prev,
        isEnabled: config.enableNewNodes,
      }));
      setIsInitialized(true);

      if (config.debugMode) {
        console.log('[NodeMigration] Initialized with config:', config);
      }
    }
  }, [config, isInitialized]);

  // ============================================================================
  // Debug Information
  // ============================================================================

  const getDebugInfo = useCallback(() => {
    if (!config.debugMode) {
      return null;
    }

    return {
      config,
      migrationState,
      statistics: {
        totalMigratedTypes: migrationState.migratedNodeTypes.size,
        totalErrors: migrationState.errors.length,
                 averageRenderTimes: Object.fromEntries(
           Object.entries(migrationState.performanceMetrics.renderTime).map(([nodeType, times]) => [
             nodeType,
             Array.isArray(times) ? times.reduce((sum, time) => sum + time, 0) / times.length : 0,
           ])
         ),
         errorRates: Object.fromEntries(
           Object.entries(migrationState.performanceMetrics.errorCount).map(([nodeType, errorCount]) => {
             const errors = typeof errorCount === 'number' ? errorCount : 0;
             const successes = migrationState.performanceMetrics.successCount[nodeType] || 0;
             const total = errors + successes;
             return [nodeType, total > 0 ? (errors / total) * 100 : 0];
           })
         ),
      },
    };
  }, [config, migrationState]);

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    // Configuration
    config,
    isInitialized,
    
    // Migration decisions
    shouldUseMigratedNode,
    shouldUseMigratedCanvas,
    shouldUseMigratedPanel,
    
    // State management
    migrationState,
    updateMigrationState,
    
    // Error handling
    recordError,
    recordSuccess,
    
    // Control functions
    enableNodeType,
    disableNodeType,
    toggleGlobalMigration,
    rollbackNodeType,
    rollbackAll,
    
    // Performance monitoring
    measureRenderTime,
    
    // Debug utilities
    getDebugInfo,
    
    // Computed values
    useNewNodes: config.enableNewNodes && migrationState.isEnabled,
    useNewCanvas: shouldUseMigratedCanvas(),
    useNewPanel: shouldUseMigratedPanel(),
    
    // Migration statistics
    migratedNodeCount: migrationState.migratedNodeTypes.size,
    errorCount: migrationState.errors.length,
    rollbackCount: migrationState.performanceMetrics.rollbackCount,
  };
}; 