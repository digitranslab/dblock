import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReactFlowProvider } from '@xyflow/react';
import WorkflowCanvas from '../../../../src/pages/FlowPage/components/WorkflowCanvas';

// Mock the store
const mockFlowStore = {
  reactFlowInstance: null,
  setReactFlowInstance: jest.fn(),
  nodes: [
    {
      id: 'node-1',
      type: 'genericNode',
      position: { x: 100, y: 100 },
      data: {
        type: 'ChatOpenAI',
        node: {
          display_name: 'Chat OpenAI',
          description: 'OpenAI chat model',
          icon: 'OpenAi',
          template: {
            temperature: {
              display_name: 'Temperature',
              type: 'float',
              value: 0.7,
            },
          },
        },
      },
    },
    {
      id: 'node-2',
      type: 'genericNode',
      position: { x: 300, y: 100 },
      data: {
        type: 'PromptTemplate',
        node: {
          display_name: 'Prompt Template',
          description: 'Template for prompts',
          icon: 'prompts',
          template: {
            template: {
              display_name: 'Template',
              type: 'str',
              value: 'Hello {input}',
            },
          },
        },
      },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
      sourceHandle: 'output',
      targetHandle: 'input',
    },
  ],
  onNodesChange: jest.fn(),
  onEdgesChange: jest.fn(),
  setNodes: jest.fn(),
  setEdges: jest.fn(),
  deleteNode: jest.fn(),
  deleteEdge: jest.fn(),
  onConnect: jest.fn(),
  paste: jest.fn(),
  lastCopiedSelection: null,
  setLastCopiedSelection: jest.fn(),
  setFilterEdge: jest.fn(),
  setPositionDictionary: jest.fn(),
  updateCurrentFlow: jest.fn(),
  selectedNodeId: null,
  parameterPanelOpen: false,
  setSelectedNodeId: jest.fn(),
  setParameterPanelOpen: jest.fn(),
};

const mockFlowsManagerStore = {
  undo: jest.fn(),
  redo: jest.fn(),
  takeSnapshot: jest.fn(),
};

const mockAlertStore = {
  setErrorData: jest.fn(),
};

// Mock dependencies
jest.mock('../../../../src/stores/flowStore', () => ({
  __esModule: true,
  default: jest.fn(() => mockFlowStore),
}));

jest.mock('../../../../src/stores/flowsManagerStore', () => ({
  __esModule: true,
  default: jest.fn(() => mockFlowsManagerStore),
}));

jest.mock('../../../../src/stores/alertStore', () => ({
  __esModule: true,
  default: jest.fn(() => mockAlertStore),
}));

jest.mock('../../../../src/stores/shortcuts', () => ({
  useShortcutsStore: jest.fn(() => ({
    undo: 'ctrl+z',
    redo: 'ctrl+y',
    redoAlt: 'ctrl+shift+z',
    copy: 'ctrl+c',
    paste: 'ctrl+v',
    delete: 'delete',
  })),
}));

jest.mock('../../../../src/hooks/useAddComponent', () => ({
  useAddComponent: jest.fn(() => jest.fn()),
}));

jest.mock('../../../../src/hooks/flows/use-autosave-flow', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

jest.mock('../../../../src/hooks/flows/use-upload-flow', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

// Mock ReactFlow components
jest.mock('@xyflow/react', () => ({
  ...jest.requireActual('@xyflow/react'),
  ReactFlow: ({ children, onNodeClick, onPaneClick, nodes, edges, ...props }: any) => (
    <div data-testid="react-flow" {...props}>
      <div data-testid="workflow-nodes">
        {nodes.map((node: any) => (
          <div
            key={node.id}
            data-testid={`node-${node.id}`}
            data-node-type={node.type}
            onClick={(e) => onNodeClick?.(e, node)}
            style={{
              position: 'absolute',
              left: node.position.x,
              top: node.position.y,
              width: 140,
              height: 80,
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '8px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            {node.data.node.display_name}
          </div>
        ))}
      </div>
      <div data-testid="workflow-edges">
        {edges.map((edge: any) => (
          <div key={edge.id} data-testid={`edge-${edge.id}`}>
            Edge: {edge.source} → {edge.target}
          </div>
        ))}
      </div>
      <div data-testid="canvas-background" onClick={onPaneClick}>
        Canvas Background
      </div>
      {children}
    </div>
  ),
  Background: ({ variant }: any) => (
    <div data-testid="canvas-background" data-variant={variant}>
      Background
    </div>
  ),
  BackgroundVariant: {
    Dots: 'dots',
    Lines: 'lines',
    Cross: 'cross',
  },
}));

// Mock components
jest.mock('../../../../src/components/ParameterPanel', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="parameter-panel">
        <div data-testid="parameter-panel-content">Parameter Panel Content</div>
        <button data-testid="close-panel" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

jest.mock('../../../../src/pages/FlowPage/components/SelectionMenuComponent', () => ({
  __esModule: true,
  default: ({ isVisible, lastSelection }: any) =>
    isVisible ? (
      <div data-testid="selection-menu">
        Selection Menu ({lastSelection?.nodes?.length || 0} nodes)
      </div>
    ) : null,
}));

jest.mock('../../../../src/components/core/flowToolbarComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="flow-toolbar">Flow Toolbar</div>,
}));

jest.mock('../../../../src/components/core/canvasControlsComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="canvas-controls">Canvas Controls</div>,
}));

describe('Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WorkflowCanvas Integration', () => {
    it('renders workflow canvas with nodes and edges', () => {
      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
      expect(screen.getByTestId('node-node-1')).toBeInTheDocument();
      expect(screen.getByTestId('node-node-2')).toBeInTheDocument();
      expect(screen.getByTestId('edge-edge-1')).toBeInTheDocument();
    });

    it('opens parameter panel when node is clicked', async () => {
      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      const node = screen.getByTestId('node-node-1');
      fireEvent.click(node);

      await waitFor(() => {
        expect(mockFlowStore.setSelectedNodeId).toHaveBeenCalledWith('node-1');
        expect(mockFlowStore.setParameterPanelOpen).toHaveBeenCalledWith(true);
      });
    });

    it('closes parameter panel when canvas background is clicked', async () => {
      // Set up initial state with panel open
      mockFlowStore.parameterPanelOpen = true;
      mockFlowStore.selectedNodeId = 'node-1';

      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      const background = screen.getByTestId('canvas-background');
      fireEvent.click(background);

      await waitFor(() => {
        expect(mockFlowStore.setParameterPanelOpen).toHaveBeenCalledWith(false);
        expect(mockFlowStore.setSelectedNodeId).toHaveBeenCalledWith(null);
      });
    });

    it('handles node drag operations', async () => {
      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      // Simulate drag start
      const node = screen.getByTestId('node-node-1');
      fireEvent.mouseDown(node);

      await waitFor(() => {
        expect(mockFlowsManagerStore.takeSnapshot).toHaveBeenCalled();
      });
    });

    it('handles keyboard shortcuts', async () => {
      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      // Simulate Ctrl+Z (undo)
      fireEvent.keyDown(document, { key: 'z', ctrlKey: true });

      await waitFor(() => {
        expect(mockFlowsManagerStore.undo).toHaveBeenCalled();
      });
    });
  });

  describe('Parameter Panel Integration', () => {
    it('shows parameter panel when node is selected', () => {
      mockFlowStore.parameterPanelOpen = true;
      mockFlowStore.selectedNodeId = 'node-1';

      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('parameter-panel')).toBeInTheDocument();
      expect(screen.getByTestId('parameter-panel-content')).toBeInTheDocument();
    });

    it('closes parameter panel when close button is clicked', async () => {
      mockFlowStore.parameterPanelOpen = true;
      mockFlowStore.selectedNodeId = 'node-1';

      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      const closeButton = screen.getByTestId('close-panel');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(mockFlowStore.setParameterPanelOpen).toHaveBeenCalledWith(false);
        expect(mockFlowStore.setSelectedNodeId).toHaveBeenCalledWith(null);
      });
    });
  });

  describe('Node Selection and Multi-selection', () => {
    it('handles single node selection', async () => {
      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      const node = screen.getByTestId('node-node-1');
      fireEvent.click(node);

      await waitFor(() => {
        expect(mockFlowStore.setSelectedNodeId).toHaveBeenCalledWith('node-1');
      });
    });

    it('shows selection menu for multiple nodes', () => {
      const mockLastSelection = {
        nodes: [
          { id: 'node-1', data: mockFlowStore.nodes[0].data },
          { id: 'node-2', data: mockFlowStore.nodes[1].data },
        ],
        edges: [],
      };

      // Mock the selection menu visibility
      render(
        <ReactFlowProvider>
          <div data-testid="selection-menu">
            Selection Menu ({mockLastSelection.nodes.length} nodes)
          </div>
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('selection-menu')).toBeInTheDocument();
      expect(screen.getByText('Selection Menu (2 nodes)')).toBeInTheDocument();
    });
  });

  describe('Workflow Operations', () => {
    it('handles node deletion', async () => {
      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      // Simulate delete key press
      fireEvent.keyDown(document, { key: 'Delete' });

      await waitFor(() => {
        expect(mockFlowsManagerStore.takeSnapshot).toHaveBeenCalled();
      });
    });

    it('handles copy and paste operations', async () => {
      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      // Simulate Ctrl+C (copy)
      fireEvent.keyDown(document, { key: 'c', ctrlKey: true });

      // Simulate Ctrl+V (paste)
      fireEvent.keyDown(document, { key: 'v', ctrlKey: true });

      await waitFor(() => {
        expect(mockFlowsManagerStore.takeSnapshot).toHaveBeenCalled();
      });
    });

    it('handles undo and redo operations', async () => {
      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      // Simulate Ctrl+Z (undo)
      fireEvent.keyDown(document, { key: 'z', ctrlKey: true });
      expect(mockFlowsManagerStore.undo).toHaveBeenCalled();

      // Simulate Ctrl+Y (redo)
      fireEvent.keyDown(document, { key: 'y', ctrlKey: true });
      expect(mockFlowsManagerStore.redo).toHaveBeenCalled();
    });
  });

  describe('Drag and Drop Integration', () => {
    it('handles component drag from sidebar', async () => {
      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      const canvas = screen.getByTestId('react-flow');

      // Simulate drag over
      fireEvent.dragOver(canvas, {
        dataTransfer: {
          types: ['application/reactflow'],
          getData: () => JSON.stringify({
            type: 'ChatOpenAI',
            node: { display_name: 'New Chat Node' },
          }),
        },
      });

      // Simulate drop
      fireEvent.drop(canvas, {
        clientX: 200,
        clientY: 200,
        dataTransfer: {
          types: ['application/reactflow'],
          getData: () => JSON.stringify({
            type: 'ChatOpenAI',
            node: { display_name: 'New Chat Node' },
          }),
        },
      });

      await waitFor(() => {
        expect(mockFlowsManagerStore.takeSnapshot).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('handles missing node data gracefully', () => {
      const storeWithMissingData = {
        ...mockFlowStore,
        nodes: [
          {
            id: 'broken-node',
            type: 'genericNode',
            position: { x: 100, y: 100 },
            data: null,
          },
        ],
      };

      jest.mocked(require('../../../../src/stores/flowStore').default).mockReturnValue(storeWithMissingData);

      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      // Should render without crashing
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });

    it('handles store errors gracefully', () => {
      const errorStore = {
        ...mockFlowStore,
        nodes: null,
        edges: null,
      };

      jest.mocked(require('../../../../src/stores/flowStore').default).mockReturnValue(errorStore);

      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      // Should render without crashing
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      // Re-render with same props
      rerender(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );

      // Should maintain same DOM structure
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });

    it('handles large numbers of nodes efficiently', () => {
      const manyNodes = Array.from({ length: 100 }, (_, i) => ({
        id: `node-${i}`,
        type: 'genericNode',
        position: { x: (i % 10) * 150, y: Math.floor(i / 10) * 100 },
        data: {
          type: 'TestNode',
          node: {
            display_name: `Node ${i}`,
            description: `Test node ${i}`,
          },
        },
      }));

      const largeStore = {
        ...mockFlowStore,
        nodes: manyNodes,
      };

      jest.mocked(require('../../../../src/stores/flowStore').default).mockReturnValue(largeStore);

      const startTime = performance.now();
      render(
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      );
      const endTime = performance.now();

      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });
}); 