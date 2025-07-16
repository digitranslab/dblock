// ============================================================================
// Feature Flags System - Step 5.1
// Controlled rollout and testing system for n8n-inspired design features
// ============================================================================

import { useCallback, useMemo } from 'react';
import { useUtilityStore } from '../stores/utilityStore';

// ============================================================================
// Feature Flag Definitions
// ============================================================================

export const FEATURE_FLAGS = {
  // Core Design System Migration
  NEW_WORKFLOW_DESIGN: 'new-workflow-design',
  ENHANCED_PARAMETER_PANEL: 'enhanced-parameter-panel',
  MINIMALIST_NODES: 'minimalist-nodes',
  
  // Layout System Features
  ENHANCED_CANVAS_BACKGROUND: 'enhanced-canvas-background',
  ADVANCED_CANVAS_CONTROLS: 'advanced-canvas-controls',
  WORKFLOW_ZONES: 'workflow-zones',
  LAYOUT_AUTO_ARRANGE: 'layout-auto-arrange',
  
  // Visual Enhancements
  N8N_VISUAL_THEME: 'n8n-visual-theme',
  ENHANCED_ANIMATIONS: 'enhanced-animations',
  IMPROVED_TYPOGRAPHY: 'improved-typography',
  DARK_MODE_ENHANCEMENTS: 'dark-mode-enhancements',
  
  // Component Features
  ENHANCED_NODE_TOOLBAR: 'enhanced-node-toolbar',
  SMART_CONNECTION_SYSTEM: 'smart-connection-system',
  CONTEXTUAL_MENUS: 'contextual-menus',
  KEYBOARD_SHORTCUTS_V2: 'keyboard-shortcuts-v2',
  
  // Performance Features
  OPTIMIZED_RENDERING: 'optimized-rendering',
  LAZY_COMPONENT_LOADING: 'lazy-component-loading',
  MEMORY_OPTIMIZATION: 'memory-optimization',
  
  // Developer Experience
  DEBUG_MODE: 'debug-mode',
  COMPONENT_INSPECTOR: 'component-inspector',
  PERFORMANCE_METRICS: 'performance-metrics',
} as const;

// ============================================================================
// Feature Flag Categories
// ============================================================================

export const FEATURE_CATEGORIES = {
  CORE: 'core',
  LAYOUT: 'layout', 
  VISUAL: 'visual',
  COMPONENTS: 'components',
  PERFORMANCE: 'performance',
  DEVELOPER: 'developer',
} as const;

// Feature flag categorization for better organization
export const FEATURE_FLAG_METADATA = {
  [FEATURE_FLAGS.NEW_WORKFLOW_DESIGN]: {
    category: FEATURE_CATEGORIES.CORE,
    name: 'New Workflow Design',
    description: 'Enable the complete n8n-inspired workflow design system',
    dependencies: [],
    stable: false,
    defaultValue: false,
  },
  [FEATURE_FLAGS.ENHANCED_PARAMETER_PANEL]: {
    category: FEATURE_CATEGORIES.CORE,
    name: 'Enhanced Parameter Panel',
    description: 'New side-panel parameter editing experience',
    dependencies: [FEATURE_FLAGS.NEW_WORKFLOW_DESIGN],
    stable: false,
    defaultValue: false,
  },
  [FEATURE_FLAGS.MINIMALIST_NODES]: {
    category: FEATURE_CATEGORIES.CORE,
    name: 'Minimalist Nodes',
    description: 'Compact n8n-style node components',
    dependencies: [FEATURE_FLAGS.NEW_WORKFLOW_DESIGN],
    stable: false,
    defaultValue: false,
  },
  [FEATURE_FLAGS.ENHANCED_CANVAS_BACKGROUND]: {
    category: FEATURE_CATEGORIES.LAYOUT,
    name: 'Enhanced Canvas Background',
    description: 'Advanced background patterns and zone visualization',
    dependencies: [],
    stable: true,
    defaultValue: false,
  },
  [FEATURE_FLAGS.ADVANCED_CANVAS_CONTROLS]: {
    category: FEATURE_CATEGORIES.LAYOUT,
    name: 'Advanced Canvas Controls',
    description: 'Enhanced zoom, layout, and navigation controls',
    dependencies: [],
    stable: true,
    defaultValue: false,
  },
  [FEATURE_FLAGS.WORKFLOW_ZONES]: {
    category: FEATURE_CATEGORIES.LAYOUT,
    name: 'Workflow Zones',
    description: 'Visual zones for input, processing, and output areas',
    dependencies: [FEATURE_FLAGS.ENHANCED_CANVAS_BACKGROUND],
    stable: true,
    defaultValue: false,
  },
  [FEATURE_FLAGS.LAYOUT_AUTO_ARRANGE]: {
    category: FEATURE_CATEGORIES.LAYOUT,
    name: 'Auto Layout Arrangement',
    description: 'Automatic node positioning and layout algorithms',
    dependencies: [FEATURE_FLAGS.ADVANCED_CANVAS_CONTROLS],
    stable: false,
    defaultValue: false,
  },
  [FEATURE_FLAGS.N8N_VISUAL_THEME]: {
    category: FEATURE_CATEGORIES.VISUAL,
    name: 'n8n Visual Theme',
    description: 'Complete n8n-inspired visual design system',
    dependencies: [FEATURE_FLAGS.NEW_WORKFLOW_DESIGN],
    stable: false,
    defaultValue: false,
  },
  [FEATURE_FLAGS.ENHANCED_ANIMATIONS]: {
    category: FEATURE_CATEGORIES.VISUAL,
    name: 'Enhanced Animations',
    description: 'Smooth transitions and micro-interactions',
    dependencies: [],
    stable: true,
    defaultValue: false,
  },
  [FEATURE_FLAGS.IMPROVED_TYPOGRAPHY]: {
    category: FEATURE_CATEGORIES.VISUAL,
    name: 'Improved Typography',
    description: 'Enhanced font system and text hierarchy',
    dependencies: [FEATURE_FLAGS.N8N_VISUAL_THEME],
    stable: true,
    defaultValue: false,
  },
  [FEATURE_FLAGS.DARK_MODE_ENHANCEMENTS]: {
    category: FEATURE_CATEGORIES.VISUAL,
    name: 'Dark Mode Enhancements',
    description: 'Improved dark theme with better contrast',
    dependencies: [FEATURE_FLAGS.N8N_VISUAL_THEME],
    stable: true,
    defaultValue: false,
  },
  [FEATURE_FLAGS.ENHANCED_NODE_TOOLBAR]: {
    category: FEATURE_CATEGORIES.COMPONENTS,
    name: 'Enhanced Node Toolbar',
    description: 'Improved node action toolbar with better UX',
    dependencies: [FEATURE_FLAGS.MINIMALIST_NODES],
    stable: false,
    defaultValue: false,
  },
  [FEATURE_FLAGS.SMART_CONNECTION_SYSTEM]: {
    category: FEATURE_CATEGORIES.COMPONENTS,
    name: 'Smart Connection System',
    description: 'Intelligent connection suggestions and validation',
    dependencies: [FEATURE_FLAGS.NEW_WORKFLOW_DESIGN],
    stable: false,
    defaultValue: false,
  },
  [FEATURE_FLAGS.CONTEXTUAL_MENUS]: {
    category: FEATURE_CATEGORIES.COMPONENTS,
    name: 'Contextual Menus',
    description: 'Right-click context menus for workflow elements',
    dependencies: [],
    stable: false,
    defaultValue: false,
  },
  [FEATURE_FLAGS.KEYBOARD_SHORTCUTS_V2]: {
    category: FEATURE_CATEGORIES.COMPONENTS,
    name: 'Keyboard Shortcuts v2',
    description: 'Enhanced keyboard navigation and shortcuts',
    dependencies: [],
    stable: false,
    defaultValue: false,
  },
  [FEATURE_FLAGS.OPTIMIZED_RENDERING]: {
    category: FEATURE_CATEGORIES.PERFORMANCE,
    name: 'Optimized Rendering',
    description: 'Performance improvements for large workflows',
    dependencies: [],
    stable: false,
    defaultValue: false,
  },
  [FEATURE_FLAGS.LAZY_COMPONENT_LOADING]: {
    category: FEATURE_CATEGORIES.PERFORMANCE,
    name: 'Lazy Component Loading',
    description: 'Load components on demand for better performance',
    dependencies: [],
    stable: false,
    defaultValue: false,
  },
  [FEATURE_FLAGS.MEMORY_OPTIMIZATION]: {
    category: FEATURE_CATEGORIES.PERFORMANCE,
    name: 'Memory Optimization',
    description: 'Reduced memory usage for complex workflows',
    dependencies: [FEATURE_FLAGS.OPTIMIZED_RENDERING],
    stable: false,
    defaultValue: false,
  },
  [FEATURE_FLAGS.DEBUG_MODE]: {
    category: FEATURE_CATEGORIES.DEVELOPER,
    name: 'Debug Mode',
    description: 'Enhanced debugging tools and information',
    dependencies: [],
    stable: true,
    defaultValue: false,
  },
  [FEATURE_FLAGS.COMPONENT_INSPECTOR]: {
    category: FEATURE_CATEGORIES.DEVELOPER,
    name: 'Component Inspector',
    description: 'Inspect component props and state in development',
    dependencies: [FEATURE_FLAGS.DEBUG_MODE],
    stable: true,
    defaultValue: false,
  },
  [FEATURE_FLAGS.PERFORMANCE_METRICS]: {
    category: FEATURE_CATEGORIES.DEVELOPER,
    name: 'Performance Metrics',
    description: 'Real-time performance monitoring and metrics',
    dependencies: [FEATURE_FLAGS.DEBUG_MODE],
    stable: true,
    defaultValue: false,
  },
} as const;

// ============================================================================
// Type Definitions
// ============================================================================

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
export type FeatureFlagValue = typeof FEATURE_FLAGS[FeatureFlagKey];
export type FeatureFlagCategory = typeof FEATURE_CATEGORIES[keyof typeof FEATURE_CATEGORIES];

export interface FeatureFlagMetadata {
  category: FeatureFlagCategory;
  name: string;
  description: string;
  dependencies: FeatureFlagValue[];
  stable: boolean;
  defaultValue: boolean;
}

export interface FeatureFlagConfig {
  [key: string]: boolean;
}

// ============================================================================
// Core Hook - useFeatureFlag
// ============================================================================

/**
 * Hook to check if a specific feature flag is enabled
 * @param flag - The feature flag to check
 * @returns boolean indicating if the feature is enabled
 */
export const useFeatureFlag = (flag: FeatureFlagKey): boolean => {
  const { featureFlags } = useUtilityStore();
  const flagValue = FEATURE_FLAGS[flag];
  const metadata = FEATURE_FLAG_METADATA[flagValue];
  
  return useMemo(() => {
    // Check if explicitly set in store
    if (featureFlags && typeof featureFlags[flagValue] === 'boolean') {
      return featureFlags[flagValue];
    }
    
    // Fall back to default value
    return metadata?.defaultValue ?? false;
  }, [featureFlags, flagValue, metadata]);
};

// ============================================================================
// Advanced Hooks
// ============================================================================

/**
 * Hook to check multiple feature flags at once
 * @param flags - Array of feature flags to check
 * @returns Object with flag values
 */
export const useFeatureFlags = (flags: FeatureFlagKey[]): Record<string, boolean> => {
  const { featureFlags } = useUtilityStore();
  
  return useMemo(() => {
    const result: Record<string, boolean> = {};
    
    flags.forEach(flag => {
      const flagValue = FEATURE_FLAGS[flag];
      const metadata = FEATURE_FLAG_METADATA[flagValue];
      
      if (featureFlags && typeof featureFlags[flagValue] === 'boolean') {
        result[flagValue] = featureFlags[flagValue];
      } else {
        result[flagValue] = metadata?.defaultValue ?? false;
      }
    });
    
    return result;
  }, [flags, featureFlags]);
};

/**
 * Hook to get all feature flags for a specific category
 * @param category - The category to filter by
 * @returns Object with flag values for the category
 */
export const useFeatureFlagsByCategory = (category: FeatureFlagCategory): Record<string, boolean> => {
  const { featureFlags } = useUtilityStore();
  
  return useMemo(() => {
    const result: Record<string, boolean> = {};
    
    Object.entries(FEATURE_FLAG_METADATA).forEach(([flagValue, metadata]) => {
      if (metadata.category === category) {
        if (featureFlags && typeof featureFlags[flagValue] === 'boolean') {
          result[flagValue] = featureFlags[flagValue];
        } else {
          result[flagValue] = metadata.defaultValue;
        }
      }
    });
    
    return result;
  }, [category, featureFlags]);
};

/**
 * Hook to manage feature flags (for admin/development use)
 * @returns Object with flag management functions
 */
export const useFeatureFlagManager = () => {
  const { featureFlags, setFeatureFlags } = useUtilityStore();
  
  const setFeatureFlag = useCallback((flag: FeatureFlagKey, enabled: boolean) => {
    const flagValue = FEATURE_FLAGS[flag];
    const newFlags = { ...featureFlags, [flagValue]: enabled };
    setFeatureFlags(newFlags);
  }, [featureFlags, setFeatureFlags]);
  
  const toggleFeatureFlag = useCallback((flag: FeatureFlagKey) => {
    const flagValue = FEATURE_FLAGS[flag];
    const currentValue = featureFlags?.[flagValue] ?? FEATURE_FLAG_METADATA[flagValue]?.defaultValue ?? false;
    setFeatureFlag(flag, !currentValue);
  }, [featureFlags, setFeatureFlag]);
  
  const resetFeatureFlag = useCallback((flag: FeatureFlagKey) => {
    const flagValue = FEATURE_FLAGS[flag];
    const defaultValue = FEATURE_FLAG_METADATA[flagValue]?.defaultValue ?? false;
    setFeatureFlag(flag, defaultValue);
  }, [setFeatureFlag]);
  
  const resetAllFeatureFlags = useCallback(() => {
    const defaultFlags: Record<string, boolean> = {};
    Object.entries(FEATURE_FLAG_METADATA).forEach(([flagValue, metadata]) => {
      defaultFlags[flagValue] = metadata.defaultValue;
    });
    setFeatureFlags(defaultFlags);
  }, [setFeatureFlags]);
  
  const enableFeatureFlagGroup = useCallback((category: FeatureFlagCategory) => {
    const newFlags = { ...featureFlags };
    Object.entries(FEATURE_FLAG_METADATA).forEach(([flagValue, metadata]) => {
      if (metadata.category === category) {
        newFlags[flagValue] = true;
      }
    });
    setFeatureFlags(newFlags);
  }, [featureFlags, setFeatureFlags]);
  
  const disableFeatureFlagGroup = useCallback((category: FeatureFlagCategory) => {
    const newFlags = { ...featureFlags };
    Object.entries(FEATURE_FLAG_METADATA).forEach(([flagValue, metadata]) => {
      if (metadata.category === category) {
        newFlags[flagValue] = false;
      }
    });
    setFeatureFlags(newFlags);
  }, [featureFlags, setFeatureFlags]);
  
  return {
    setFeatureFlag,
    toggleFeatureFlag,
    resetFeatureFlag,
    resetAllFeatureFlags,
    enableFeatureFlagGroup,
    disableFeatureFlagGroup,
  };
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a feature flag is enabled (non-hook version)
 * @param flag - The feature flag to check
 * @param currentFlags - Current feature flag state
 * @returns boolean indicating if the feature is enabled
 */
export const isFeatureFlagEnabled = (
  flag: FeatureFlagKey, 
  currentFlags: FeatureFlagConfig
): boolean => {
  const flagValue = FEATURE_FLAGS[flag];
  const metadata = FEATURE_FLAG_METADATA[flagValue];
  
  if (typeof currentFlags[flagValue] === 'boolean') {
    return currentFlags[flagValue];
  }
  
  return metadata?.defaultValue ?? false;
};

/**
 * Check if all dependencies for a feature flag are satisfied
 * @param flag - The feature flag to check
 * @param currentFlags - Current feature flag state
 * @returns boolean indicating if dependencies are satisfied
 */
export const areFeatureFlagDependenciesSatisfied = (
  flag: FeatureFlagKey,
  currentFlags: FeatureFlagConfig
): boolean => {
  const flagValue = FEATURE_FLAGS[flag];
  const metadata = FEATURE_FLAG_METADATA[flagValue];
  
  if (!metadata?.dependencies || metadata.dependencies.length === 0) {
    return true;
  }
  
  return metadata.dependencies.every(depFlag => {
    return typeof currentFlags[depFlag] === 'boolean' ? currentFlags[depFlag] : false;
  });
};

/**
 * Get feature flags that should be enabled based on dependencies
 * @param currentFlags - Current feature flag state
 * @returns Array of feature flags that should be auto-enabled
 */
export const getAutoEnabledFeatureFlags = (currentFlags: FeatureFlagConfig): FeatureFlagValue[] => {
  const autoEnabled: FeatureFlagValue[] = [];
  
  Object.entries(FEATURE_FLAG_METADATA).forEach(([flagValue, metadata]) => {
    if (metadata.dependencies.length > 0) {
      const allDepsEnabled = metadata.dependencies.every(depFlag => 
        currentFlags[depFlag] === true
      );
      
      if (allDepsEnabled && !currentFlags[flagValue]) {
        autoEnabled.push(flagValue as FeatureFlagValue);
      }
    }
  });
  
  return autoEnabled;
};

/**
 * Validate feature flag configuration for conflicts
 * @param flags - Feature flag configuration to validate
 * @returns Array of validation errors
 */
export const validateFeatureFlagConfig = (flags: FeatureFlagConfig): string[] => {
  const errors: string[] = [];
  
  Object.entries(flags).forEach(([flagValue, enabled]) => {
    if (enabled) {
      const metadata = FEATURE_FLAG_METADATA[flagValue as FeatureFlagValue];
      if (metadata?.dependencies) {
        metadata.dependencies.forEach(depFlag => {
          if (!flags[depFlag]) {
            errors.push(`Feature "${metadata.name}" requires "${FEATURE_FLAG_METADATA[depFlag]?.name}" to be enabled`);
          }
        });
      }
    }
  });
  
  return errors;
};

// ============================================================================
// Development Helpers
// ============================================================================

/**
 * Get all feature flag metadata for development/admin interfaces
 * @returns Complete feature flag metadata
 */
export const getAllFeatureFlagMetadata = (): Record<FeatureFlagValue, FeatureFlagMetadata> => {
  return FEATURE_FLAG_METADATA;
};

/**
 * Get feature flags grouped by category
 * @returns Feature flags organized by category
 */
export const getFeatureFlagsByCategory = (): Record<FeatureFlagCategory, FeatureFlagValue[]> => {
  const result = {} as Record<FeatureFlagCategory, FeatureFlagValue[]>;
  
  Object.values(FEATURE_CATEGORIES).forEach(category => {
    result[category] = [];
  });
  
  Object.entries(FEATURE_FLAG_METADATA).forEach(([flagValue, metadata]) => {
    result[metadata.category].push(flagValue as FeatureFlagValue);
  });
  
  return result;
};

/**
 * Create a preset configuration for common scenarios
 * @param preset - Preset name
 * @returns Feature flag configuration
 */
export const createFeatureFlagPreset = (preset: 'development' | 'staging' | 'production' | 'all'): FeatureFlagConfig => {
  const config: FeatureFlagConfig = {};
  
  Object.entries(FEATURE_FLAG_METADATA).forEach(([flagValue, metadata]) => {
    switch (preset) {
      case 'development':
        // Enable all stable features and debug tools
        config[flagValue] = metadata.stable || metadata.category === FEATURE_CATEGORIES.DEVELOPER;
        break;
      case 'staging':
        // Enable stable features only
        config[flagValue] = metadata.stable;
        break;
      case 'production':
        // Enable only core stable features
        config[flagValue] = metadata.stable && metadata.category === FEATURE_CATEGORIES.CORE;
        break;
      case 'all':
        // Enable everything (for testing)
        config[flagValue] = true;
        break;
      default:
        config[flagValue] = metadata.defaultValue;
    }
  });
  
  return config;
};

// ============================================================================
// Export everything
// ============================================================================

export default {
  FEATURE_FLAGS,
  FEATURE_CATEGORIES,
  FEATURE_FLAG_METADATA,
  useFeatureFlag,
  useFeatureFlags,
  useFeatureFlagsByCategory,
  useFeatureFlagManager,
  isFeatureFlagEnabled,
  areFeatureFlagDependenciesSatisfied,
  getAutoEnabledFeatureFlags,
  validateFeatureFlagConfig,
  getAllFeatureFlagMetadata,
  getFeatureFlagsByCategory,
  createFeatureFlagPreset,
}; 