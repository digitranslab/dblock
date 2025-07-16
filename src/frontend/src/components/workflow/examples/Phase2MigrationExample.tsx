// Phase2MigrationExample - Demonstrates Phase 2 Node Migration
// Shows how to migrate from legacy GenericNode to new WorkflowNode architecture

import React, { useState, useCallback, useMemo } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { 
  WorkflowCanvas,
  NodeAdapter,
  NodeTypeRegistry,
  useNodeTypeRegistry,
  NODE_CATEGORIES,
  type LegacyNodeData,
  type WorkflowNodeData,
  isLegacyNodeData,
  migrateLegacyNodes,
} from '../index';
import type { Node, Edge } from 'reactflow';

// Mock legacy data (simulating existing GenericNode data)
const mockLegacyData: LegacyNodeData[] = [
  {
    id: 'legacy-1',
    type: 'ChatOpenAI',
    node: {
      id: 'legacy-1',
      type: 'ChatOpenAI',
      display_name: 'OpenAI Chat',
      description: 'Chat with OpenAI GPT models',
      icon: 'message-circle',
      template: {
        model: {
          name: 'model',
          type: 'str',
          value: 'gpt-3.5-turbo',
          options: ['gpt-3.5-turbo', 'gpt-4'],
        },
        temperature: {
          name: 'temperature',
          type: 'float',
          value: 0.7,
        },
      },
      data: {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 100,
      },
      base_classes: ['BaseLanguageModel', 'BaseChatModel'],
      documentation: 'OpenAI Chat model for conversational AI',
    },
    status: 'built',
    disabled: false,
  },
  {
    id: 'legacy-2',
    type: 'TextLoader',
    node: {
      id: 'legacy-2',
      type: 'TextLoader',
      display_name: 'Text File Loader',
      description: 'Load text from files',
      icon: 'file-text',
      template: {
        file_path: {
          name: 'file_path',
          type: 'str',
          value: '',
          required: true,
        },
      },
      data: {
        file_path: '/path/to/file.txt',
      },
      base_classes: ['BaseLoader'],
      beta: true,
    },
    status: 'idle',
    disabled: false,
  },
  {
    id: 'legacy-3',
    type: 'VectorStore',
    node: {
      id: 'legacy-3',
      type: 'VectorStore',
      display_name: 'Vector Database',
      description: 'Store and retrieve vectors',
      icon: 'database',
      template: {
        collection_name: {
          name: 'collection_name',
          type: 'str',
          value: 'default',
        },
      },
      data: {
        collection_name: 'my_collection',
      },
      base_classes: ['BaseVectorStore'],
      error: 'Connection failed',
    },
    status: 'error',
    disabled: false,
  },
];

// Convert legacy data to ReactFlow nodes using NodeAdapter
const createLegacyNodes = (legacyData: LegacyNodeData[]): Node[] => {
  return legacyData.map((data, index) => ({
    id: data.id || `legacy-${index}`,
    type: 'legacyNode', // Use the registered legacy node type
    position: { x: 100 + index * 200, y: 100 },
    data: data,
  }));
};

// Convert legacy data to new WorkflowNode format
const createMigratedNodes = (legacyData: LegacyNodeData[]): Node<WorkflowNodeData>[] => {
  const migratedData = migrateLegacyNodes(legacyData);
  
  return migratedData.map((data, index) => ({
    id: data.id,
    type: 'workflowNode',
    position: { x: 100 + index * 200, y: 300 },
    data: data,
  }));
};

export const Phase2MigrationExample: React.FC = () => {
  const [migrationMode, setMigrationMode] = useState<'legacy' | 'migrated' | 'both'>('both');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [parameterPanelOpen, setParameterPanelOpen] = useState(false);
  
  const { getReactFlowNodeTypes, getStats, getAllNodeTypes } = useNodeTypeRegistry();

  // Prepare nodes based on migration mode
  const nodes = useMemo(() => {
    const legacyNodes = createLegacyNodes(mockLegacyData);
    const migratedNodes = createMigratedNodes(mockLegacyData);
    
    switch (migrationMode) {
      case 'legacy':
        return legacyNodes;
      case 'migrated':
        return migratedNodes;
      case 'both':
      default:
        return [...legacyNodes, ...migratedNodes];
    }
  }, [migrationMode]);

  // Mock edges for demonstration
  const edges: Edge[] = useMemo(() => {
    if (migrationMode === 'both') {
      return [
        {
          id: 'e1-2',
          source: 'legacy-1',
          target: 'legacy-2',
          type: 'workflowConnection',
        },
        {
          id: 'e2-3',
          source: 'legacy-2',
          target: 'legacy-3',
          type: 'workflowConnection',
        },
      ];
    }
    return [];
  }, [migrationMode]);

  // Event handlers
  const handleNodeClick = useCallback((event: any, node: any) => {
    setSelectedNodeId(node.id);
    setParameterPanelOpen(true);
  }, []);

  const handleParameterPanelClose = useCallback(() => {
    setParameterPanelOpen(false);
    setSelectedNodeId(null);
  }, []);

  // Registry statistics
  const registryStats = getStats();
  const nodeTypes = getAllNodeTypes();

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Control Panel */}
      <div style={{ 
        padding: '16px', 
        backgroundColor: 'var(--color-background-light)', 
        borderBottom: '1px solid var(--color-border-base)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
            Phase 2: Node Migration Demo
          </h3>
          <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: '14px' }}>
            Demonstrates migration from legacy GenericNode to new WorkflowNode architecture
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>View Mode:</label>
          <select 
            value={migrationMode} 
            onChange={(e) => setMigrationMode(e.target.value as any)}
            style={{
              padding: '6px 12px',
              border: '1px solid var(--color-border-base)',
              borderRadius: '6px',
              backgroundColor: 'var(--color-background-base)',
              fontSize: '14px',
            }}
          >
            <option value="legacy">Legacy Nodes Only</option>
            <option value="migrated">Migrated Nodes Only</option>
            <option value="both">Both (Comparison)</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Canvas */}
        <div style={{ flex: 1 }}>
          <ReactFlowProvider>
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
          </ReactFlowProvider>
        </div>

        {/* Info Panel */}
        <div style={{ 
          width: '300px', 
          backgroundColor: 'var(--color-background-base)', 
          borderLeft: '1px solid var(--color-border-base)',
          padding: '16px',
          overflow: 'auto',
        }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>
            Migration Information
          </h4>

          {/* Registry Stats */}
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
              Node Type Registry
            </h5>
            <div style={{ fontSize: '13px', color: 'var(--color-text-light)' }}>
              <div>Total Types: {registryStats.totalTypes}</div>
              <div>Legacy Types: {registryStats.legacyTypes}</div>
              <div>Deprecated: {registryStats.deprecatedTypes}</div>
            </div>
          </div>

          {/* Node Types */}
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
              Registered Node Types
            </h5>
            <div style={{ fontSize: '12px' }}>
              {nodeTypes.map(type => (
                <div 
                  key={type.id}
                  style={{ 
                    padding: '4px 8px', 
                    margin: '2px 0',
                    backgroundColor: type.isLegacy ? 'var(--color-warning-light)' : 'var(--color-success-light)',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{type.name}</span>
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>
                    {type.isLegacy ? 'Legacy' : 'New'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Migration Features */}
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
              Migration Features
            </h5>
            <ul style={{ fontSize: '12px', margin: 0, paddingLeft: '16px', color: 'var(--color-text-light)' }}>
              <li>Automatic data transformation</li>
              <li>Legacy compatibility layer</li>
              <li>Status mapping (built → success)</li>
              <li>Error state preservation</li>
              <li>Beta/experimental indicators</li>
              <li>Template preservation</li>
            </ul>
          </div>

          {/* Current Nodes */}
          <div>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
              Current Nodes ({nodes.length})
            </h5>
            <div style={{ fontSize: '12px' }}>
              {nodes.map(node => {
                const isLegacy = isLegacyNodeData(node.data);
                return (
                  <div 
                    key={node.id}
                    style={{ 
                      padding: '4px 8px', 
                      margin: '2px 0',
                      backgroundColor: isLegacy ? 'var(--color-warning-light)' : 'var(--color-primary-light)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      setParameterPanelOpen(true);
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>
                      {node.data?.display_name || node.data?.node?.display_name || node.id}
                    </div>
                    <div style={{ fontSize: '10px', opacity: 0.7 }}>
                      Type: {node.type} | {isLegacy ? 'Legacy' : 'Migrated'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase2MigrationExample; 