// WorkflowCanvas - Main Canvas Component
// Container for the new n8n-style workflow interface

import React, { memo, useCallback, useState, useEffect, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  addEdge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useDesignClasses, useCSSVariables } from '../../../design-system';
import { cn } from '../../../utils/utils';
import CanvasBackground from './CanvasBackground';
import CanvasControls from './CanvasControls';
import WorkflowNode from '../Node/WorkflowNode';
import WorkflowConnection from '../Connection/WorkflowConnection';
import ParameterPanel from '../Panel/ParameterPanel';
import { useNodeMigration } from '../../../hooks/useNodeMigration';

// ============================================================================
// Types
// ============================================================================

export interface WorkflowCanvasProps {
  // Core data
  nodes?: Node[];
  connections?: Edge[];
  
  // Event handlers
  onNodeSelect?: (nodeId: string | null) => void;
  onNodeMove?: (nodeId: string, position: { x: number; y: number }) => void;
  onConnectionCreate?: (connection: Edge) => void;
  onConnectionDelete?: (connectionId: string) => void;
  onNodesChange?: OnNodesChange;
  onEdgesChange?: OnEdgesChange;
  
  // Canvas options
  readOnly?: boolean;
  
  // Styling
  className?: string;
}

interface CanvasState {
  selectedNodeId: string | null;
  panelOpen: boolean;
  isConnecting: boolean;
  draggedNodeId: string | null;
  lastClickTime: number;
}

// ============================================================================
// Node Types Configuration
// ============================================================================

const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode as any,
  // Add more node types as needed
  default: WorkflowNode as any,
};

// ============================================================================
// Edge Types Configuration  
// ============================================================================

const edgeTypes: EdgeTypes = {
  workflowConnection: WorkflowConnection as any,
  // Add more edge types as needed
  default: WorkflowConnection as any,
};

// ============================================================================
// Default ReactFlow Settings
// ============================================================================

const defaultReactFlowSettings = {
  connectionMode: ConnectionMode.Loose,
  fitView: true,
  attributionPosition: 'top-right' as const,
  maxZoom: 2,
  minZoom: 0.1,
  defaultZoom: 1,
  snapToGrid: true,
  snapGrid: [20, 20] as [number, number],
  deleteKeyCode: ['Backspace', 'Delete'],
  multiSelectionKeyCode: ['Meta', 'Ctrl'],
  panOnDrag: true,
  zoomOnScroll: true,
  zoomOnPinch: true,
  panOnScroll: false,
  preventScrolling: true,
  zoomOnDoubleClick: false,
  selectNodesOnDrag: false,
};

// ============================================================================
// Canvas Component
// ============================================================================

const WorkflowCanvasComponent: React.FC<WorkflowCanvasProps> = memo(({
  nodes: initialNodes = [],
  connections: initialConnections = [],
  onNodeSelect,
  onNodeMove,
  onConnectionCreate,
  onConnectionDelete,
  onNodesChange,
  onEdgesChange,
  className = '',
  readOnly = false
}) => {
  // Migration system integration
  const { shouldUseMigratedCanvas, recordError, recordSuccess } = useNodeMigration();

  // Local state management
  const [canvasState, setCanvasState] = useState<CanvasState>({
    selectedNodeId: null,
    panelOpen: false,
    isConnecting: false,
    draggedNodeId: null,
    lastClickTime: 0
  });

  // ReactFlow state management
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialConnections);

  // ============================================================================
  // State Synchronization
  // ============================================================================

  // Sync with external nodes/connections
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialConnections);
  }, [initialConnections, setEdges]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    try {
      event.stopPropagation();
      
      const currentTime = Date.now();
      const timeDiff = currentTime - canvasState.lastClickTime;
      
      // Double-click detection (within 300ms)
      const isDoubleClick = timeDiff < 300 && canvasState.selectedNodeId === node.id;
      
      if (isDoubleClick) {
        // Double-click opens panel
        setCanvasState(prev => ({
          ...prev,
          selectedNodeId: node.id,
          panelOpen: true,
          lastClickTime: currentTime
        }));
      } else {
        // Single click selects node
        setCanvasState(prev => ({
          ...prev,
          selectedNodeId: node.id,
          panelOpen: false,
          lastClickTime: currentTime
        }));
      }

      // Update node selection in ReactFlow
      setNodes(nodes => 
        nodes.map(n => ({
          ...n,
          selected: n.id === node.id
        }))
      );

      onNodeSelect?.(node.id);
      recordSuccess('WorkflowCanvas-nodeClick');
    } catch (error) {
      recordError('WorkflowCanvas', error as Error, 'medium');
    }
  }, [canvasState.lastClickTime, canvasState.selectedNodeId, onNodeSelect, setNodes, recordSuccess, recordError]);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    try {
      // Only handle clicks on the canvas background
      if ((event.target as HTMLElement).classList.contains('react-flow__pane')) {
        setCanvasState(prev => ({
          ...prev,
          selectedNodeId: null,
          panelOpen: false
        }));

        // Clear all node selections
        setNodes(nodes => 
          nodes.map(n => ({
            ...n,
            selected: false
          }))
        );

        onNodeSelect?.(null);
        recordSuccess('WorkflowCanvas-canvasClick');
      }
    } catch (error) {
      recordError('WorkflowCanvas', error as Error, 'low');
    }
  }, [onNodeSelect, setNodes, recordSuccess, recordError]);

  const handleNodeDrag = useCallback((event: React.MouseEvent, node: Node) => {
    try {
      setCanvasState(prev => ({
        ...prev,
        draggedNodeId: node.id
      }));
    } catch (error) {
      recordError('WorkflowCanvas', error as Error, 'low');
    }
  }, [recordError]);

  const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    try {
      setCanvasState(prev => ({
        ...prev,
        draggedNodeId: null
      }));

      onNodeMove?.(node.id, node.position);
      recordSuccess('WorkflowCanvas-nodeMoved');
    } catch (error) {
      recordError('WorkflowCanvas', error as Error, 'medium');
    }
  }, [onNodeMove, recordSuccess, recordError]);

  const handleConnect = useCallback((connection: any) => {
    try {
      const newEdge = {
        ...connection,
        id: `${connection.source}-${connection.target}-${Date.now()}`,
        type: 'workflowConnection',
        animated: false,
        data: {
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
        }
      };

      setEdges(edges => addEdge(newEdge, edges));
      onConnectionCreate?.(newEdge);
      recordSuccess('WorkflowCanvas-connectionCreated');
    } catch (error) {
      recordError('WorkflowCanvas', error as Error, 'medium');
    }
  }, [setEdges, onConnectionCreate, recordSuccess, recordError]);

  const handleEdgeDelete = useCallback((edgesToRemove: Edge[]) => {
    try {
      edgesToRemove.forEach(edge => {
        onConnectionDelete?.(edge.id);
      });
      recordSuccess('WorkflowCanvas-connectionsDeleted');
    } catch (error) {
      recordError('WorkflowCanvas', error as Error, 'medium');
    }
  }, [onConnectionDelete, recordSuccess, recordError]);

  const handleNodesChangeWrapper = useCallback((changes: any) => {
    try {
      handleNodesChange(changes);
      onNodesChange?.(changes);
    } catch (error) {
      recordError('WorkflowCanvas', error as Error, 'medium');
    }
  }, [handleNodesChange, onNodesChange, recordError]);

  const handleEdgesChangeWrapper = useCallback((changes: any) => {
    try {
      handleEdgesChange(changes);
      onEdgesChange?.(changes);
    } catch (error) {
      recordError('WorkflowCanvas', error as Error, 'medium');
    }
  }, [handleEdgesChange, onEdgesChange, recordError]);

  const handlePanelClose = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      panelOpen: false
    }));
  }, []);

  const handleParameterSave = useCallback(async (nodeId: string, parameters: Record<string, unknown>) => {
    try {
      // Update node data
      setNodes(nodes => 
        nodes.map(node => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, ...parameters } }
            : node
        )
      );
      recordSuccess('WorkflowCanvas-parametersSaved');
    } catch (error) {
      recordError('WorkflowCanvas', error as Error, 'high');
      throw error; // Re-throw for panel error handling
    }
  }, [setNodes, recordSuccess, recordError]);

  // ============================================================================
  // Keyboard Shortcuts
  // ============================================================================

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    try {
      // Delete selected nodes/edges
      if ((event.key === 'Delete' || event.key === 'Backspace') && !readOnly) {
        event.preventDefault();
        
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedEdges = edges.filter(edge => edge.selected);
        
        if (selectedNodes.length > 0) {
          const nodeIdsToDelete = selectedNodes.map(node => node.id);
          setNodes(nodes => nodes.filter(node => !nodeIdsToDelete.includes(node.id)));
          
          // Also delete connected edges
          setEdges(edges => edges.filter(edge => 
            !nodeIdsToDelete.includes(edge.source) && !nodeIdsToDelete.includes(edge.target)
          ));
        }
        
        if (selectedEdges.length > 0) {
          handleEdgeDelete(selectedEdges);
        }
      }
      
      // Escape key to deselect
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCanvasClick(event as any);
      }
      
      // Enter key to open panel for selected node
      if (event.key === 'Enter' && canvasState.selectedNodeId) {
        event.preventDefault();
        setCanvasState(prev => ({
          ...prev,
          panelOpen: true
        }));
      }
    } catch (error) {
      recordError('WorkflowCanvas', error as Error, 'low');
    }
  }, [nodes, edges, readOnly, canvasState.selectedNodeId, setNodes, setEdges, handleEdgeDelete, handleCanvasClick, recordError]);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const canvasClasses = useMemo(() => {
    const classes = ['workflow-canvas'];
    if (className) classes.push(className);
    if (readOnly) classes.push('workflow-canvas--readonly');
    if (canvasState.isConnecting) classes.push('workflow-canvas--connecting');
    if (canvasState.draggedNodeId) classes.push('workflow-canvas--dragging');
    return classes.join(' ');
  }, [className, readOnly, canvasState.isConnecting, canvasState.draggedNodeId]);

  const reactFlowProps = useMemo(() => ({
    ...defaultReactFlowSettings,
    nodes,
    edges,
    nodeTypes,
    edgeTypes,
    onNodesChange: handleNodesChangeWrapper,
    onEdgesChange: handleEdgesChangeWrapper,
    onConnect: readOnly ? undefined : handleConnect,
    onNodeClick: handleNodeClick,
    onNodeDrag: readOnly ? undefined : handleNodeDrag,
    onNodeDragStop: readOnly ? undefined : handleNodeDragStop,
    onPaneClick: handleCanvasClick,
    onEdgesDelete: readOnly ? undefined : handleEdgeDelete,
    nodesDraggable: !readOnly,
    nodesConnectable: !readOnly,
    elementsSelectable: !readOnly,
    deleteKeyCode: readOnly ? null : defaultReactFlowSettings.deleteKeyCode,
  }), [
    nodes, 
    edges, 
    readOnly,
    handleNodesChangeWrapper,
    handleEdgesChangeWrapper,
    handleConnect,
    handleNodeClick,
    handleNodeDrag,
    handleNodeDragStop,
    handleCanvasClick,
    handleEdgeDelete
  ]);

  // ============================================================================
  // Migration Check
  // ============================================================================

  if (!shouldUseMigratedCanvas()) {
    // Return legacy canvas or null
    return null;
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div 
      className={canvasClasses}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Workflow Canvas"
      aria-describedby="canvas-description"
    >
      {/* Hidden description for screen readers */}
      <div id="canvas-description" className="sr-only">
        Interactive workflow canvas. Double-click nodes to edit parameters. 
        Use Delete key to remove selected items. Press Escape to deselect.
      </div>

      {/* Main ReactFlow Canvas */}
      <ReactFlow {...reactFlowProps}>
        {/* Background with n8n-style dots */}
        <Background 
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--color-border-light, #e2e8f0)"
        />

        {/* Canvas Controls */}
        <Controls 
          position="bottom-left"
          showZoom={true}
          showFitView={true}
          showInteractive={!readOnly}
        />

        {/* Mini Map */}
        <MiniMap
          position="bottom-right"
          zoomable={true}
          pannable={true}
          nodeColor={(node) => {
            if (node.selected) return 'var(--color-primary, #3b82f6)';
            if (node.data?.status === 'error') return 'var(--color-danger, #ef4444)';
            if (node.data?.status === 'success') return 'var(--color-success, #10b981)';
            if (node.data?.status === 'running') return 'var(--color-warning, #f59e0b)';
            return 'var(--color-background-base, #ffffff)';
          }}
          nodeStrokeWidth={2}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>

      {/* Enhanced Parameter Panel */}
      <ParameterPanel
        isOpen={canvasState.panelOpen}
        nodeId={canvasState.selectedNodeId}
        onClose={handlePanelClose}
        onSave={handleParameterSave}
      />

      {/* Canvas Status Bar */}
      <div className="workflow-canvas__status">
        <div className="canvas-status">
          <span className="canvas-status__item">
            <span className="canvas-status__label">Nodes:</span>
            <span className="canvas-status__value">{nodes.length}</span>
          </span>
          <span className="canvas-status__item">
            <span className="canvas-status__label">Connections:</span>
            <span className="canvas-status__value">{edges.length}</span>
          </span>
          {canvasState.selectedNodeId && (
            <span className="canvas-status__item">
              <span className="canvas-status__label">Selected:</span>
              <span className="canvas-status__value">{canvasState.selectedNodeId}</span>
            </span>
          )}
          {readOnly && (
            <span className="canvas-status__item canvas-status__item--readonly">
              Read Only
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

WorkflowCanvasComponent.displayName = 'WorkflowCanvasComponent';

// ============================================================================
// Canvas with ReactFlow Provider
// ============================================================================

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = memo((props) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasComponent {...props} />
    </ReactFlowProvider>
  );
});

WorkflowCanvas.displayName = 'WorkflowCanvas';

// ============================================================================
// Default Export
// ============================================================================

export default WorkflowCanvas; 