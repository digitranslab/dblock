// Design System Utilities
// Helper functions and utilities for consistent design token usage

import { DESIGN_TOKENS, type DesignTokens } from './tokens';
import { cn } from '../utils/utils';

// Spacing utilities
export const spacing = {
  // Get spacing value by key
  get: (key: keyof DesignTokens['spacing'] | number): string => {
    if (typeof key === 'number') {
      return `${key}px`;
    }
    const value = DESIGN_TOKENS.spacing[key];
    return typeof value === 'object' ? `${value.width}px` : `${value}px`;
  },

  // Generate margin classes
  margin: (size: keyof DesignTokens['spacing'] | number) => ({
    margin: spacing.get(size)
  }),

  // Generate padding classes
  padding: (size: keyof DesignTokens['spacing'] | number) => ({
    padding: spacing.get(size)
  }),

  // Generate gap classes for flexbox/grid
  gap: (size: keyof DesignTokens['spacing'] | number) => ({
    gap: spacing.get(size)
  })
};

// Color utilities
export const colors = {
  // Get color value by category and key
  get: (category: keyof DesignTokens['colors'], key: string): string => {
    const colorCategory = DESIGN_TOKENS.colors[category] as Record<string, string>;
    return colorCategory[key] || '';
  },

  // Node color utilities
  node: {
    default: () => colors.get('node', 'default'),
    success: () => colors.get('node', 'success'),
    error: () => colors.get('node', 'error'),
    warning: () => colors.get('node', 'warning'),
    disabled: () => colors.get('node', 'disabled'),
    running: () => colors.get('node', 'running'),
    selected: () => colors.get('node', 'selected')
  },

  // Canvas color utilities
  canvas: {
    background: () => colors.get('canvas', 'background'),
    grid: () => colors.get('canvas', 'grid'),
    connection: () => colors.get('canvas', 'connection')
  },

  // Panel color utilities
  panel: {
    background: () => colors.get('panel', 'background'),
    border: () => colors.get('panel', 'border'),
    header: () => colors.get('panel', 'header')
  }
};

// Animation utilities
export const animations = {
  // Get animation duration
  duration: (key: keyof DesignTokens['animations']['duration']): number => {
    return DESIGN_TOKENS.animations.duration[key];
  },

  // Get animation easing
  easing: (key: keyof DesignTokens['animations']['easing']): string => {
    return DESIGN_TOKENS.animations.easing[key];
  },

  // Create transition styles
  transition: (
    property: string = 'all',
    duration: keyof DesignTokens['animations']['duration'] = 'normal',
    easing: keyof DesignTokens['animations']['easing'] = 'expo'
  ) => ({
    transition: `${property} ${animations.duration(duration)}ms ${animations.easing(easing)}`
  }),

  // Common transition presets
  presets: {
    smooth: () => animations.transition('all', 'normal', 'expo'),
    fast: () => animations.transition('all', 'fast', 'ease'),
    slow: () => animations.transition('all', 'slow', 'expo'),
    bounce: () => animations.transition('transform', 'normal', 'bounce')
  }
};

// Typography utilities
export const typography = {
  // Get font size
  size: (key: keyof DesignTokens['typography']['fontSize']): string => {
    return DESIGN_TOKENS.typography.fontSize[key];
  },

  // Get font weight
  weight: (key: keyof DesignTokens['typography']['fontWeight']): number => {
    return DESIGN_TOKENS.typography.fontWeight[key];
  },

  // Get line height
  lineHeight: (key: keyof DesignTokens['typography']['lineHeight']): number => {
    return DESIGN_TOKENS.typography.lineHeight[key];
  },

  // Create text styles
  style: (
    size: keyof DesignTokens['typography']['fontSize'],
    weight: keyof DesignTokens['typography']['fontWeight'] = 'regular',
    lineHeight: keyof DesignTokens['typography']['lineHeight'] = 'normal'
  ) => ({
    fontSize: typography.size(size),
    fontWeight: typography.weight(weight),
    lineHeight: typography.lineHeight(lineHeight)
  })
};

// Border radius utilities
export const borderRadius = {
  get: (key: keyof DesignTokens['borderRadius']): string => {
    return DESIGN_TOKENS.borderRadius[key];
  },

  // Common border radius styles
  styles: {
    sm: () => ({ borderRadius: borderRadius.get('sm') }),
    md: () => ({ borderRadius: borderRadius.get('md') }),
    lg: () => ({ borderRadius: borderRadius.get('lg') }),
    xl: () => ({ borderRadius: borderRadius.get('xl') }),
    full: () => ({ borderRadius: borderRadius.get('full') })
  }
};

// Shadow utilities
export const shadows = {
  get: (key: keyof DesignTokens['shadows']): string => {
    return DESIGN_TOKENS.shadows[key];
  },

  // Shadow styles
  styles: {
    sm: () => ({ boxShadow: shadows.get('sm') }),
    md: () => ({ boxShadow: shadows.get('md') }),
    lg: () => ({ boxShadow: shadows.get('lg') }),
    xl: () => ({ boxShadow: shadows.get('xl') })
  }
};

// Z-index utilities
export const zIndex = {
  get: (key: keyof DesignTokens['zIndex']): number => {
    return DESIGN_TOKENS.zIndex[key];
  }
};

// Component style builders
export const componentStyles = {
  // Node styles
  node: (status?: 'success' | 'error' | 'warning' | 'running' | 'disabled', selected?: boolean) => {
    const baseStyles = {
      width: spacing.get('node'),
      height: `${DESIGN_TOKENS.spacing.node.height}px`,
      backgroundColor: colors.node.default(),
      borderRadius: borderRadius.get('md'),
      border: '2px solid hsl(var(--color-foreground-xdark))',
      ...animations.presets.smooth(),
      cursor: 'pointer'
    };

    const statusStyles: Record<string, any> = {
      success: { borderColor: colors.node.success() },
      error: { borderColor: colors.node.error() },
      warning: { borderColor: colors.node.warning() },
      running: { 
        borderColor: colors.node.running(),
        animation: 'pulse 2s infinite'
      },
      disabled: { 
        borderColor: colors.node.disabled(),
        opacity: 0.6
      }
    };

    const selectedStyles = selected ? {
      boxShadow: `0 0 0 4px ${colors.node.selected()}`
    } : {};

    return {
      ...baseStyles,
      ...(status ? statusStyles[status] : {}),
      ...selectedStyles
    };
  },

  // Panel styles
  panel: () => ({
    width: spacing.get('panel'),
    backgroundColor: colors.panel.background(),
    borderLeft: `1px solid ${colors.panel.border()}`,
    ...shadows.styles.xl(),
    ...animations.presets.smooth()
  }),

  // Canvas styles
  canvas: () => ({
    backgroundColor: colors.canvas.background(),
    backgroundImage: `radial-gradient(circle, ${colors.canvas.grid()} 1px, transparent 1px)`,
    backgroundSize: `${spacing.get('grid')} ${spacing.get('grid')}`
  })
};

// Responsive utilities
export const responsive = {
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Media query helpers
  media: {
    up: (breakpoint: keyof typeof responsive.breakpoints) => 
      `@media (min-width: ${responsive.breakpoints[breakpoint]})`,
    down: (breakpoint: keyof typeof responsive.breakpoints) => 
      `@media (max-width: ${responsive.breakpoints[breakpoint]})`
  }
};

// CSS-in-JS style helpers
export const createStyles = {
  // Create component styles with design tokens
  component: (baseStyles: any, variants?: Record<string, any>) => {
    return (variant?: string) => ({
      ...baseStyles,
      ...(variant && variants?.[variant] ? variants[variant] : {})
    });
  },

  // Create theme-aware styles
  themed: (lightStyles: any, darkStyles: any) => {
    return {
      '@media (prefers-color-scheme: light)': lightStyles,
      '@media (prefers-color-scheme: dark)': darkStyles
    };
  }
};

// Class name builders for CSS modules
export const classNames = {
  // Build node class names
  node: (status?: string, selected?: boolean, disabled?: boolean) => {
    return cn(
      'workflow-node',
      status && `workflow-node--${status}`,
      selected && 'workflow-node--selected',
      disabled && 'workflow-node--disabled'
    );
  },

  // Build panel class names
  panel: (open?: boolean) => {
    return cn(
      'parameter-panel',
      open && 'parameter-panel--open'
    );
  },

  // Build canvas class names
  canvas: (readOnly?: boolean) => {
    return cn(
      'workflow-canvas',
      readOnly && 'workflow-canvas--readonly'
    );
  }
};

// Export all utilities
export const designSystem = {
  tokens: DESIGN_TOKENS,
  spacing,
  colors,
  animations,
  typography,
  borderRadius,
  shadows,
  zIndex,
  componentStyles,
  responsive,
  createStyles,
  classNames
}; 