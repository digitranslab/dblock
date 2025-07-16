// ============================================================================
// Step 4.2 Example - Layout System Demo
// Comprehensive demonstration of enhanced canvas layout features
// ============================================================================

import React, { useState, useCallback, useMemo } from 'react';
import { Node, Edge, MarkerType } from '@xyflow/react';
import { WorkflowCanvas } from './WorkflowCanvas';
import { CanvasBackground, EnhancedCanvasBackground, CanvasBackgroundZone } from './CanvasBackground';
import { CanvasControls } from './CanvasControls';
import './Step4_2_Example.scss';

// ============================================================================
// Sample Data with Enhanced Layout Features
// ============================================================================

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'workflowNode',
    position: { x: 100, y: 100 },
    data: {
      label: 'Start Trigger',
      type: 'trigger',
      icon: 'play',
      status: 'idle',
      description: 'Manual trigger to start the workflow',
      zone: 'input'
    }
  },
  {
    id: '2',
    type: 'workflowNode',
    position: { x: 300, y: 100 },
    data: {
      label: 'HTTP Request',
      type: 'action',
      icon: 'globe',
      status: 'success',
      description: 'Make HTTP request to external API',
      zone: 'processing',
      parameters: {
        url: 'https://api.example.com/data',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    }
  },
  {
    id: '3',
    type: 'workflowNode',
    position: { x: 500, y: 100 },
    data: {
      label: 'Transform Data',
      type: 'transform',
      icon: 'filter',
      status: 'running',
      description: 'Transform and filter API response',
      zone: 'processing',
      parameters: {
        transformation: 'json',
        filter: 'item => item.active === true'
      }
    }
  },
  {
    id: '4',
    type: 'workflowNode',
    position: { x: 700, y: 100 },
    data: {
      label: 'Send Email',
      type: 'action',
      icon: 'mail',
      status: 'error',
      description: 'Send notification email',
      zone: 'output',
      parameters: {
        to: 'admin@example.com',
        subject: 'Workflow Complete',
        template: 'notification'
      }
    }
  },
  {
    id: '5',
    type: 'workflowNode',
    position: { x: 400, y: 250 },
    data: {
      label: 'Log Results',
      type: 'utility',
      icon: 'file-text',
      status: 'idle',
      description: 'Log workflow results to database',
      zone: 'output'
    }
  },
  {
    id: '6',
    type: 'workflowNode',
    position: { x: 150, y: 300 },
    data: {
      label: 'Database Query',
      type: 'data',
      icon: 'database',
      status: 'success',
      description: 'Query user data from database',
      zone: 'processing'
    }
  }
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'workflowConnection',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    }
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'workflowConnection',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    }
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'workflowConnection',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    }
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    type: 'workflowConnection',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    }
  },
  {
    id: 'e6-3',
    source: '6',
    target: '3',
    type: 'workflowConnection',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    }
  }
];

// Background zones for enhanced layout
const backgroundZones: CanvasBackgroundZone[] = [
  {
    id: 'input-zone',
    bounds: { x: 50, y: 50, width: 200, height: 150 },
    color: '#e0f2fe',
    opacity: 0.3,
    pattern: 'dots',
    label: 'Input Zone'
  },
  {
    id: 'processing-zone',
    bounds: { x: 270, y: 50, width: 400, height: 300 },
    color: '#fef3c7',
    opacity: 0.2,
    pattern: 'lines',
    label: 'Processing Zone'
  },
  {
    id: 'output-zone',
    bounds: { x: 680, y: 50, width: 200, height: 300 },
    color: '#dcfce7',
    opacity: 0.3,
    pattern: 'solid',
    label: 'Output Zone'
  }
];

// ============================================================================
// Event Log Interface
// ============================================================================

interface LayoutEvent {
  id: string;
  timestamp: Date;
  type: 'layout' | 'background' | 'control' | 'interaction';
  details: string;
}

// ============================================================================
// Example Component
// ============================================================================

export const Step4_2_Example: React.FC = () => {
  // State management
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [eventLog, setEventLog] = useState<LayoutEvent[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Layout system state
  const [currentLayout, setCurrentLayout] = useState<'auto' | 'manual' | 'grid'>('manual');
  const [backgroundVariant, setBackgroundVariant] = useState<'dots' | 'lines' | 'cross' | 'grid' | 'none'>('dots');
  const [showZones, setShowZones] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isMiniMapVisible, setIsMiniMapVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [backgroundAnimated, setBackgroundAnimated] = useState(false);

  // Event logging utility
  const logEvent = useCallback((type: LayoutEvent['type'], details: string) => {
    const event: LayoutEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      details
    };
    setEventLog(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events
  }, []);

  // ============================================================================
  // Canvas Event Handlers
  // ============================================================================

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (nodeId) {
      const node = nodes.find(n => n.id === nodeId);
      logEvent('interaction', `Selected node: ${node?.data?.label || nodeId}`);
    } else {
      logEvent('interaction', 'Deselected all nodes');
    }
  }, [nodes, logEvent]);

  const handleNodeMove = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId 
          ? { ...node, position }
          : node
      )
    );
    
    const node = nodes.find(n => n.id === nodeId);
    logEvent('interaction', `Moved ${node?.data?.label || nodeId} to (${Math.round(position.x)}, ${Math.round(position.y)})`);
  }, [nodes, logEvent]);

  const handleConnectionCreate = useCallback((connection: Edge) => {
    setEdges(prevEdges => [...prevEdges, connection]);
    
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    logEvent('interaction', `Connected ${sourceNode?.data?.label || connection.source} → ${targetNode?.data?.label || connection.target}`);
  }, [nodes, logEvent]);

  const handleConnectionDelete = useCallback((connectionId: string) => {
    const edge = edges.find(e => e.id === connectionId);
    setEdges(prevEdges => prevEdges.filter(e => e.id !== connectionId));
    
    if (edge) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      logEvent('interaction', `Deleted connection ${sourceNode?.data?.label || edge.source} → ${targetNode?.data?.label || edge.target}`);
    }
  }, [edges, nodes, logEvent]);

  // ============================================================================
  // Layout System Handlers
  // ============================================================================

  const handleLayoutChange = useCallback((layout: 'auto' | 'manual' | 'grid') => {
    setCurrentLayout(layout);
    logEvent('layout', `Changed layout to: ${layout}`);
    
    if (layout === 'grid') {
      // Apply grid layout
      const gridSize = 200;
      const cols = 3;
      setNodes(prevNodes => 
        prevNodes.map((node, index) => ({
          ...node,
          position: {
            x: (index % cols) * gridSize + 100,
            y: Math.floor(index / cols) * gridSize + 100
          }
        }))
      );
    } else if (layout === 'auto') {
      // Apply automatic layout (simple horizontal flow)
      setNodes(prevNodes => 
        prevNodes.map((node, index) => ({
          ...node,
          position: {
            x: index * 180 + 100,
            y: 100 + (index % 2) * 150
          }
        }))
      );
    }
  }, [logEvent]);

  const handleLockToggle = useCallback((locked: boolean) => {
    setIsLocked(locked);
    logEvent('control', `Canvas ${locked ? 'locked' : 'unlocked'}`);
  }, [logEvent]);

  const handleMiniMapToggle = useCallback((visible: boolean) => {
    setIsMiniMapVisible(visible);
    logEvent('control', `MiniMap ${visible ? 'shown' : 'hidden'}`);
  }, [logEvent]);

  const handleFullscreenToggle = useCallback((fullscreen: boolean) => {
    setIsFullscreen(fullscreen);
    logEvent('control', `${fullscreen ? 'Entered' : 'Exited'} fullscreen mode`);
  }, [logEvent]);

  const handleBackgroundChange = useCallback((variant: typeof backgroundVariant) => {
    setBackgroundVariant(variant);
    logEvent('background', `Changed background to: ${variant}`);
  }, [logEvent]);

  // ============================================================================
  // Test Actions
  // ============================================================================

  const addRandomNode = useCallback(() => {
    const newId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: 'workflowNode',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        label: `Node ${nodes.length + 1}`,
        type: 'action',
        icon: 'plus',
        status: 'idle',
        description: 'Dynamically added node',
        zone: 'processing'
      }
    };
    
    setNodes(prev => [...prev, newNode]);
    logEvent('interaction', `Added new node: ${newNode.data.label}`);
  }, [nodes.length, logEvent]);

  const resetLayout = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNodeId(null);
    setCurrentLayout('manual');
    setBackgroundVariant('dots');
    setShowZones(true);
    setEventLog([]);
    logEvent('layout', 'Reset layout to initial state');
  }, [logEvent]);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const layoutStats = useMemo(() => ({
    nodeCount: nodes.length,
    edgeCount: edges.length,
    selectedNode: selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null,
    layout: currentLayout,
    backgroundVariant,
    isLocked,
    showZones
  }), [nodes, edges, selectedNodeId, currentLayout, backgroundVariant, isLocked, showZones]);

  const canvasClasses = useMemo(() => {
    const classes = ['step4-2-canvas'];
    if (currentLayout !== 'manual') classes.push(`step4-2-canvas--${currentLayout}`);
    if (isLocked) classes.push('step4-2-canvas--locked');
    if (isFullscreen) classes.push('step4-2-canvas--fullscreen');
    return classes.join(' ');
  }, [currentLayout, isLocked, isFullscreen]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="step4-2-example">
      {/* Header */}
      <div className="example-header">
        <h2>Step 4.2: Layout System Demo</h2>
        <p>Enhanced canvas with improved background, controls, and layout management</p>
      </div>

      {/* Layout Controls */}
      <div className="layout-controls">
        <div className="control-group">
          <h3>Layout System</h3>
          <div className="control-buttons">
            <button 
              onClick={() => handleLayoutChange('manual')}
              className={`btn ${currentLayout === 'manual' ? 'btn--active' : 'btn--secondary'}`}
            >
              Manual
            </button>
            <button 
              onClick={() => handleLayoutChange('auto')}
              className={`btn ${currentLayout === 'auto' ? 'btn--active' : 'btn--secondary'}`}
            >
              Auto
            </button>
            <button 
              onClick={() => handleLayoutChange('grid')}
              className={`btn ${currentLayout === 'grid' ? 'btn--active' : 'btn--secondary'}`}
            >
              Grid
            </button>
          </div>
        </div>

        <div className="control-group">
          <h3>Background</h3>
          <div className="control-buttons">
            {(['dots', 'lines', 'cross', 'grid', 'none'] as const).map(variant => (
              <button
                key={variant}
                onClick={() => handleBackgroundChange(variant)}
                className={`btn ${backgroundVariant === variant ? 'btn--active' : 'btn--secondary'}`}
              >
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <h3>Features</h3>
          <div className="control-toggles">
            <label className="toggle">
              <input 
                type="checkbox" 
                checked={showZones} 
                onChange={(e) => setShowZones(e.target.checked)}
              />
              Show Zones
            </label>
            <label className="toggle">
              <input 
                type="checkbox" 
                checked={backgroundAnimated} 
                onChange={(e) => setBackgroundAnimated(e.target.checked)}
              />
              Animated Background
            </label>
          </div>
        </div>

        <div className="control-group">
          <h3>Actions</h3>
          <div className="control-buttons">
            <button onClick={addRandomNode} className="btn btn--primary">
              Add Node
            </button>
            <button onClick={resetLayout} className="btn btn--secondary">
              Reset Layout
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Canvas */}
      <div className={`example-canvas-container ${canvasClasses}`}>
        <div className="canvas-wrapper">
          {/* Background Layer */}
          {showZones ? (
            <EnhancedCanvasBackground
              variant={backgroundVariant}
              animated={backgroundAnimated}
              zones={backgroundZones}
              showZoneLabels={true}
              gap={20}
              size={1}
              opacity={0.3}
            />
          ) : (
            <CanvasBackground
              variant={backgroundVariant}
              animated={backgroundAnimated}
              gap={20}
              size={1}
              opacity={0.3}
            />
          )}

          {/* Main Canvas */}
          <WorkflowCanvas
            nodes={nodes}
            connections={edges}
            onNodeSelect={handleNodeSelect}
            onNodeMove={handleNodeMove}
            onConnectionCreate={handleConnectionCreate}
            onConnectionDelete={handleConnectionDelete}
            readOnly={isLocked}
            className="enhanced-workflow-canvas"
          />

          {/* Enhanced Controls */}
          <CanvasControls
            position="bottom-left"
            showZoom={true}
            showFitView={true}
            showLock={true}
            showMiniMap={true}
            showFullscreen={true}
            showLayout={true}
            onLayoutChange={handleLayoutChange}
            onLockToggle={handleLockToggle}
            onMiniMapToggle={handleMiniMapToggle}
            onFullscreenToggle={handleFullscreenToggle}
            isLocked={isLocked}
            isMiniMapVisible={isMiniMapVisible}
            isFullscreen={isFullscreen}
            currentLayout={currentLayout}
          />
        </div>
      </div>

      {/* Stats and Events */}
      <div className="example-sidebar">
        {/* Layout Statistics */}
        <div className="stats-panel">
          <h3>Layout Statistics</h3>
          <div className="stat-item">
            <span className="stat-label">Nodes:</span>
            <span className="stat-value">{layoutStats.nodeCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Connections:</span>
            <span className="stat-value">{layoutStats.edgeCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Layout:</span>
            <span className="stat-value">{layoutStats.layout}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Background:</span>
            <span className="stat-value">{layoutStats.backgroundVariant}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Status:</span>
            <span className="stat-value">{layoutStats.isLocked ? 'Locked' : 'Interactive'}</span>
          </div>
        </div>

        {/* Selected Node Details */}
        {layoutStats.selectedNode && (
          <div className="node-details-panel">
            <h3>Selected Node</h3>
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{String(layoutStats.selectedNode.data?.label || 'Unknown')}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Zone:</span>
              <span className="detail-value">{String(layoutStats.selectedNode.data?.zone || 'None')}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status-${layoutStats.selectedNode.data?.status}`}>
                {String(layoutStats.selectedNode.data?.status || 'Unknown')}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Position:</span>
              <span className="detail-value">
                ({Math.round(layoutStats.selectedNode.position.x)}, {Math.round(layoutStats.selectedNode.position.y)})
              </span>
            </div>
          </div>
        )}

        {/* Event Log */}
        <div className="event-log-panel">
          <h3>Layout Events</h3>
          <div className="event-log">
            {eventLog.length === 0 ? (
              <div className="no-events">No events yet</div>
            ) : (
              eventLog.map(event => (
                <div key={event.id} className={`event-item event-item--${event.type}`}>
                  <div className="event-time">
                    {event.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="event-type">{event.type}</div>
                  <div className="event-details">{event.details}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Feature Instructions */}
      <div className="example-instructions">
        <h3>Layout System Features</h3>
        <div className="feature-grid">
          <div className="feature-item">
            <h4>Layout Modes</h4>
            <ul>
              <li><strong>Manual:</strong> Free-form node positioning</li>
              <li><strong>Auto:</strong> Automatic horizontal flow layout</li>
              <li><strong>Grid:</strong> Structured grid-based positioning</li>
            </ul>
          </div>
          <div className="feature-item">
            <h4>Background Patterns</h4>
            <ul>
              <li><strong>Dots:</strong> Subtle dot grid pattern</li>
              <li><strong>Lines:</strong> Linear grid lines</li>
              <li><strong>Cross:</strong> Crosshatch pattern</li>
              <li><strong>Grid:</strong> Custom grid overlay</li>
              <li><strong>None:</strong> Clean background</li>
            </ul>
          </div>
          <div className="feature-item">
            <h4>Enhanced Controls</h4>
            <ul>
              <li><strong>Zoom:</strong> In/out with smooth transitions</li>
              <li><strong>Fit View:</strong> Auto-fit all nodes</li>
              <li><strong>Lock:</strong> Prevent accidental changes</li>
              <li><strong>MiniMap:</strong> Toggle overview map</li>
              <li><strong>Fullscreen:</strong> Immersive editing</li>
            </ul>
          </div>
          <div className="feature-item">
            <h4>Zone System</h4>
            <ul>
              <li><strong>Input Zone:</strong> Data entry points</li>
              <li><strong>Processing Zone:</strong> Transformation logic</li>
              <li><strong>Output Zone:</strong> Results and exports</li>
              <li><strong>Visual Indicators:</strong> Color-coded areas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4_2_Example; 