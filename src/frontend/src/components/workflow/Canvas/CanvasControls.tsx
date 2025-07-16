// ============================================================================
// CanvasControls - Enhanced Canvas Controls Component
// Advanced controls for zoom, layout, and canvas management
// ============================================================================

import React, { memo, useCallback, useMemo } from 'react';
import { Controls, useReactFlow, ControlButton } from '@xyflow/react';
import { useDesignTokens } from '../../../design-system';
import './CanvasControls.scss';

// ============================================================================
// Types
// ============================================================================

export interface CanvasControlsProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showZoom?: boolean;
  showFitView?: boolean;
  showLock?: boolean;
  showMiniMap?: boolean;
  showFullscreen?: boolean;
  showLayout?: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  onLayoutChange?: (layout: 'auto' | 'manual' | 'grid') => void;
  onLockToggle?: (locked: boolean) => void;
  onMiniMapToggle?: (visible: boolean) => void;
  onFullscreenToggle?: (fullscreen: boolean) => void;
  isLocked?: boolean;
  isMiniMapVisible?: boolean;
  isFullscreen?: boolean;
  currentLayout?: 'auto' | 'manual' | 'grid';
}

// ============================================================================
// Icons (Simple SVG components)
// ============================================================================

const ZoomInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M6.5 1C3.46243 1 1 3.46243 1 6.5C1 9.53757 3.46243 12 6.5 12C7.74707 12 8.89075 11.6068 9.82129 10.9297L14.4453 15.5547C14.7383 15.8477 15.2129 15.8477 15.5059 15.5547C15.7988 15.2617 15.7988 14.7871 15.5059 14.4941L10.8809 9.86914C11.5581 8.93859 11.9512 7.79492 11.9512 6.54785C11.9512 3.51028 9.48877 1.04785 6.45117 1.04785L6.5 1ZM6.5 2.5C8.70508 2.5 10.5 4.29492 10.5 6.5C10.5 8.70508 8.70508 10.5 6.5 10.5C4.29492 10.5 2.5 8.70508 2.5 6.5C2.5 4.29492 4.29492 2.5 6.5 2.5ZM6.5 4C6.22386 4 6 4.22386 6 4.5V6H4.5C4.22386 6 4 6.22386 4 6.5C4 6.77614 4.22386 7 4.5 7H6V8.5C6 8.77614 6.22386 9 6.5 9C6.77614 9 7 8.77614 7 8.5V7H8.5C8.77614 7 9 6.77614 9 6.5C9 6.22386 8.77614 6 8.5 6H7V4.5C7 4.22386 6.77614 4 6.5 4Z"/>
  </svg>
);

const ZoomOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M6.5 1C3.46243 1 1 3.46243 1 6.5C1 9.53757 3.46243 12 6.5 12C7.74707 12 8.89075 11.6068 9.82129 10.9297L14.4453 15.5547C14.7383 15.8477 15.2129 15.8477 15.5059 15.5547C15.7988 15.2617 15.7988 14.7871 15.5059 14.4941L10.8809 9.86914C11.5581 8.93859 11.9512 7.79492 11.9512 6.54785C11.9512 3.51028 9.48877 1.04785 6.45117 1.04785L6.5 1ZM6.5 2.5C8.70508 2.5 10.5 4.29492 10.5 6.5C10.5 8.70508 8.70508 10.5 6.5 10.5C4.29492 10.5 2.5 8.70508 2.5 6.5C2.5 4.29492 4.29492 2.5 6.5 2.5ZM4.5 6C4.22386 6 4 6.22386 4 6.5C4 6.77614 4.22386 7 4.5 7H8.5C8.77614 7 9 6.77614 9 6.5C9 6.22386 8.77614 6 8.5 6H4.5Z"/>
  </svg>
);

const FitViewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2.5 2.5V5.5C2.5 5.77614 2.27614 6 2 6C1.72386 6 1.5 5.77614 1.5 5.5V2C1.5 1.44772 1.94772 1 2.5 1H6C6.27614 1 6.5 1.22386 6.5 1.5C6.5 1.77614 6.27614 2 6 2H2.5ZM10 2C9.72386 2 9.5 1.77614 9.5 1.5C9.5 1.22386 9.72386 1 10 1H13.5C14.0523 1 14.5 1.44772 14.5 2V5.5C14.5 5.77614 14.2761 6 14 6C13.7239 6 13.5 5.77614 13.5 5.5V2.5H10ZM2 10C2.27614 10 2.5 10.2239 2.5 10.5V13.5H6C6.27614 13.5 6.5 13.7761 6.5 14C6.5 14.2761 6.27614 14.5 6 14.5H2.5C1.94772 14.5 1.5 14.0523 1.5 13.5V10.5C1.5 10.2239 1.72386 10 2 10ZM14 10C14.2761 10 14.5 10.2239 14.5 10.5V13.5C14.5 14.0523 14.0523 14.5 13.5 14.5H10C9.72386 14.5 9.5 14.2761 9.5 14C9.5 13.7761 9.72386 13.5 10 13.5H13.5V10.5C13.5 10.2239 13.7239 10 14 10Z"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M4 7V5C4 2.79086 5.79086 1 8 1C10.2091 1 12 2.79086 12 5V7H12.5C13.3284 7 14 7.67157 14 8.5V13.5C14 14.3284 13.3284 15 12.5 15H3.5C2.67157 15 2 14.3284 2 13.5V8.5C2 7.67157 2.67157 7 3.5 7H4ZM5.5 7H10.5V5C10.5 3.61929 9.38071 2.5 8 2.5C6.61929 2.5 5.5 3.61929 5.5 5V7Z"/>
  </svg>
);

const UnlockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M4 7V5C4 2.79086 5.79086 1 8 1C10.2091 1 12 2.79086 12 5C12 5.27614 11.7761 5.5 11.5 5.5C11.2239 5.5 11 5.27614 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5V7H12.5C13.3284 7 14 7.67157 14 8.5V13.5C14 14.3284 13.3284 15 12.5 15H3.5C2.67157 15 2 14.3284 2 13.5V8.5C2 7.67157 2.67157 7 3.5 7H4Z"/>
  </svg>
);

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1 1H7V7H1V1ZM2.5 2.5V5.5H5.5V2.5H2.5ZM9 1H15V7H9V1ZM10.5 2.5V5.5H13.5V2.5H10.5ZM1 9H7V15H1V9ZM2.5 10.5V13.5H5.5V10.5H2.5ZM9 9H15V15H9V9ZM10.5 10.5V13.5H13.5V10.5H10.5Z"/>
  </svg>
);

const FullscreenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1.5 1.5V5C1.5 5.27614 1.27614 5.5 1 5.5C0.723858 5.5 0.5 5.27614 0.5 5V1C0.5 0.447715 0.947715 0 1.5 0H6C6.27614 0 6.5 0.223858 6.5 0.5C6.5 0.776142 6.27614 1 6 1H1.5ZM10 1C9.72386 1 9.5 0.776142 9.5 0.5C9.5 0.223858 9.72386 0 10 0H14.5C15.0523 0 15.5 0.447715 15.5 1V5C15.5 5.27614 15.2761 5.5 15 5.5C14.7239 5.5 14.5 5.27614 14.5 5V1.5H10ZM1 10.5C1.27614 10.5 1.5 10.7239 1.5 11V14.5H6C6.27614 14.5 6.5 14.7761 6.5 15C6.5 15.2761 6.27614 15.5 6 15.5H1.5C0.947715 15.5 0.5 15.0523 0.5 14.5V11C0.5 10.7239 0.723858 10.5 1 10.5ZM15 10.5C15.2761 10.5 15.5 10.7239 15.5 11V14.5C15.5 15.0523 15.0523 15.5 14.5 15.5H10C9.72386 15.5 9.5 15.2761 9.5 15C9.5 14.7761 9.72386 14.5 10 14.5H14.5V11C14.5 10.7239 14.7239 10.5 15 10.5Z"/>
  </svg>
);

const MapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1 3L5.5 1L10.5 3L15 1V13L10.5 15L5.5 13L1 15V3ZM2.5 4.5V12.5L4.5 11.5V3.5L2.5 4.5ZM6 3.5V11.5L9.5 12.5V4.5L6 3.5ZM11 4.5V12.5L13.5 11.5V3.5L11 4.5Z"/>
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const CanvasControls: React.FC<CanvasControlsProps> = memo(({
  position = 'bottom-left',
  showZoom = true,
  showFitView = true,
  showLock = false,
  showMiniMap = false,
  showFullscreen = false,
  showLayout = false,
  orientation = 'vertical',
  className = '',
  onLayoutChange,
  onLockToggle,
  onMiniMapToggle,
  onFullscreenToggle,
  isLocked = false,
  isMiniMapVisible = true,
  isFullscreen = false,
  currentLayout = 'manual'
}) => {
  const tokens = useDesignTokens();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 300 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 300 });
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    fitView({ duration: 300, padding: 0.1 });
  }, [fitView]);

  const handleLockToggle = useCallback(() => {
    const newLocked = !isLocked;
    onLockToggle?.(newLocked);
  }, [isLocked, onLockToggle]);

  const handleMiniMapToggle = useCallback(() => {
    const newVisible = !isMiniMapVisible;
    onMiniMapToggle?.(newVisible);
  }, [isMiniMapVisible, onMiniMapToggle]);

  const handleFullscreenToggle = useCallback(() => {
    const newFullscreen = !isFullscreen;
    onFullscreenToggle?.(newFullscreen);
  }, [isFullscreen, onFullscreenToggle]);

  const handleLayoutChange = useCallback(() => {
    const layouts: Array<'auto' | 'manual' | 'grid'> = ['manual', 'auto', 'grid'];
    const currentIndex = layouts.indexOf(currentLayout);
    const nextLayout = layouts[(currentIndex + 1) % layouts.length];
    onLayoutChange?.(nextLayout);
  }, [currentLayout, onLayoutChange]);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const controlsClasses = useMemo(() => {
    const classes = ['canvas-controls'];
    if (className) classes.push(className);
    if (orientation === 'horizontal') classes.push('canvas-controls--horizontal');
    return classes.join(' ');
  }, [className, orientation]);

  const positionClasses = useMemo(() => {
    return `canvas-controls--${position}`;
  }, [position]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`${controlsClasses} ${positionClasses}`}>
      <Controls
        position={position}
        orientation={orientation}
        showZoom={false}
        showFitView={false}
        showInteractive={false}
        className="canvas-controls__base"
      >
        {/* Zoom Controls */}
        {showZoom && (
          <>
            <ControlButton
              onClick={handleZoomIn}
              title="Zoom In"
              aria-label="Zoom In"
              className="canvas-controls__button"
            >
              <ZoomInIcon />
            </ControlButton>
            <ControlButton
              onClick={handleZoomOut}
              title="Zoom Out"
              aria-label="Zoom Out"
              className="canvas-controls__button"
            >
              <ZoomOutIcon />
            </ControlButton>
          </>
        )}

        {/* Fit View */}
        {showFitView && (
          <ControlButton
            onClick={handleFitView}
            title="Fit View"
            aria-label="Fit View"
            className="canvas-controls__button"
          >
            <FitViewIcon />
          </ControlButton>
        )}

        {/* Lock Toggle */}
        {showLock && (
          <ControlButton
            onClick={handleLockToggle}
            title={isLocked ? "Unlock Canvas" : "Lock Canvas"}
            aria-label={isLocked ? "Unlock Canvas" : "Lock Canvas"}
            className={`canvas-controls__button ${isLocked ? 'canvas-controls__button--active' : ''}`}
          >
            {isLocked ? <LockIcon /> : <UnlockIcon />}
          </ControlButton>
        )}

        {/* Layout Toggle */}
        {showLayout && (
          <ControlButton
            onClick={handleLayoutChange}
            title={`Layout: ${currentLayout}`}
            aria-label={`Switch Layout (Current: ${currentLayout})`}
            className="canvas-controls__button"
          >
            <GridIcon />
          </ControlButton>
        )}

        {/* MiniMap Toggle */}
        {showMiniMap && (
          <ControlButton
            onClick={handleMiniMapToggle}
            title={isMiniMapVisible ? "Hide MiniMap" : "Show MiniMap"}
            aria-label={isMiniMapVisible ? "Hide MiniMap" : "Show MiniMap"}
            className={`canvas-controls__button ${isMiniMapVisible ? 'canvas-controls__button--active' : ''}`}
          >
            <MapIcon />
          </ControlButton>
        )}

        {/* Fullscreen Toggle */}
        {showFullscreen && (
          <ControlButton
            onClick={handleFullscreenToggle}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="canvas-controls__button"
          >
            <FullscreenIcon />
          </ControlButton>
        )}
      </Controls>
    </div>
  );
});

CanvasControls.displayName = 'CanvasControls';

// ============================================================================
// Default Export
// ============================================================================

export default CanvasControls; 