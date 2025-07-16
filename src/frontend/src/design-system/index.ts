// Design System - Main Export
// Centralized export for all design system components, tokens, and utilities

// Core design tokens
export {
  DESIGN_TOKENS,
  CSS_VARIABLES,
  getSpacing,
  getColor,
  getAnimation,
  type SpacingKey,
  type ColorKey,
  type AnimationKey
} from './tokens';

// Design system utilities
export {
  designSystem,
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
} from './utils';

// Design system hooks
export {
  useDesignTokens,
  useDesignSystem,
  useComponentStyles,
  useSpacing,
  useColors,
  useAnimations,
  useTypography,
  useResponsive,
  useDesignClasses,
  useThemeStyles,
  useCSSVariables,
  useDesignValues,
  useInlineStyles
} from './hooks';

// Re-export the main design system object as default
export { designSystem as default } from './utils';

// Type exports for TypeScript support
export type { DesignTokens } from './tokens';

// Import design system for internal use
import { designSystem } from './utils';
import { DESIGN_TOKENS } from './tokens';

// Common utility exports for convenience
export const {
  tokens,
  spacing: ds_spacing,
  colors: ds_colors,
  animations: ds_animations,
  typography: ds_typography,
  componentStyles: ds_componentStyles
} = designSystem;

// Quick access to commonly used values
export const COMMON_VALUES = {
  // Node dimensions (most frequently used)
  NODE_WIDTH: DESIGN_TOKENS.spacing.node.width,
  NODE_HEIGHT: DESIGN_TOKENS.spacing.node.height,
  PANEL_WIDTH: DESIGN_TOKENS.spacing.panel.width,
  
  // Grid system
  GRID_SIZE: DESIGN_TOKENS.spacing.grid,
  
  // Animation duration (most common)
  ANIMATION_DURATION: DESIGN_TOKENS.animations.duration.normal,
  ANIMATION_EASING: DESIGN_TOKENS.animations.easing.expo,
  
  // Common border radius
  BORDER_RADIUS: DESIGN_TOKENS.borderRadius.md,
  
  // Z-index values
  MODAL_Z_INDEX: DESIGN_TOKENS.zIndex.modal,
  PANEL_Z_INDEX: DESIGN_TOKENS.zIndex.fixed
} as const; 