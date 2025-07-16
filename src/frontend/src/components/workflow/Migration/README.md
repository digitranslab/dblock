# Node Migration System

A comprehensive, safe migration system for transitioning from old to new n8n-style workflow node components.

## 🎯 **Overview**

The Node Migration System provides a gradual, safe, and reversible approach to migrating from legacy workflow components to the new n8n-style design. It includes feature flags, error handling, performance monitoring, and rollback capabilities.

## 🏗️ **Architecture**

### Core Components

1. **`useNodeMigration` Hook** - Central migration state management
2. **`MigrationAwareNodeRenderer`** - Smart component switcher with error boundaries
3. **`MigrationControlPanel`** - Administrative interface for migration management
4. **`ErrorBoundary`** - React error boundary for graceful error handling

### Migration Strategy

- **Gradual Migration**: Enable node types one by one
- **Feature Flags**: Environment and user-configurable flags
- **Error Monitoring**: Track and limit errors per node type
- **Performance Tracking**: Monitor render times and success rates
- **Safe Rollback**: Automatic and manual rollback capabilities

## 🚀 **Getting Started**

### 1. Environment Configuration

Set environment variables to control migration behavior:

```bash
# Enable new node components globally
REACT_APP_ENABLE_NEW_NODES=true

# Enable new canvas (optional)
REACT_APP_ENABLE_NEW_CANVAS=true

# Enable new parameter panel (optional)
REACT_APP_ENABLE_NEW_PANEL=true

# Enable debug mode (development)
REACT_APP_MIGRATION_DEBUG=true

# Disable gradual migration (migrate all at once)
REACT_APP_GRADUAL_MIGRATION=false

# Disable fallback to old components
REACT_APP_FALLBACK_TO_OLD=false
```

### 2. Basic Usage

```typescript
import { useNodeMigration } from '../hooks/useNodeMigration';
import { MigrationAwareNodeRenderer } from '../components/workflow/Node/MigrationAwareNodeRenderer';

// In your component
const MyWorkflowComponent = () => {
  const { useNewNodes, shouldUseMigratedNode } = useNodeMigration();
  
  // Check if migration is enabled
  if (useNewNodes) {
    // Use migration-aware renderer
    return (
      <MigrationAwareNodeRenderer
        nodeType="ChatOpenAI"
        fallbackComponent={OldChatOpenAINode}
        {...nodeProps}
      />
    );
  }
  
  // Use old component
  return <OldChatOpenAINode {...nodeProps} />;
};
```

### 3. HOC Pattern

```typescript
import { withMigrationAwareness } from '../components/workflow/Node/MigrationAwareNodeRenderer';

// Wrap existing components
const MigratedChatOpenAI = withMigrationAwareness(
  NewChatOpenAIComponent,
  'ChatOpenAI',
  OldChatOpenAIComponent
);
```

### 4. Utility Function

```typescript
import { createMigratedNodeType } from '../components/workflow/Node/MigrationAwareNodeRenderer';

// Create migrated node type
const ChatOpenAINode = createMigratedNodeType('ChatOpenAI', OldChatOpenAIComponent);
```

## 🎛️ **Migration Control Panel**

Access the migration control panel for real-time management:

```typescript
import { MigrationControlPanel } from '../components/workflow/Migration/MigrationControlPanel';

const AdminPanel = () => {
  const [showMigration, setShowMigration] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowMigration(true)}>
        Open Migration Panel
      </button>
      
      <MigrationControlPanel
        isOpen={showMigration}
        onClose={() => setShowMigration(false)}
      />
    </>
  );
};
```

### Panel Features

- **Global Toggle**: Enable/disable all migrations
- **Node Type Management**: Enable/disable specific node types
- **Real-time Statistics**: Error rates, render times, rollback counts
- **Error Monitoring**: Recent errors with severity levels
- **Debug Information**: Detailed migration state and performance metrics

## 📊 **Monitoring & Analytics**

### Performance Metrics

The system tracks:
- **Render Times**: Average rendering performance per node type
- **Success Rates**: Successful vs failed renders
- **Error Counts**: Number of errors per node type
- **Rollback Events**: Automatic and manual rollbacks

### Error Handling

- **Automatic Rollback**: Disables node types after exceeding error threshold
- **Error Severity**: Low, medium, high, critical error classification
- **Error Logging**: Detailed error information with timestamps
- **Graceful Degradation**: Falls back to old components on errors

## 🛡️ **Safety Features**

### Error Boundaries

Every migrated component is wrapped in an error boundary that:
- Catches React rendering errors
- Provides fallback UI with retry/rollback options
- Reports errors to the migration system
- Prevents app crashes

### Automatic Rollback

The system automatically rolls back node types when:
- Error count exceeds `maxMigrationErrors` (default: 5)
- Critical errors occur during rendering
- Performance degrades significantly

### Manual Rollback

Administrators can:
- Rollback individual node types
- Perform complete system rollback
- Re-enable previously disabled node types

## 🔧 **Configuration Options**

### NodeMigrationConfig

```typescript
interface NodeMigrationConfig {
  // Global feature flags
  enableNewNodes: boolean;
  enableNewCanvas: boolean;
  enableNewPanel: boolean;
  
  // Component-specific migration flags
  enabledNodeTypes: string[];
  disabledNodeTypes: string[];
  
  // Migration settings
  gradualMigration: boolean;        // Enable gradual migration
  fallbackToOld: boolean;           // Allow fallback to old components
  debugMode: boolean;               // Enable debug logging
  
  // Performance monitoring
  enablePerformanceTracking: boolean;
  maxMigrationErrors: number;       // Max errors before rollback
}
```

### Local Storage Persistence

User preferences are persisted in localStorage:
- Enabled/disabled node types
- Global migration preferences
- Admin overrides

## 📈 **Migration Phases**

### Phase 1: Preparation
1. Set up environment variables
2. Test migration system in development
3. Enable debug mode for monitoring

### Phase 2: Pilot Testing
1. Enable migration for specific node types
2. Monitor error rates and performance
3. Gather user feedback

### Phase 3: Gradual Rollout
1. Gradually enable more node types
2. Monitor system stability
3. Address any issues quickly

### Phase 4: Full Migration
1. Enable all node types
2. Remove old components (optional)
3. Clean up migration code

## 🐛 **Troubleshooting**

### Common Issues

**High Error Rates**
- Check component compatibility
- Verify prop interfaces match
- Enable debug mode for detailed logging

**Performance Issues**
- Monitor render times in control panel
- Check for memory leaks
- Optimize heavy components

**Rollback Not Working**
- Verify fallback components exist
- Check localStorage permissions
- Clear migration state if needed

### Debug Mode

Enable detailed logging:
```typescript
// Environment variable
REACT_APP_MIGRATION_DEBUG=true

// Or programmatically
const { getDebugInfo } = useNodeMigration();
console.log(getDebugInfo());
```

## 🔄 **Best Practices**

### Development
- Always provide fallback components
- Test error scenarios thoroughly
- Monitor performance impact
- Use gradual migration in production

### Production
- Start with low-risk node types
- Monitor error rates closely
- Have rollback plan ready
- Communicate changes to users

### Monitoring
- Check migration panel regularly
- Set up error alerts
- Monitor performance metrics
- Review user feedback

## 🚨 **Emergency Procedures**

### Complete Rollback
```typescript
// Programmatic rollback
const { rollbackAll } = useNodeMigration();
rollbackAll('Emergency rollback due to critical issues');

// Environment variable override
REACT_APP_ENABLE_NEW_NODES=false
```

### Disable Specific Node Type
```typescript
const { disableNodeType } = useNodeMigration();
disableNodeType('ProblematicNodeType');
```

### Clear Migration State
```typescript
// Clear localStorage
localStorage.removeItem('kozmoai-node-migration-config');
// Reload application
window.location.reload();
```

## 📚 **API Reference**

### useNodeMigration Hook

```typescript
const {
  // Configuration
  config,
  isInitialized,
  
  // Migration decisions
  shouldUseMigratedNode,
  shouldUseMigratedCanvas,
  shouldUseMigratedPanel,
  
  // Control functions
  enableNodeType,
  disableNodeType,
  toggleGlobalMigration,
  rollbackNodeType,
  rollbackAll,
  
  // Monitoring
  recordError,
  recordSuccess,
  measureRenderTime,
  getDebugInfo,
  
  // Statistics
  migratedNodeCount,
  errorCount,
  rollbackCount
} = useNodeMigration();
```

### Component Props

```typescript
interface MigrationAwareNodeRendererProps extends NodeProps {
  nodeType: string;
  fallbackComponent?: React.ComponentType<NodeProps>;
}
```

## 🤝 **Contributing**

When adding new components to the migration system:

1. Create both new and fallback components
2. Add proper TypeScript types
3. Include error handling
4. Test migration scenarios
5. Update documentation

## 📄 **License**

This migration system is part of the KozmoAI project and follows the same license terms. 