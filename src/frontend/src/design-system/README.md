# KozmoAI Design System

A comprehensive design system foundation inspired by n8n's clean and minimalistic approach, built for KozmoAI's workflow interface modernization.

## 🎯 Overview

This design system provides:
- **Consistent Design Tokens**: Spacing, colors, typography, animations
- **Utility Functions**: Easy-to-use helpers for styling
- **React Hooks**: Type-safe hooks for component development
- **CSS Variables**: Direct CSS custom property access
- **Component Styles**: Pre-built style patterns for common components

## 📁 Structure

```
src/design-system/
├── tokens.ts           # Core design tokens
├── utils.ts            # Utility functions and helpers
├── hooks.ts            # React hooks for design system
├── design-tokens.css   # CSS custom properties
├── index.ts            # Main export file
├── examples/           # Example components
└── README.md           # This documentation
```

## 🚀 Quick Start

### 1. Import the Design System

```typescript
// Import everything
import designSystem, { 
  DESIGN_TOKENS, 
  useDesignTokens, 
  useInlineStyles,
  COMMON_VALUES 
} from '@/design-system';

// Import specific utilities
import { spacing, colors, animations } from '@/design-system';

// Import hooks
import { useDesignClasses, useComponentStyles } from '@/design-system';
```

### 2. Using CSS Classes (Recommended)

```tsx
import { useDesignClasses } from '@/design-system';

const MyNode = ({ status, selected }) => {
  const classes = useDesignClasses();
  
  return (
    <div className={`ds-node ${classes.node(status, selected)}`}>
      <span className="ds-text-sm ds-font-medium">My Node</span>
    </div>
  );
};
```

### 3. Using React Hooks

```tsx
import { useInlineStyles, useDesignValues } from '@/design-system';

const MyComponent = () => {
  const styles = useInlineStyles();
  const values = useDesignValues();
  
  return (
    <div style={styles.nodeStyle('success', true)}>
      Node with {values.nodeWidth}px width
    </div>
  );
};
```

### 4. Using CSS Variables

```css
.my-component {
  width: var(--ds-node-width);
  height: var(--ds-node-height);
  transition: var(--ds-transition-smooth);
  border-radius: var(--ds-border-radius-md);
}
```

## 🎨 Design Tokens

### Spacing System
Based on a 20px grid system, following n8n's approach:

```typescript
DESIGN_TOKENS.spacing = {
  grid: 20,           // Base grid unit
  node: { 
    width: 140,       // n8n-style compact width
    height: 80        // n8n-style compact height
  },
  panel: { width: 480 },
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32
}
```

### Color System
Semantic colors that adapt to the existing KozmoAI theme:

```typescript
DESIGN_TOKENS.colors = {
  node: {
    default: 'hsl(var(--color-node-background))',
    success: 'hsl(var(--color-success))',
    error: 'hsl(var(--color-danger))',
    warning: 'hsl(var(--color-warning))',
    running: 'hsl(var(--color-primary))',
    disabled: 'hsl(var(--color-foreground-base))'
  }
}
```

### Animation System
Smooth animations matching n8n's feel:

```typescript
DESIGN_TOKENS.animations = {
  duration: { fast: 150, normal: 300, slow: 500 },
  easing: {
    expo: 'cubic-bezier(0.19, 1, 0.22, 1)',  // n8n's signature easing
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
}
```

## 🔧 Available Utilities

### Spacing Utilities
```typescript
import { spacing } from '@/design-system';

spacing.get('md')        // Returns '12px'
spacing.get('node')      // Returns '140px'
spacing.margin('lg')     // Returns { margin: '16px' }
spacing.padding('sm')    // Returns { padding: '8px' }
spacing.gap('xl')        // Returns { gap: '20px' }
```

### Color Utilities
```typescript
import { colors } from '@/design-system';

colors.node.success()    // Returns success color
colors.canvas.background() // Returns canvas background
colors.panel.border()    // Returns panel border color
```

### Animation Utilities
```typescript
import { animations } from '@/design-system';

animations.transition('all', 'normal', 'expo')
animations.presets.smooth()  // Pre-configured smooth transition
animations.presets.fast()    // Pre-configured fast transition
```

## 🎣 React Hooks

### useDesignClasses
Build CSS class names with design system:

```tsx
const classes = useDesignClasses();
const nodeClass = classes.node('success', true, false); // status, selected, disabled
```

### useInlineStyles
Generate inline styles with design tokens:

```tsx
const styles = useInlineStyles();
const nodeStyle = styles.nodeStyle('error', true);
const panelStyle = styles.panelStyle();
```

### useDesignValues
Access common design values:

```tsx
const values = useDesignValues();
console.log(values.nodeWidth);        // 140
console.log(values.animationDuration); // 300
```

### useCSSVariables
Access CSS custom properties:

```tsx
const cssVars = useCSSVariables();
const style = { width: cssVars.nodeWidth }; // 'var(--ds-node-width)'
```

## 🎨 CSS Utility Classes

The design system provides utility classes prefixed with `ds-`:

### Spacing
```css
.ds-p-sm    /* padding: 8px */
.ds-m-lg    /* margin: 16px */
.ds-gap-md  /* gap: 12px */
```

### Typography
```css
.ds-text-sm      /* font-size: 12px */
.ds-font-medium  /* font-weight: 500 */
```

### Border Radius
```css
.ds-rounded-md   /* border-radius: 8px */
.ds-rounded-lg   /* border-radius: 12px */
```

### Shadows
```css
.ds-shadow-md    /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) */
.ds-shadow-xl    /* box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1) */
```

### Animations
```css
.ds-transition-smooth  /* transition: all 300ms cubic-bezier(0.19, 1, 0.22, 1) */
.ds-animate-fade-in    /* fade in animation */
```

## 📦 Component Styles

Pre-built component style patterns:

### Node Styles
```typescript
import { componentStyles } from '@/design-system';

const nodeStyle = componentStyles.node('success', true); // status, selected
```

### Panel Styles
```typescript
const panelStyle = componentStyles.panel();
```

### Canvas Styles
```typescript
const canvasStyle = componentStyles.canvas();
```

## 🌟 Migration Strategy

This design system is built for gradual migration:

1. **Phase 1**: Use alongside existing styles
2. **Phase 2**: Gradually replace custom styles with design system
3. **Phase 3**: Remove legacy styling once migration complete

### Feature Flag Support
```typescript
// Check if new design system should be used
const useNewDesign = process.env.REACT_APP_USE_NEW_DESIGN === 'true';

if (useNewDesign) {
  // Use design system components
} else {
  // Use legacy components
}
```

## 🔄 Integration with Existing Code

The design system is designed to work alongside existing KozmoAI styles:

- CSS custom properties integrate with existing theme system
- Utility classes use `ds-` prefix to avoid conflicts
- Semantic color tokens reference existing CSS variables
- Gradual adoption without breaking existing functionality

## 📚 Examples

See the `examples/` directory for:
- `ExampleNode.tsx` - Different ways to style nodes
- `DesignSystemDemo.tsx` - Interactive demonstration

## 🚀 Next Steps

After establishing this foundation:

1. **Phase 2**: Create new node components using design system
2. **Phase 3**: Build enhanced parameter panel
3. **Phase 4**: Update canvas and layout components
4. **Phase 5**: Complete migration and cleanup

## 💡 Best Practices

1. **Prefer CSS classes** over inline styles for better performance
2. **Use semantic tokens** (success, error) instead of raw colors
3. **Leverage hooks** for dynamic styling in React components
4. **Follow spacing scale** instead of arbitrary pixel values
5. **Use design system animations** for consistent feel

## 🤝 Contributing

When adding new design tokens or utilities:

1. Add to `tokens.ts` for core values
2. Add utilities to `utils.ts` for helper functions
3. Add hooks to `hooks.ts` for React integration
4. Update CSS variables in `design-tokens.css`
5. Document in this README 