// ============================================================================
// Feature Flag Demo - Step 5.1 Testing Component
// Comprehensive demonstration of the feature flag system
// ============================================================================

import React, { useState, useCallback } from 'react';
import { 
  useFeatureFlag, 
  useFeatureFlags, 
  useFeatureFlagsByCategory, 
  useFeatureFlagManager,
  FEATURE_FLAGS,
  FEATURE_CATEGORIES,
  createFeatureFlagPreset,
  type FeatureFlagKey 
} from '../../../utils/featureFlags';
import { useUtilityStore } from '../../../stores/utilityStore';
import { FeatureFlagPanel, FeatureFlagQuickToggle } from './index';
import './FeatureFlagDemo.scss';

// ============================================================================
// Demo Components - Feature Flag Controlled
// ============================================================================

const NewWorkflowDesignDemo: React.FC = () => {
  const isEnabled = useFeatureFlag('NEW_WORKFLOW_DESIGN');
  
  if (!isEnabled) {
    return (
      <div className="demo-component demo-component--disabled">
        <h3>Legacy Workflow Design</h3>
        <p>The old workflow interface is currently active.</p>
        <div className="demo-legacy-ui">
          <div className="legacy-node">Old Node Style</div>
          <div className="legacy-node">Complex Parameters</div>
          <div className="legacy-node">Traditional Layout</div>
        </div>
      </div>
    );
  }

  return (
    <div className="demo-component demo-component--enabled">
      <h3>🎨 New Workflow Design</h3>
      <p>The modern n8n-inspired workflow interface is active!</p>
      <div className="demo-new-ui">
        <div className="modern-node">Clean Node</div>
        <div className="modern-node">Minimal UI</div>
        <div className="modern-node">Smart Layout</div>
      </div>
    </div>
  );
};

const EnhancedParameterPanelDemo: React.FC = () => {
  const isEnabled = useFeatureFlag('ENHANCED_PARAMETER_PANEL');
  const [panelOpen, setPanelOpen] = useState(false);
  
  return (
    <div className="demo-component">
      <h3>📋 Parameter Panel</h3>
      <button 
        onClick={() => setPanelOpen(!panelOpen)}
        className={`demo-button ${isEnabled ? 'demo-button--modern' : 'demo-button--legacy'}`}
      >
        {isEnabled ? 'Open Enhanced Panel' : 'Open Legacy Panel'}
      </button>
      
      {panelOpen && (
        <div className={`demo-panel ${isEnabled ? 'demo-panel--enhanced' : 'demo-panel--legacy'}`}>
          <div className="demo-panel__header">
            <h4>{isEnabled ? 'Enhanced Parameter Panel' : 'Legacy Parameter Panel'}</h4>
            <button onClick={() => setPanelOpen(false)}>×</button>
          </div>
          <div className="demo-panel__content">
            {isEnabled ? (
              <div className="enhanced-params">
                <div className="param-group">
                  <label>Smart Input</label>
                  <input type="text" placeholder="AI-assisted input..." />
                </div>
                <div className="param-group">
                  <label>Dynamic Options</label>
                  <select>
                    <option>Auto-detected option 1</option>
                    <option>Auto-detected option 2</option>
                  </select>
                </div>
                <div className="param-actions">
                  <button className="btn-primary">Apply</button>
                  <button className="btn-secondary">Reset</button>
                </div>
              </div>
            ) : (
              <div className="legacy-params">
                <input type="text" placeholder="Basic input" />
                <textarea placeholder="Manual configuration..."></textarea>
                <button>Save</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MinimalistNodesDemo: React.FC = () => {
  const isEnabled = useFeatureFlag('MINIMALIST_NODES');
  
  return (
    <div className="demo-component">
      <h3>🎯 Node Design</h3>
      <div className="demo-nodes">
        <div className={`demo-workflow-node ${isEnabled ? 'demo-workflow-node--minimal' : 'demo-workflow-node--detailed'}`}>
          <div className="node-icon">🔄</div>
          <div className="node-content">
            <div className="node-title">HTTP Request</div>
            {!isEnabled && (
              <div className="node-details">
                <div className="node-param">URL: api.example.com</div>
                <div className="node-param">Method: GET</div>
                <div className="node-param">Headers: 3 items</div>
              </div>
            )}
          </div>
        </div>
        
        <div className={`demo-workflow-node ${isEnabled ? 'demo-workflow-node--minimal' : 'demo-workflow-node--detailed'}`}>
          <div className="node-icon">🔍</div>
          <div className="node-content">
            <div className="node-title">Filter Data</div>
            {!isEnabled && (
              <div className="node-details">
                <div className="node-param">Filter: active === true</div>
                <div className="node-param">Sort: date desc</div>
                <div className="node-param">Limit: 100</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LayoutSystemDemo: React.FC = () => {
  const layoutFlags = useFeatureFlagsByCategory('layout');
  const enabledCount = Object.values(layoutFlags).filter(Boolean).length;
  
  return (
    <div className="demo-component">
      <h3>🎨 Layout System</h3>
      <p>{enabledCount} of {Object.keys(layoutFlags).length} layout features enabled</p>
      
      <div className="demo-layout-features">
        {Object.entries(layoutFlags).map(([flag, enabled]) => (
          <div key={flag} className={`demo-feature ${enabled ? 'demo-feature--enabled' : 'demo-feature--disabled'}`}>
            <div className="demo-feature__icon">
              {enabled ? '✅' : '⭕'}
            </div>
            <div className="demo-feature__name">
              {flag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PerformanceDemo: React.FC = () => {
  const performanceFlags = useFeatureFlagsByCategory('performance');
  const [metrics, setMetrics] = useState({
    renderTime: Math.random() * 100 + 50,
    memoryUsage: Math.random() * 50 + 25,
    bundleSize: Math.random() * 500 + 1000
  });

  const refreshMetrics = useCallback(() => {
    const optimizationLevel = Object.values(performanceFlags).filter(Boolean).length;
    const improvement = optimizationLevel * 0.2;
    
    setMetrics({
      renderTime: (Math.random() * 100 + 50) * (1 - improvement),
      memoryUsage: (Math.random() * 50 + 25) * (1 - improvement),
      bundleSize: (Math.random() * 500 + 1000) * (1 - improvement)
    });
  }, [performanceFlags]);

  return (
    <div className="demo-component">
      <h3>⚡ Performance Metrics</h3>
      <button onClick={refreshMetrics} className="demo-button">Refresh Metrics</button>
      
      <div className="demo-metrics">
        <div className="demo-metric">
          <div className="demo-metric__label">Render Time</div>
          <div className="demo-metric__value">{metrics.renderTime.toFixed(1)}ms</div>
        </div>
        <div className="demo-metric">
          <div className="demo-metric__label">Memory Usage</div>
          <div className="demo-metric__value">{metrics.memoryUsage.toFixed(1)}MB</div>
        </div>
        <div className="demo-metric">
          <div className="demo-metric__label">Bundle Size</div>
          <div className="demo-metric__value">{metrics.bundleSize.toFixed(0)}KB</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Demo Component
// ============================================================================

export const FeatureFlagDemo: React.FC = () => {
  const [panelOpen, setPanelOpen] = useState(false);
  const { setFeatureFlags } = useUtilityStore();
  const flagManager = useFeatureFlagManager();

  // Quick preset handlers
  const handlePreset = useCallback((preset: 'development' | 'staging' | 'production' | 'all') => {
    const config = createFeatureFlagPreset(preset);
    setFeatureFlags(config);
  }, [setFeatureFlags]);

  const handleRandomize = useCallback(() => {
    const randomFlags: Record<string, boolean> = {};
    Object.values(FEATURE_FLAGS).forEach(flag => {
      randomFlags[flag] = Math.random() > 0.5;
    });
    setFeatureFlags(randomFlags);
  }, [setFeatureFlags]);

  return (
    <div className="feature-flag-demo">
      {/* Header */}
      <div className="feature-flag-demo__header">
        <h1>🚩 Feature Flag System Demo</h1>
        <p>Step 5.1: Controlled rollout and testing of n8n-inspired design features</p>
        
        <div className="feature-flag-demo__controls">
          <button 
            onClick={() => setPanelOpen(true)}
            className="demo-button demo-button--primary"
          >
            Open Feature Flag Panel
          </button>
          
          <div className="demo-presets">
            <span>Quick Presets:</span>
            <button onClick={() => handlePreset('development')} className="demo-preset-btn">Dev</button>
            <button onClick={() => handlePreset('staging')} className="demo-preset-btn">Staging</button>
            <button onClick={() => handlePreset('production')} className="demo-preset-btn">Prod</button>
            <button onClick={() => handlePreset('all')} className="demo-preset-btn">All</button>
            <button onClick={handleRandomize} className="demo-preset-btn demo-preset-btn--random">Random</button>
          </div>
        </div>
      </div>

      {/* Demo Components */}
      <div className="feature-flag-demo__content">
        <div className="demo-grid">
          <NewWorkflowDesignDemo />
          <EnhancedParameterPanelDemo />
          <MinimalistNodesDemo />
          <LayoutSystemDemo />
          <PerformanceDemo />
          
          {/* Feature Category Summary */}
          <div className="demo-component">
            <h3>📊 Category Overview</h3>
            <div className="demo-categories">
              {Object.values(FEATURE_CATEGORIES).map(category => {
                const categoryFlags = useFeatureFlagsByCategory(category);
                const enabledCount = Object.values(categoryFlags).filter(Boolean).length;
                const totalCount = Object.keys(categoryFlags).length;
                const percentage = totalCount > 0 ? (enabledCount / totalCount) * 100 : 0;
                
                return (
                  <div key={category} className="demo-category">
                    <div className="demo-category__header">
                      <span className="demo-category__name">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                      <span className="demo-category__count">
                        {enabledCount}/{totalCount}
                      </span>
                    </div>
                    <div className="demo-category__progress">
                      <div 
                        className="demo-category__progress-bar"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Flag Panel */}
      <FeatureFlagPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        position="right"
      />

      {/* Quick Toggles for Development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="feature-flag-demo__quick-toggles">
          <FeatureFlagQuickToggle flag="NEW_WORKFLOW_DESIGN" />
          <FeatureFlagQuickToggle flag="ENHANCED_PARAMETER_PANEL" />
          <FeatureFlagQuickToggle flag="MINIMALIST_NODES" />
        </div>
      )}

      {/* Instructions */}
      <div className="feature-flag-demo__instructions">
        <h2>🎯 How to Use This Demo</h2>
        <div className="instruction-grid">
          <div className="instruction-item">
            <h3>1. Open Feature Flag Panel</h3>
            <p>Click the "Open Feature Flag Panel" button to access the admin interface where you can toggle individual features, apply presets, and manage dependencies.</p>
          </div>
          <div className="instruction-item">
            <h3>2. Try Different Presets</h3>
            <p>Use the quick preset buttons to instantly apply different feature configurations: Development (all stable + debug), Staging (stable only), Production (core stable), or All (everything enabled).</p>
          </div>
          <div className="instruction-item">
            <h3>3. Observe Changes</h3>
            <p>Watch how the demo components change in real-time as you toggle features. Notice how dependent features automatically enable/disable based on their requirements.</p>
          </div>
          <div className="instruction-item">
            <h3>4. Test Dependencies</h3>
            <p>Try enabling advanced features to see how the system enforces dependencies. Some features require others to be enabled first for proper functionality.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureFlagDemo; 