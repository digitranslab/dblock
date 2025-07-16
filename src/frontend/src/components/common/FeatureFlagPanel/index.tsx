// ============================================================================
// Feature Flag Panel - Admin Component for Step 5.1
// Real-time feature flag management and testing interface
// ============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import { 
  useFeatureFlag, 
  useFeatureFlags, 
  useFeatureFlagsByCategory, 
  useFeatureFlagManager,
  FEATURE_FLAGS,
  FEATURE_CATEGORIES,
  FEATURE_FLAG_METADATA,
  getAllFeatureFlagMetadata,
  getFeatureFlagsByCategory,
  createFeatureFlagPreset,
  validateFeatureFlagConfig,
  type FeatureFlagCategory,
  type FeatureFlagKey,
  type FeatureFlagConfig,
  type FeatureFlagMetadata
} from '../../../utils/featureFlags';
import { useUtilityStore } from '../../../stores/utilityStore';
import './FeatureFlagPanel.scss';

// ============================================================================
// Types
// ============================================================================

interface FeatureFlagPanelProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'bottom';
  compact?: boolean;
}

interface FeatureFlagItemProps {
  flagKey: string;
  metadata: FeatureFlagMetadata;
  enabled: boolean;
  onToggle: (flag: FeatureFlagKey) => void;
  dependenciesSatisfied: boolean;
  compact?: boolean;
}

// ============================================================================
// Feature Flag Item Component
// ============================================================================

const FeatureFlagItem: React.FC<FeatureFlagItemProps> = ({
  flagKey,
  metadata,
  enabled,
  onToggle,
  dependenciesSatisfied,
  compact = false
}) => {
  const handleToggle = useCallback(() => {
    const flagKeyTyped = Object.keys(FEATURE_FLAGS).find(
      key => FEATURE_FLAGS[key as FeatureFlagKey] === flagKey
    ) as FeatureFlagKey;
    
    if (flagKeyTyped) {
      onToggle(flagKeyTyped);
    }
  }, [flagKey, onToggle]);

  const canEnable = dependenciesSatisfied || enabled;
  const isDisabled = !canEnable && !enabled;

  return (
    <div className={`feature-flag-item ${compact ? 'feature-flag-item--compact' : ''} ${isDisabled ? 'feature-flag-item--disabled' : ''}`}>
      <div className="feature-flag-item__header">
        <div className="feature-flag-item__info">
          <div className="feature-flag-item__name">
            {metadata.name}
            {metadata.stable && <span className="feature-flag-item__badge feature-flag-item__badge--stable">Stable</span>}
            {!metadata.stable && <span className="feature-flag-item__badge feature-flag-item__badge--experimental">Experimental</span>}
          </div>
          {!compact && (
            <div className="feature-flag-item__description">
              {metadata.description}
            </div>
          )}
        </div>
        
        <label className="feature-flag-item__toggle">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
            disabled={isDisabled}
            className="feature-flag-item__checkbox"
          />
          <span className="feature-flag-item__slider"></span>
        </label>
      </div>

      {!compact && metadata.dependencies.length > 0 && (
        <div className="feature-flag-item__dependencies">
          <span className="feature-flag-item__dependencies-label">Dependencies:</span>
          <div className="feature-flag-item__dependencies-list">
            {metadata.dependencies.map(depFlag => {
              const depMetadata = FEATURE_FLAG_METADATA[depFlag];
              return (
                <span key={depFlag} className="feature-flag-item__dependency">
                  {depMetadata?.name || depFlag}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {!dependenciesSatisfied && !enabled && (
        <div className="feature-flag-item__warning">
          ⚠️ Some dependencies are not enabled
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const FeatureFlagPanel: React.FC<FeatureFlagPanelProps> = ({
  isOpen,
  onClose,
  position = 'right',
  compact = false
}) => {
  const { featureFlags } = useUtilityStore();
  const { 
    toggleFeatureFlag, 
    resetAllFeatureFlags, 
    enableFeatureFlagGroup, 
    disableFeatureFlagGroup 
  } = useFeatureFlagManager();

  // State
  const [selectedCategory, setSelectedCategory] = useState<FeatureFlagCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Computed values
  const allMetadata = useMemo(() => getAllFeatureFlagMetadata(), []);
  const flagsByCategory = useMemo(() => getFeatureFlagsByCategory(), []);
  const validationErrors = useMemo(() => validateFeatureFlagConfig(featureFlags || {}), [featureFlags]);

  // Filtered flags
  const filteredFlags = useMemo(() => {
    let flags = Object.entries(allMetadata);

    // Filter by category
    if (selectedCategory !== 'all') {
      flags = flags.filter(([, metadata]) => metadata.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      flags = flags.filter(([flagKey, metadata]) => 
        metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flagKey.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by enabled status
    if (showOnlyEnabled) {
      flags = flags.filter(([flagKey]) => featureFlags?.[flagKey] === true);
    }

    return flags;
  }, [allMetadata, selectedCategory, searchTerm, showOnlyEnabled, featureFlags]);

  // Handlers
  const handlePresetLoad = useCallback((preset: 'development' | 'staging' | 'production' | 'all') => {
    const presetConfig = createFeatureFlagPreset(preset);
    const { setFeatureFlags } = useUtilityStore.getState();
    setFeatureFlags(presetConfig);
  }, []);

  const handleCategoryToggle = useCallback((category: FeatureFlagCategory, enable: boolean) => {
    if (enable) {
      enableFeatureFlagGroup(category);
    } else {
      disableFeatureFlagGroup(category);
    }
  }, [enableFeatureFlagGroup, disableFeatureFlagGroup]);

  const handleExportConfig = useCallback(() => {
    const config = JSON.stringify(featureFlags, null, 2);
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feature-flags-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [featureFlags]);

  const handleImportConfig = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          const { setFeatureFlags } = useUtilityStore.getState();
          setFeatureFlags(config);
        } catch (error) {
          console.error('Failed to import feature flag config:', error);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className={`feature-flag-panel feature-flag-panel--${position} ${compact ? 'feature-flag-panel--compact' : ''}`}>
      {/* Header */}
      <div className="feature-flag-panel__header">
        <h2 className="feature-flag-panel__title">
          🚩 Feature Flags
          {validationErrors.length > 0 && (
            <span className="feature-flag-panel__error-count">
              {validationErrors.length} error{validationErrors.length !== 1 ? 's' : ''}
            </span>
          )}
        </h2>
        <button 
          onClick={onClose}
          className="feature-flag-panel__close"
          aria-label="Close Feature Flag Panel"
        >
          ✕
        </button>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="feature-flag-panel__validation">
          <button 
            onClick={() => setShowValidationErrors(!showValidationErrors)}
            className="feature-flag-panel__validation-toggle"
          >
            ⚠️ {validationErrors.length} Configuration Error{validationErrors.length !== 1 ? 's' : ''}
          </button>
          {showValidationErrors && (
            <div className="feature-flag-panel__validation-errors">
              {validationErrors.map((error, index) => (
                <div key={index} className="feature-flag-panel__validation-error">
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="feature-flag-panel__controls">
        {/* Search */}
        <div className="feature-flag-panel__search">
          <input
            type="text"
            placeholder="Search feature flags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="feature-flag-panel__search-input"
          />
        </div>

        {/* Category Filter */}
        <div className="feature-flag-panel__category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as FeatureFlagCategory | 'all')}
            className="feature-flag-panel__category-select"
          >
            <option value="all">All Categories</option>
            {Object.values(FEATURE_CATEGORIES).map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Filters */}
        <div className="feature-flag-panel__filters">
          <label className="feature-flag-panel__filter">
            <input
              type="checkbox"
              checked={showOnlyEnabled}
              onChange={(e) => setShowOnlyEnabled(e.target.checked)}
            />
            Show only enabled
          </label>
        </div>
      </div>

      {/* Preset Actions */}
      <div className="feature-flag-panel__presets">
        <div className="feature-flag-panel__preset-group">
          <span className="feature-flag-panel__preset-label">Presets:</span>
          <button onClick={() => handlePresetLoad('development')} className="feature-flag-panel__preset-btn">
            Development
          </button>
          <button onClick={() => handlePresetLoad('staging')} className="feature-flag-panel__preset-btn">
            Staging
          </button>
          <button onClick={() => handlePresetLoad('production')} className="feature-flag-panel__preset-btn">
            Production
          </button>
          <button onClick={() => handlePresetLoad('all')} className="feature-flag-panel__preset-btn">
            All
          </button>
        </div>
        
        <div className="feature-flag-panel__preset-group">
          <button onClick={resetAllFeatureFlags} className="feature-flag-panel__preset-btn feature-flag-panel__preset-btn--danger">
            Reset All
          </button>
        </div>
      </div>

      {/* Category Actions */}
      {selectedCategory !== 'all' && (
        <div className="feature-flag-panel__category-actions">
          <button 
            onClick={() => handleCategoryToggle(selectedCategory as FeatureFlagCategory, true)}
            className="feature-flag-panel__category-btn feature-flag-panel__category-btn--enable"
          >
            Enable All {selectedCategory}
          </button>
          <button 
            onClick={() => handleCategoryToggle(selectedCategory as FeatureFlagCategory, false)}
            className="feature-flag-panel__category-btn feature-flag-panel__category-btn--disable"
          >
            Disable All {selectedCategory}
          </button>
        </div>
      )}

      {/* Feature Flags List */}
      <div className="feature-flag-panel__content">
        {filteredFlags.length === 0 ? (
          <div className="feature-flag-panel__empty">
            No feature flags match your current filters.
          </div>
        ) : (
          <div className="feature-flag-panel__list">
            {filteredFlags.map(([flagKey, metadata]) => {
              const enabled = featureFlags?.[flagKey] === true;
              const dependenciesSatisfied = metadata.dependencies.every(depFlag => 
                featureFlags?.[depFlag] === true
              );

              return (
                <FeatureFlagItem
                  key={flagKey}
                  flagKey={flagKey}
                  metadata={metadata}
                  enabled={enabled}
                  onToggle={toggleFeatureFlag}
                  dependenciesSatisfied={dependenciesSatisfied}
                  compact={compact}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="feature-flag-panel__footer">
        <div className="feature-flag-panel__stats">
          {Object.values(featureFlags || {}).filter(Boolean).length} of {Object.keys(allMetadata).length} enabled
        </div>
        
        <div className="feature-flag-panel__actions">
          <button onClick={handleExportConfig} className="feature-flag-panel__action-btn">
            Export Config
          </button>
          <label className="feature-flag-panel__action-btn">
            Import Config
            <input
              type="file"
              accept=".json"
              onChange={handleImportConfig}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Quick Toggle Component (for development)
// ============================================================================

export const FeatureFlagQuickToggle: React.FC<{ flag: FeatureFlagKey; children?: React.ReactNode }> = ({ 
  flag, 
  children 
}) => {
  const enabled = useFeatureFlag(flag);
  const { toggleFeatureFlag } = useFeatureFlagManager();
  const metadata = FEATURE_FLAG_METADATA[FEATURE_FLAGS[flag]];

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="feature-flag-quick-toggle">
      <button 
        onClick={() => toggleFeatureFlag(flag)}
        className={`feature-flag-quick-toggle__btn ${enabled ? 'feature-flag-quick-toggle__btn--enabled' : ''}`}
        title={`Toggle ${metadata?.name || flag}`}
      >
        🚩 {metadata?.name || flag}: {enabled ? 'ON' : 'OFF'}
      </button>
      {children}
    </div>
  );
};

export default FeatureFlagPanel; 