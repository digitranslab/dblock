// Design System Hooks
// React hooks for using design tokens and utilities in components

import { useCallback, useMemo } from 'react';
import { 
  DESIGN_TOKENS, 
  designSystem, 
  type DesignTokens 
} from './index';

// Hook for accessing design tokens
export const useDesignTokens = () => {
  return useMemo(() => DESIGN_TOKENS, []);
};

// Hook for accessing design system utilities
export const useDesignSystem = () => {
  return useMemo(() => designSystem, []);
};

// Hook for building component styles with design tokens
export const useComponentStyles = () => {
  const { componentStyles } = useDesignSystem();
  
  return useMemo(() => ({
    node: componentStyles.node,
    panel: componentStyles.panel,
    canvas: componentStyles.canvas
  }), [componentStyles]);
};

// Hook for spacing utilities
export const useSpacing = () => {
  const { spacing } = useDesignSystem();
  
  return useMemo(() => ({
    get: spacing.get,
    margin: spacing.margin,
    padding: spacing.padding,
    gap: spacing.gap
  }), [spacing]);
};

// Hook for color utilities
export const useColors = () => {
  const { colors } = useDesignSystem();
  
  return useMemo(() => ({
    get: colors.get,
    node: colors.node,
    canvas: colors.canvas,
    panel: colors.panel
  }), [colors]);
};

// Hook for animation utilities
export const useAnimations = () => {
  const { animations } = useDesignSystem();
  
  return useMemo(() => ({
    duration: animations.duration,
    easing: animations.easing,
    transition: animations.transition,
    presets: animations.presets
  }), [animations]);
};

// Hook for typography utilities
export const useTypography = () => {
  const { typography } = useDesignSystem();
  
  return useMemo(() => ({
    size: typography.size,
    weight: typography.weight,
    lineHeight: typography.lineHeight,
    style: typography.style
  }), [typography]);
};

// Hook for responsive utilities
export const useResponsive = () => {
  const { responsive } = useDesignSystem();
  
  return useMemo(() => ({
    breakpoints: responsive.breakpoints,
    media: responsive.media
  }), [responsive]);
};

// Hook for building CSS classes with design system
export const useDesignClasses = () => {
  const { classNames } = useDesignSystem();
  
  return useMemo(() => ({
    node: classNames.node,
    panel: classNames.panel,
    canvas: classNames.canvas
  }), [classNames]);
};

// Hook for creating theme-aware styles
export const useThemeStyles = () => {
  const { createStyles } = useDesignSystem();
  
  const createThemeAware = useCallback((lightStyles: any, darkStyles: any) => {
    return createStyles.themed(lightStyles, darkStyles);
  }, [createStyles]);
  
  const createComponent = useCallback((baseStyles: any, variants?: Record<string, any>) => {
    return createStyles.component(baseStyles, variants);
  }, [createStyles]);
  
  return useMemo(() => ({
    themed: createThemeAware,
    component: createComponent
  }), [createThemeAware, createComponent]);
};

// Hook for getting CSS custom properties
export const useCSSVariables = () => {
  return useMemo(() => ({
    // Node variables
    nodeWidth: 'var(--ds-node-width)',
    nodeHeight: 'var(--ds-node-height)',
    
    // Panel variables
    panelWidth: 'var(--ds-panel-width)',
    
    // Animation variables
    transitionSmooth: 'var(--ds-transition-smooth)',
    transitionFast: 'var(--ds-transition-fast)',
    
    // Spacing variables
    gridSize: 'var(--ds-grid-size)',
    spacingMd: 'var(--ds-spacing-md)',
    
    // Shadow variables
    shadowMd: 'var(--ds-shadow-md)',
    shadowXl: 'var(--ds-shadow-xl)',
    
    // Border radius variables
    borderRadiusMd: 'var(--ds-border-radius-md)',
    borderRadiusLg: 'var(--ds-border-radius-lg)'
  }), []);
};

// Hook for getting common design values
export const useDesignValues = () => {
  const tokens = useDesignTokens();
  
  return useMemo(() => ({
    // Most commonly used values
    nodeWidth: tokens.spacing.node.width,
    nodeHeight: tokens.spacing.node.height,
    panelWidth: tokens.spacing.panel.width,
    gridSize: tokens.spacing.grid,
    animationDuration: tokens.animations.duration.normal,
    animationEasing: tokens.animations.easing.expo,
    borderRadius: tokens.borderRadius.md
  }), [tokens]);
};

// Hook for building inline styles with design tokens
export const useInlineStyles = () => {
  const spacing = useSpacing();
  const colors = useColors();
  const animations = useAnimations();
  const typography = useTypography();
  
  return useMemo(() => ({
    // Quick style builders
    nodeStyle: (status?: string, selected?: boolean) => ({
      width: spacing.get('node'),
      height: `${DESIGN_TOKENS.spacing.node.height}px`,
      backgroundColor: colors.node.default(),
      transition: animations.presets.smooth().transition,
      borderRadius: DESIGN_TOKENS.borderRadius.md,
      ...(status === 'success' && { borderColor: colors.node.success() }),
      ...(status === 'error' && { borderColor: colors.node.error() }),
      ...(status === 'running' && { borderColor: colors.node.running() }),
      ...(selected && { boxShadow: `0 0 0 4px ${colors.node.selected()}` })
    }),
    
    panelStyle: () => ({
      width: spacing.get('panel'),
      backgroundColor: colors.panel.background(),
      borderLeft: `1px solid ${colors.panel.border()}`,
      transition: animations.presets.smooth().transition
    }),
    
    textStyle: (size: keyof DesignTokens['typography']['fontSize'] = 'md') => ({
      fontSize: typography.size(size),
      fontWeight: typography.weight('medium'),
      lineHeight: typography.lineHeight('normal')
    })
  }), [spacing, colors, animations, typography]);
}; 