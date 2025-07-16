// ============================================================================
// Step 4.1 Example - WorkflowCanvas Demo
// Comprehensive example showing canvas architecture and integration
// ============================================================================

import React, { useState, useCallback, useMemo } from 'react';
import { Node, Edge, MarkerType } from '@xyflow/react';
import { WorkflowCanvas } from './WorkflowCanvas';
import './Step4_1_Example.scss';

// ============================================================================
// Sample Data
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
      description: 'Manual trigger to start the workflow'
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
      description: 'Log workflow results to database'
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
  }
];

// ============================================================================
// Event Handlers
// ============================================================================

interface EventLog {
  id: string;
  timestamp: Date;
  type: 'nodeSelect' | 'nodeMove' | 'connectionCreate' | 'connectionDelete';
  details: string;
}

// ============================================================================
// Example Component
// ============================================================================

export const Step4_1_Example: React.FC = () => {
  // State management
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [eventLog, setEventLog] = useState<EventLog[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);

  // Event logging utility
  const logEvent = useCallback((type: EventLog['type'], details: string) => {
    const event: EventLog = {
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
      logEvent('nodeSelect', `Selected node: ${node?.data?.label || nodeId}`);
    } else {
      logEvent('nodeSelect', 'Deselected all nodes');
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
    logEvent('nodeMove', `Moved ${node?.data?.label || nodeId} to (${Math.round(position.x)}, ${Math.round(position.y)})`);
  }, [nodes, logEvent]);

  const handleConnectionCreate = useCallback((connection: Edge) => {
    setEdges(prevEdges => [...prevEdges, connection]);
    
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    logEvent('connectionCreate', `Connected ${sourceNode?.data?.label || connection.source} → ${targetNode?.data?.label || connection.target}`);
  }, [nodes, logEvent]);

  const handleConnectionDelete = useCallback((connectionId: string) => {
    const edge = edges.find(e => e.id === connectionId);
    setEdges(prevEdges => prevEdges.filter(e => e.id !== connectionId));
    
    if (edge) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      logEvent('connectionDelete', `Deleted connection ${sourceNode?.data?.label || edge.source} → ${targetNode?.data?.label || edge.target}`);
    }
  }, [edges, nodes, logEvent]);

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
        description: 'Dynamically added node'
      }
    };
    
    setNodes(prev => [...prev, newNode]);
    logEvent('nodeSelect', `Added new node: ${newNode.data.label}`);
  }, [nodes.length, logEvent]);

  const changeNodeStatus = useCallback((nodeId: string, status: string) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, status } }
          : node
      )
    );
    
    const node = nodes.find(n => n.id === nodeId);
    logEvent('nodeSelect', `Changed ${node?.data?.label || nodeId} status to ${status}`);
  }, [nodes, logEvent]);

  const resetCanvas = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNodeId(null);
    setEventLog([]);
    logEvent('nodeSelect', 'Reset canvas to initial state');
  }, [logEvent]);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const canvasStats = useMemo(() => ({
    nodeCount: nodes.length,
    edgeCount: edges.length,
    selectedNode: selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null
  }), [nodes, edges, selectedNodeId]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="step4-1-example">
      {/* Header */}
      <div className="example-header">
        <h2>Step 4.1: Canvas Architecture Demo</h2>
        <p>Interactive demonstration of the enhanced WorkflowCanvas component</p>
      </div>

      {/* Controls */}
      <div className="example-controls">
        <div className="control-group">
          <h3>Canvas Controls</h3>
          <button onClick={addRandomNode} className="btn btn--primary">
            Add Random Node
          </button>
          <button onClick={resetCanvas} className="btn btn--secondary">
            Reset Canvas
          </button>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={readOnly} 
              onChange={(e) => setReadOnly(e.target.checked)}
            />
            Read Only Mode
            Read Only Mode
          </label>
        </div>

        {selectedNodeId && (
          <div className="control-group">
            <h3>Selected Node Actions</h3>
            <button 
              onClick={() => changeNodeStatus(selectedNodeId, 'running')}
              className="btn btn--warning"
            >
              Set Running
            </button>
            <button 
              onClick={() => changeNodeStatus(selectedNodeId, 'success')}
              className="btn btn--success"
            >
              Set Success
            </button>
            <button 
              onClick={() => changeNodeStatus(selectedNodeId, 'error')}
              className="btn btn--danger"
            >
              Set Error
            </button>
            <button 
              onClick={() => changeNodeStatus(selectedNodeId, 'idle')}
              className="btn btn--neutral"
            >
              Set Idle
            </button>
          </div>
        )}
      </div>

      {/* Main Canvas */}
      <div className="example-canvas-container">
        <WorkflowCanvas
          nodes={nodes}
          connections={edges}
          onNodeSelect={handleNodeSelect}
          onNodeMove={handleNodeMove}
          onConnectionCreate={handleConnectionCreate}
          onConnectionDelete={handleConnectionDelete}
          readOnly={readOnly}
          className="example-canvas"
        />
      </div>

      {/* Stats and Events */}
      <div className="example-sidebar">
        {/* Canvas Stats */}
        <div className="stats-panel">
          <h3>Canvas Statistics</h3>
          <div className="stat-item">
            <span className="stat-label">Nodes:</span>
            <span className="stat-value">{canvasStats.nodeCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Connections:</span>
            <span className="stat-value">{canvasStats.edgeCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Selected:</span>
            <span className="stat-value">
              {canvasStats.selectedNode?.data?.label || 'None'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Mode:</span>
            <span className="stat-value">{readOnly ? 'Read Only' : 'Interactive'}</span>
          </div>
        </div>

        {/* Selected Node Details */}
        {canvasStats.selectedNode && (
          <div className="node-details-panel">
            <h3>Selected Node Details</h3>
            <div className="detail-item">
              <span className="detail-label">ID:</span>
              <span className="detail-value">{canvasStats.selectedNode.id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{String(canvasStats.selectedNode.data?.type || 'Unknown')}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status-${canvasStats.selectedNode.data?.status}`}>
                {String(canvasStats.selectedNode.data?.status || 'Unknown')}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Position:</span>
              <span className="detail-value">
                ({Math.round(canvasStats.selectedNode.position.x)}, {Math.round(canvasStats.selectedNode.position.y)})
              </span>
            </div>
          </div>
        )}

        {/* Event Log */}
        <div className="event-log-panel">
          <h3>Event Log</h3>
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

      {/* Instructions */}
      <div className="example-instructions">
        <h3>How to Test</h3>
        <ul>
          <li><strong>Node Selection:</strong> Click any node to select it</li>
          <li><strong>Parameter Panel:</strong> Double-click a node to open the parameter panel</li>
          <li><strong>Node Movement:</strong> Drag nodes to move them around the canvas</li>
          <li><strong>Connections:</strong> Drag from node handles to create connections</li>
          <li><strong>Deletion:</strong> Select nodes/edges and press Delete or Backspace</li>
          <li><strong>Canvas Navigation:</strong> Use mouse wheel to zoom, drag canvas to pan</li>
          <li><strong>Keyboard Shortcuts:</strong> ESC to deselect, Enter to open panel for selected node</li>
        </ul>
      </div>
    </div>
  );
};

export default Step4_1_Example; 