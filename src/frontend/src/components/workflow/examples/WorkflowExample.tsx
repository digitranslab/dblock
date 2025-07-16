// WorkflowExample - Example Component
// Demonstrates the new n8n-style workflow architecture with mock data

import React, { useState, useCallback } from 'react';
import { WorkflowCanvas } from '../index';
import type { Node, Edge } from 'reactflow';
import type { WorkflowNodeData } from '../Node/WorkflowNode';

// Mock workflow data
const mockNodes: Node<WorkflowNodeData>[] = [
  {
    id: '1',
    type: 'workflowNode',
    position: { x: 100, y: 100 },
    data: {
      id: '1',
      type: 'trigger',
      display_name: 'Start Trigger',
      description: 'Triggers the workflow execution',
      icon: 'play',
      status: 'idle',
      disabled: false,
    },
  },
  {
    id: '2',
    type: 'workflowNode',
    position: { x: 300, y: 100 },
    data: {
      id: '2',
      type: 'transform',
      display_name: 'Transform Data',
      description: 'Processes and transforms the input data',
      icon: 'code',
      status: 'success',
      disabled: false,
    },
  },
  {
    id: '3',
    type: 'workflowNode',
    position: { x: 500, y: 100 },
    data: {
      id: '3',
      type: 'action',
      display_name: 'Send Email',
      description: 'Sends an email notification',
      icon: 'mail',
      status: 'idle',
      disabled: false,
    },
  },
  {
    id: '4',
    type: 'workflowNode',
    position: { x: 300, y: 250 },
    data: {
      id: '4',
      type: 'condition',
      display_name: 'Check Status',
      description: 'Checks if the operation was successful',
      icon: 'settings',
      status: 'warning',
      disabled: true,
    },
  },
];

const mockEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'workflowConnection',
    data: {
      label: 'Success',
      animated: false,
    },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'workflowConnection',
    data: {
      label: 'Processed',
      animated: true,
    },
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    type: 'workflowConnection',
    data: {
      label: 'Check',
      animated: false,
    },
  },
];

export const WorkflowExample: React.FC = () => {
  const [nodes, setNodes] = useState(mockNodes);
  const [edges, setEdges] = useState(mockEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [parameterPanelOpen, setParameterPanelOpen] = useState(false);

  // Handle node click
  const handleNodeClick = useCallback((event: any, node: any) => {
    console.log('Node clicked:', node);
    setSelectedNodeId(node.id);
    setParameterPanelOpen(true);
  }, []);

  // Handle parameter panel close
  const handleParameterPanelClose = useCallback(() => {
    setParameterPanelOpen(false);
    setSelectedNodeId(null);
  }, []);

  // Handle parameter save
  const handleParameterSave = useCallback((nodeId: string, parameters: Record<string, unknown>) => {
    console.log('Parameters saved for node:', nodeId, parameters);
    // Here you would update the node data with the new parameters
  }, []);

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid var(--color-border-base)' }}>
      <WorkflowCanvas
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        selectedNodeId={selectedNodeId}
        parameterPanelOpen={parameterPanelOpen}
        onParameterPanelClose={handleParameterPanelClose}
        showMiniMap={true}
        showControls={true}
        showBackground={true}
      />
    </div>
  );
};

export default WorkflowExample; 