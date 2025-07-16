# Feature Flag System - Step 5.1 Documentation

## Overview

The Feature Flag System enables controlled rollout and testing of new features in KozmoAI's frontend. This system allows developers and administrators to toggle features on/off without code deployments, enabling safe experimentation and gradual feature rollouts.

## 🚩 Key Features

- **Real-time Feature Toggling**: Enable/disable features instantly without restarts
- **Dependency Management**: Automatic handling of feature dependencies
- **Category Organization**: Features organized by type (core, layout, visual, etc.)
- **Preset Configurations**: Quick setups for different environments
- **Validation System**: Prevents invalid configurations
- **Admin Interface**: Professional UI for feature management
- **Development Tools**: Quick toggles and debugging utilities

## 📁 File Structure

```
src/frontend/src/
├── utils/
│   └── featureFlags.ts              # Core feature flag system
├── stores/
│   └── utilityStore.ts              # Feature flag storage (existing)
└── components/common/FeatureFlagPanel/
    ├── index.tsx                    # Admin panel component
    ├── FeatureFlagPanel.scss        # Panel styling
    ├── FeatureFlagDemo.tsx          # Demo/testing component
    ├── FeatureFlagDemo.scss         # Demo styling
    └── README_FeatureFlags.md       # This documentation
```

## 🎯 Feature Categories

### Core Features
- `NEW_WORKFLOW_DESIGN` - Complete n8n-inspired design system
- `ENHANCED_PARAMETER_PANEL` - Side-panel parameter editing
- `MINIMALIST_NODES` - Compact node components

### Layout Features  
- `ENHANCED_CANVAS_BACKGROUND` - Advanced background patterns
- `ADVANCED_CANVAS_CONTROLS` - Enhanced zoom/layout controls
- `WORKFLOW_ZONES` - Visual zones for input/processing/output
- `LAYOUT_AUTO_ARRANGE` - Automatic node positioning

### Visual Features
- `N8N_VISUAL_THEME` - Complete visual design system
- `ENHANCED_ANIMATIONS` - Smooth transitions
- `IMPROVED_TYPOGRAPHY` - Enhanced font system
- `DARK_MODE_ENHANCEMENTS` - Better dark theme

### Component Features
- `ENHANCED_NODE_TOOLBAR` - Improved node actions
- `SMART_CONNECTION_SYSTEM` - Intelligent connections
- `CONTEXTUAL_MENUS` - Right-click menus
- `KEYBOARD_SHORTCUTS_V2` - Enhanced shortcuts

### Performance Features
- `OPTIMIZED_RENDERING` - Performance improvements
- `LAZY_COMPONENT_LOADING` - On-demand loading
- `MEMORY_OPTIMIZATION` - Reduced memory usage

### Developer Features
- `DEBUG_MODE` - Enhanced debugging tools
- `COMPONENT_INSPECTOR` - Component inspection
- `PERFORMANCE_METRICS` - Real-time metrics

## 🔧 Usage

### Basic Hook Usage

```typescript
import { useFeatureFlag } from '../utils/featureFlags';

const MyComponent = () => {
  const isNewDesignEnabled = useFeatureFlag('NEW_WORKFLOW_DESIGN');
  
  if (isNewDesignEnabled) {
    return <NewDesignComponent />;
  }
  
  return <LegacyComponent />;
};
```

### Multiple Flags

```typescript
import { useFeatureFlags } from '../utils/featureFlags';

const MyComponent = () => {
  const flags = useFeatureFlags([
    'NEW_WORKFLOW_DESIGN',
    'ENHANCED_PARAMETER_PANEL',
    'MINIMALIST_NODES'
  ]);
  
  return (
    <div>
      {flags['new-workflow-design'] && <NewWorkflow />}
      {flags['enhanced-parameter-panel'] && <EnhancedPanel />}
      {flags['minimalist-nodes'] && <MinimalNodes />}
    </div>
  );
};
```

### Category-based Flags

```typescript
import { useFeatureFlagsByCategory } from '../utils/featureFlags';

const LayoutComponent = () => {
  const layoutFlags = useFeatureFlagsByCategory('layout');
  
  return (
    <div>
      {layoutFlags['enhanced-canvas-background'] && <EnhancedBackground />}
      {layoutFlags['advanced-canvas-controls'] && <AdvancedControls />}
    </div>
  );
};
```

### Feature Flag Management

```typescript
import { useFeatureFlagManager } from '../utils/featureFlags';

const AdminPanel = () => {
  const { 
    setFeatureFlag, 
    toggleFeatureFlag, 
    resetAllFeatureFlags 
  } = useFeatureFlagManager();
  
  return (
    <div>
      <button onClick={() => setFeatureFlag('NEW_WORKFLOW_DESIGN', true)}>
        Enable New Design
      </button>
      <button onClick={() => toggleFeatureFlag('DEBUG_MODE')}>
        Toggle Debug Mode
      </button>
      <button onClick={resetAllFeatureFlags}>
        Reset All Flags
      </button>
    </div>
  );
};
```

## 🎨 Admin Interface

### Opening the Feature Flag Panel

```typescript
import { FeatureFlagPanel } from '../components/common/FeatureFlagPanel';

const App = () => {
  const [panelOpen, setPanelOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setPanelOpen(true)}>
        Open Feature Flags
      </button>
      
      <FeatureFlagPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        position="right"
      />
    </>
  );
};
```

### Quick Development Toggles

```typescript
import { FeatureFlagQuickToggle } from '../components/common/FeatureFlagPanel';

// Only shows in development
const DevTools = () => (
  <div>
    <FeatureFlagQuickToggle flag="NEW_WORKFLOW_DESIGN" />
    <FeatureFlagQuickToggle flag="DEBUG_MODE" />
  </div>
);
```

## ⚙️ Configuration

### Environment Presets

```typescript
import { createFeatureFlagPreset } from '../utils/featureFlags';

// Development: All stable features + debug tools
const devConfig = createFeatureFlagPreset('development');

// Staging: Only stable features
const stagingConfig = createFeatureFlagPreset('staging');

// Production: Core stable features only
const prodConfig = createFeatureFlagPreset('production');

// Testing: All features enabled
const testConfig = createFeatureFlagPreset('all');
```

### Custom Configuration

```typescript
const customConfig = {
  'new-workflow-design': true,
  'enhanced-parameter-panel': true,
  'minimalist-nodes': false,
  'debug-mode': process.env.NODE_ENV === 'development'
};

// Apply configuration
const { setFeatureFlags } = useUtilityStore.getState();
setFeatureFlags(customConfig);
```

## 🔍 Validation and Dependencies

### Dependency System

Features can depend on other features:

```typescript
// Enhanced Parameter Panel requires New Workflow Design
ENHANCED_PARAMETER_PANEL: {
  dependencies: ['new-workflow-design'],
  // ... other metadata
}
```

### Validation

```typescript
import { validateFeatureFlagConfig } from '../utils/featureFlags';

const config = {
  'enhanced-parameter-panel': true,
  'new-workflow-design': false // Missing dependency!
};

const errors = validateFeatureFlagConfig(config);
// Returns: ["Enhanced Parameter Panel requires New Workflow Design to be enabled"]
```

## 🧪 Testing and Demo

### Demo Component

```typescript
import { FeatureFlagDemo } from '../components/common/FeatureFlagPanel/FeatureFlagDemo';

// Comprehensive demo with live examples
const TestPage = () => <FeatureFlagDemo />;
```

### Non-hook Usage

```typescript
import { isFeatureFlagEnabled } from '../utils/featureFlags';

// For use outside React components
const checkFeature = (flags) => {
  return isFeatureFlagEnabled('NEW_WORKFLOW_DESIGN', flags);
};
```

## 📊 Monitoring and Analytics

### Feature Usage Tracking

```typescript
import { useFeatureFlag } from '../utils/featureFlags';

const TrackedComponent = () => {
  const isEnabled = useFeatureFlag('NEW_WORKFLOW_DESIGN');
  
  useEffect(() => {
    if (isEnabled) {
      // Track feature usage
      analytics.track('feature_used', {
        feature: 'new_workflow_design',
        timestamp: Date.now()
      });
    }
  }, [isEnabled]);
  
  return isEnabled ? <NewComponent /> : <OldComponent />;
};
```

## 🚀 Best Practices

### 1. Feature Flag Naming
- Use descriptive, kebab-case names
- Include the feature category prefix
- Keep names consistent across environments

### 2. Gradual Rollout
```typescript
// Start with development only
const config = createFeatureFlagPreset('development');

// Move to staging when stable
const config = createFeatureFlagPreset('staging');

// Finally to production
const config = createFeatureFlagPreset('production');
```

### 3. Cleanup Strategy
- Remove feature flags after full rollout
- Keep flags for experiments and A/B testing
- Document flag lifecycle and removal plans

### 4. Testing Strategy
```typescript
// Test both enabled and disabled states
describe('MyComponent', () => {
  it('renders new design when flag is enabled', () => {
    // Mock feature flag as enabled
    mockFeatureFlag('NEW_WORKFLOW_DESIGN', true);
    render(<MyComponent />);
    expect(screen.getByText('New Design')).toBeInTheDocument();
  });
  
  it('renders legacy design when flag is disabled', () => {
    // Mock feature flag as disabled
    mockFeatureFlag('NEW_WORKFLOW_DESIGN', false);
    render(<MyComponent />);
    expect(screen.getByText('Legacy Design')).toBeInTheDocument();
  });
});
```

## 🔧 Integration with Existing Systems

### Storage Integration
The system integrates with KozmoAI's existing `utilityStore`:

```typescript
// Stored in utilityStore.featureFlags
const { featureFlags, setFeatureFlags } = useUtilityStore();
```

### Persistence
Feature flags are automatically persisted in the browser's localStorage through the utility store.

### API Integration
For server-side feature flags, extend the system:

```typescript
// Fetch flags from API
const fetchServerFlags = async () => {
  const response = await fetch('/api/feature-flags');
  const serverFlags = await response.json();
  
  // Merge with local flags
  const { setFeatureFlags } = useUtilityStore.getState();
  setFeatureFlags({ ...serverFlags, ...localFlags });
};
```

## 🎯 Migration Guide

### From Legacy Feature Flags

```typescript
// Old way (direct boolean checks)
const isNewFeatureEnabled = ENABLE_NEW_FEATURE;

// New way (feature flag system)
const isNewFeatureEnabled = useFeatureFlag('NEW_FEATURE');
```

### Adding New Features

1. **Define the flag** in `FEATURE_FLAGS`
2. **Add metadata** in `FEATURE_FLAG_METADATA`
3. **Use the hook** in components
4. **Test both states**
5. **Document the feature**

Example:
```typescript
// 1. Add to FEATURE_FLAGS
export const FEATURE_FLAGS = {
  // ... existing flags
  MY_NEW_FEATURE: 'my-new-feature',
} as const;

// 2. Add metadata
export const FEATURE_FLAG_METADATA = {
  // ... existing metadata
  [FEATURE_FLAGS.MY_NEW_FEATURE]: {
    category: FEATURE_CATEGORIES.CORE,
    name: 'My New Feature',
    description: 'Description of what this feature does',
    dependencies: [], // or ['other-feature'] if dependent
    stable: false, // true when ready for production
    defaultValue: false,
  },
} as const;

// 3. Use in component
const MyComponent = () => {
  const isEnabled = useFeatureFlag('MY_NEW_FEATURE');
  return isEnabled ? <NewFeature /> : <OldFeature />;
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Feature not updating**: Check if the flag is properly defined in metadata
2. **Dependencies not working**: Ensure dependent flags are enabled first
3. **Persistence issues**: Verify utilityStore integration
4. **Performance concerns**: Use memoization for expensive feature checks

### Debug Mode

Enable debug mode to see detailed feature flag information:

```typescript
const debugEnabled = useFeatureFlag('DEBUG_MODE');
if (debugEnabled) {
  console.log('Current feature flags:', featureFlags);
}
```

## 📈 Performance Considerations

- Feature flag checks are memoized for performance
- Avoid feature flag checks in tight loops
- Use category-based hooks for related features
- Consider lazy loading for feature-specific components

## 🔮 Future Enhancements

- Server-side feature flag management
- A/B testing integration
- User-specific feature flags
- Time-based feature rollouts
- Analytics and usage tracking
- Feature flag lifecycle management

---

## 📞 Support

For questions or issues with the feature flag system:

1. Check this documentation first
2. Look at the demo component for examples
3. Review the TypeScript types for API details
4. Test in the admin panel interface

The feature flag system is designed to be developer-friendly and production-ready, enabling safe and controlled feature rollouts for KozmoAI's continued evolution. 