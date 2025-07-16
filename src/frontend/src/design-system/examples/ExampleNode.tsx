// Example Node Component
// Demonstrates how to use the new design system in a React component

import React from 'react';
import { 
  useDesignClasses, 
  useInlineStyles, 
  useCSSVariables,
  COMMON_VALUES 
} from '../index';

interface ExampleNodeProps {
  id: string;
  label: string;
  status?: 'idle' | 'success' | 'error' | 'warning' | 'running';
  selected?: boolean;
  disabled?: boolean;
  onClick?: (id: string) => void;
}

export const ExampleNode: React.FC<ExampleNodeProps> = ({
  id,
  label,
  status = 'idle',
  selected = false,
  disabled = false,
  onClick
}) => {
  // Using design system hooks
  const classes = useDesignClasses();
  const styles = useInlineStyles();
  const cssVars = useCSSVariables();

  // Method 1: Using CSS classes (recommended for most cases)
  const handleClickWithClasses = () => {
    onClick?.(id);
  };

  // Method 2: Using inline styles (for dynamic styling)
  const inlineStyle = styles.nodeStyle(status, selected);

  // Method 3: Using CSS variables directly
  const cssVariableStyle = {
    width: cssVars.nodeWidth,
    height: cssVars.nodeHeight,
    borderRadius: cssVars.borderRadiusMd,
    transition: cssVars.transitionSmooth
  };

  return (
    <div className="example-nodes-container ds-gap-lg">
      {/* Example 1: Using CSS classes (recommended) */}
      <div
        className={`ds-node ${classes.node(status, selected, disabled)} ds-transition-smooth`}
        onClick={handleClickWithClasses}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        <div className="ds-text-sm ds-font-medium">
          {label} (CSS Classes)
        </div>
      </div>

      {/* Example 2: Using inline styles */}
      <div
        style={{
          ...inlineStyle,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        }}
        onClick={() => !disabled && onClick?.(id)}
      >
        <div style={styles.textStyle('sm')}>
          {label} (Inline Styles)
        </div>
      </div>

      {/* Example 3: Using CSS variables */}
      <div
        style={{
          ...cssVariableStyle,
          backgroundColor: 'hsl(var(--color-node-background))',
          border: '2px solid hsl(var(--color-foreground-xdark))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        }}
        onClick={() => !disabled && onClick?.(id)}
      >
        <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>
          {label} (CSS Variables)
        </span>
      </div>

      {/* Example 4: Using design tokens directly */}
      <div
        style={{
          width: COMMON_VALUES.NODE_WIDTH,
          height: COMMON_VALUES.NODE_HEIGHT,
          borderRadius: COMMON_VALUES.BORDER_RADIUS,
          backgroundColor: 'hsl(var(--color-node-background))',
          border: '2px solid hsl(var(--color-foreground-xdark))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: `all ${COMMON_VALUES.ANIMATION_DURATION}ms ${COMMON_VALUES.ANIMATION_EASING}`,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        }}
        onClick={() => !disabled && onClick?.(id)}
      >
        <span style={{ fontSize: '12px', fontWeight: 500 }}>
          {label} (Tokens)
        </span>
      </div>
    </div>
  );
};

// Example usage component
export const DesignSystemDemo: React.FC = () => {
  const handleNodeClick = (id: string) => {
    console.log('Node clicked:', id);
  };

  return (
    <div className="design-system-demo ds-p-xl">
      <h2 className="ds-text-lg ds-font-bold ds-m-md">
        Design System Examples
      </h2>
      
      <div className="ds-gap-lg" style={{ display: 'flex', flexDirection: 'column' }}>
        <ExampleNode
          id="example-1"
          label="Success Node"
          status="success"
          onClick={handleNodeClick}
        />
        
        <ExampleNode
          id="example-2"
          label="Error Node"
          status="error"
          selected={true}
          onClick={handleNodeClick}
        />
        
        <ExampleNode
          id="example-3"
          label="Running Node"
          status="running"
          onClick={handleNodeClick}
        />
        
        <ExampleNode
          id="example-4"
          label="Disabled Node"
          disabled={true}
          onClick={handleNodeClick}
        />
      </div>

      <div className="ds-mt-xl">
        <h3 className="ds-text-md ds-font-semibold ds-mb-md">
          Design Token Values:
        </h3>
        <pre className="ds-text-xs ds-p-md ds-rounded-md" style={{ 
          backgroundColor: 'hsl(var(--color-background-light))',
          border: '1px solid hsl(var(--color-border-base))'
        }}>
          {JSON.stringify(COMMON_VALUES, null, 2)}
        </pre>
      </div>
    </div>
  );
}; 