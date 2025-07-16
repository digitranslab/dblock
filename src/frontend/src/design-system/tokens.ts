// Design Tokens - n8n-inspired Design System Foundation
// This file contains the core design tokens for KozmoAI's modernized UI

export const DESIGN_TOKENS = {
  // Spacing system based on n8n's grid approach
  spacing: {
    grid: 20, // Base grid unit (20px)
    node: { 
      width: 140,  // n8n-style compact node width
      height: 80   // n8n-style compact node height
    },
    panel: { 
      width: 480   // Enhanced parameter panel width
    },
    // Spacing scale
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32
  },

  // Color system aligned with n8n's approach
  colors: {
    node: {
      default: 'hsl(var(--color-node-background))',
      success: 'hsl(var(--color-success))',
      error: 'hsl(var(--color-danger))',
      warning: 'hsl(var(--color-warning))',
      disabled: 'hsl(var(--color-foreground-base))',
      running: 'hsl(var(--color-primary))',
      selected: 'hsl(var(--color-primary-transparent))'
    },
    canvas: {
      background: 'hsl(var(--color-canvas-background))',
      grid: 'hsl(var(--color-canvas-grid))',
      connection: 'hsl(var(--color-connection-default))'
    },
    panel: {
      background: 'hsl(var(--color-background-base))',
      border: 'hsl(var(--color-border-base))',
      header: 'hsl(var(--color-background-light))'
    }
  },

  // Animation system matching n8n's smooth interactions
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    },
    easing: {
      // n8n's signature easing
      expo: 'cubic-bezier(0.19, 1, 0.22, 1)',
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },

  // Typography system
  typography: {
    fontSize: {
      xs: '11px',
      sm: '12px',
      md: '14px',
      lg: '16px',
      xl: '18px'
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      loose: 1.6
    }
  },

  // Border radius system
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%'
  },

  // Shadow system for depth
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
  },

  // Z-index system
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060
  }
} as const;

// Type definitions for better TypeScript support
export type DesignTokens = typeof DESIGN_TOKENS;
export type SpacingKey = keyof typeof DESIGN_TOKENS.spacing;
export type ColorKey = keyof typeof DESIGN_TOKENS.colors;
export type AnimationKey = keyof typeof DESIGN_TOKENS.animations;

// Helper functions for accessing tokens
export const getSpacing = (key: SpacingKey | number): string => {
  if (typeof key === 'number') {
    return `${key}px`;
  }
  const value = DESIGN_TOKENS.spacing[key];
  return typeof value === 'object' ? `${value.width}px` : `${value}px`;
};

export const getColor = (category: keyof typeof DESIGN_TOKENS.colors, key: string): string => {
  const colorCategory = DESIGN_TOKENS.colors[category] as Record<string, string>;
  return colorCategory[key] || '';
};

export const getAnimation = (property: 'duration' | 'easing', key: string): string | number => {
  const animationCategory = DESIGN_TOKENS.animations[property] as Record<string, string | number>;
  return animationCategory[key] || '';
};

// CSS Custom Properties mapping
export const CSS_VARIABLES = {
  // Node dimensions
  '--node-width': `${DESIGN_TOKENS.spacing.node.width}px`,
  '--node-height': `${DESIGN_TOKENS.spacing.node.height}px`,
  '--panel-width': `${DESIGN_TOKENS.spacing.panel.width}px`,
  
  // Animation properties
  '--animation-duration': `${DESIGN_TOKENS.animations.duration.normal}ms`,
  '--animation-easing': DESIGN_TOKENS.animations.easing.expo,
  
  // Grid system
  '--grid-size': `${DESIGN_TOKENS.spacing.grid}px`,
  
  // Border radius
  '--border-radius-node': DESIGN_TOKENS.borderRadius.md,
  '--border-radius-panel': DESIGN_TOKENS.borderRadius.lg
} as const; 