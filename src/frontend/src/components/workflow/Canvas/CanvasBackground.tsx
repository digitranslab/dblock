// ============================================================================
// CanvasBackground - Enhanced Background Component
// Advanced background patterns and grid systems for workflow canvas
// ============================================================================

import React, { memo, useMemo } from 'react';
import { Background, BackgroundVariant } from '@xyflow/react';
import { useDesignTokens } from '../../../design-system';
import './CanvasBackground.scss';

// ============================================================================
// Types
// ============================================================================

export interface CanvasBackgroundProps {
  variant?: 'dots' | 'lines' | 'cross' | 'grid' | 'none';
  gap?: number;
  size?: number;
  color?: string;
  opacity?: number;
  animated?: boolean;
  className?: string;
}

// ============================================================================
// Background Patterns
// ============================================================================

const BACKGROUND_VARIANTS = {
  dots: BackgroundVariant.Dots,
  lines: BackgroundVariant.Lines,
  cross: BackgroundVariant.Cross,
} as const;

// ============================================================================
// Component
// ============================================================================

export const CanvasBackground: React.FC<CanvasBackgroundProps> = memo(({
  variant = 'dots',
  gap = 20,
  size = 1,
  color,
  opacity = 0.3,
  animated = false,
  className = ''
}) => {
  const tokens = useDesignTokens();

  // ============================================================================
  // Computed Values
  // ============================================================================

  const backgroundProps = useMemo(() => {
    // Use design system colors with fallbacks
    const defaultColor = color || tokens.colors.panel.border || '#e2e8f0';
    
    const baseProps = {
      gap,
      size,
      color: defaultColor,
      style: {
        opacity,
        '--background-animation': animated ? 'backgroundPulse 3s ease-in-out infinite' : 'none'
      } as React.CSSProperties
    };

    // Handle different variants
    switch (variant) {
      case 'dots':
        return {
          ...baseProps,
          variant: BACKGROUND_VARIANTS.dots
        };
      
      case 'lines':
        return {
          ...baseProps,
          variant: BACKGROUND_VARIANTS.lines
        };
      
      case 'cross':
        return {
          ...baseProps,
          variant: BACKGROUND_VARIANTS.cross
        };
      
      case 'grid':
        // Custom grid implementation using CSS
        return {
          ...baseProps,
          variant: BACKGROUND_VARIANTS.dots, // Fallback to dots
          className: 'canvas-background--grid'
        };
      
      case 'none':
        return null;
      
      default:
        return {
          ...baseProps,
          variant: BACKGROUND_VARIANTS.dots
        };
    }
  }, [variant, gap, size, color, opacity, animated, tokens.colors.panel.border]);

  const containerClasses = useMemo(() => {
    const classes = ['canvas-background'];
    if (className) classes.push(className);
    if (animated) classes.push('canvas-background--animated');
    if (variant === 'grid') classes.push('canvas-background--grid');
    return classes.join(' ');
  }, [className, animated, variant]);

  // ============================================================================
  // Custom Grid Background
  // ============================================================================

  if (variant === 'grid') {
    return (
      <div 
        className={containerClasses}
        style={{
          '--grid-gap': `${gap}px`,
          '--grid-color': color || tokens.colors.panel.border || '#e2e8f0',
          '--grid-opacity': opacity,
          '--grid-size': `${size}px`
        } as React.CSSProperties}
      >
        <div className="canvas-background__grid-overlay" />
      </div>
    );
  }

  // ============================================================================
  // No Background
  // ============================================================================

  if (variant === 'none' || !backgroundProps) {
    return (
      <div className={`canvas-background canvas-background--none ${className}`} />
    );
  }

  // ============================================================================
  // ReactFlow Background
  // ============================================================================

  return (
    <div className={containerClasses}>
      <Background
        {...backgroundProps}
        className="canvas-background__reactflow"
      />
    </div>
  );
});

CanvasBackground.displayName = 'CanvasBackground';

// ============================================================================
// Enhanced Background with Zones
// ============================================================================

export interface CanvasBackgroundZone {
  id: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color?: string;
  opacity?: number;
  pattern?: 'dots' | 'lines' | 'solid';
  label?: string;
}

export interface EnhancedCanvasBackgroundProps extends CanvasBackgroundProps {
  zones?: CanvasBackgroundZone[];
  showZoneLabels?: boolean;
}

export const EnhancedCanvasBackground: React.FC<EnhancedCanvasBackgroundProps> = memo(({
  zones = [],
  showZoneLabels = false,
  ...backgroundProps
}) => {
  const tokens = useDesignTokens();

  return (
    <div className="canvas-background--enhanced">
      {/* Base background */}
      <CanvasBackground {...backgroundProps} />
      
      {/* Zone overlays */}
      {zones.length > 0 && (
        <div className="canvas-background__zones">
          {zones.map(zone => (
            <div
              key={zone.id}
              className="canvas-background__zone"
              style={{
                left: zone.bounds.x,
                top: zone.bounds.y,
                width: zone.bounds.width,
                height: zone.bounds.height,
                backgroundColor: zone.color || tokens.colors.panel.background || '#f8fafc',
                opacity: zone.opacity || 0.1,
                '--zone-pattern': zone.pattern || 'solid'
              } as React.CSSProperties}
            >
              {showZoneLabels && zone.label && (
                <div className="canvas-background__zone-label">
                  {zone.label}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

EnhancedCanvasBackground.displayName = 'EnhancedCanvasBackground';

// ============================================================================
// Default Export
// ============================================================================

export default CanvasBackground; 