import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReactFlowProvider } from '@xyflow/react';
import MinimalNode from '@/CustomNodes/MinimalNode';
import { NodeData } from '@/types/flow';

// Mock dependencies
jest.mock('@/stores/flowStore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    setSelectedNodeId: jest.fn(),
    setParameterPanelOpen: jest.fn(),
  })),
}));

jest.mock('@/CustomNodes/GenericNode/components/nodeIcon', () => ({
  NodeIcon: ({ dataType, showNode }: { dataType: string; showNode: boolean }) => (
    <div data-testid="node-icon" data-type={dataType} data-show-node={showNode}>
      Icon
    </div>
  ),
}));

// Mock data
const mockNodeData: NodeData = {
  id: 'test-node',
  type: 'ChatOpenAI',
  node: {
    display_name: 'Test Node',
    description: 'A test node for unit testing',
    icon: 'OpenAi',
    documentation: '',
    base_classes: ['BaseLanguageModel'],
    template: {},
  },
  value: null,
};

const mockNode = {
  id: 'test-node-id',
  type: 'genericNode',
  position: { x: 100, y: 100 },
  data: mockNodeData,
  selected: false,
  dragging: false,
  dragHandle: '',
  width: 140,
  height: 80,
  positionAbsolute: { x: 100, y: 100 },
  zIndex: 1,
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ReactFlowProvider>
    <div style={{ width: '800px', height: '600px' }}>
      {children}
    </div>
  </ReactFlowProvider>
);

describe('WorkflowNode (MinimalNode)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with correct styling and dimensions', () => {
      const { container } = render(
        <TestWrapper>
          <MinimalNode {...mockNode} />
        </TestWrapper>
      );
      
      const nodeElement = container.querySelector('.minimal-node');
      expect(nodeElement).toBeInTheDocument();
      expect(nodeElement).toHaveClass('minimal-node');
      expect(nodeElement).toHaveStyle({
        width: '140px',
        height: '80px'
      });
    });

    it('displays node icon and name correctly', () => {
      render(
        <TestWrapper>
          <MinimalNode {...mockNode} />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('node-icon')).toBeInTheDocument();
      expect(screen.getByText('Test Node')).toBeInTheDocument();
    });

    it('applies correct classes based on node type', () => {
      const { container } = render(
        <TestWrapper>
          <MinimalNode {...mockNode} />
        </TestWrapper>
      );
      
      const nodeElement = container.querySelector('.minimal-node');
      expect(nodeElement).toHaveClass('minimal-node--genericNode');
    });
  });

  describe('Status Handling', () => {
    it('handles idle status correctly', () => {
      const { container } = render(
        <TestWrapper>
          <MinimalNode {...mockNode} />
        </TestWrapper>
      );
      
      const nodeElement = container.querySelector('.minimal-node');
      expect(nodeElement).toHaveClass('minimal-node--idle');
    });

    it('handles running status correctly', () => {
      const runningNode = {
        ...mockNode,
        data: { ...mockNodeData, status: 'running' }
      };
      
      const { container } = render(
        <TestWrapper>
          <MinimalNode {...runningNode} />
        </TestWrapper>
      );
      
      const nodeElement = container.querySelector('.minimal-node');
      expect(nodeElement).toHaveClass('minimal-node--running');
    });

    it('handles success status correctly', () => {
      const successNode = {
        ...mockNode,
        data: { ...mockNodeData, status: 'success' }
      };
      
      const { container } = render(
        <TestWrapper>
          <MinimalNode {...successNode} />
        </TestWrapper>
      );
      
      const nodeElement = container.querySelector('.minimal-node');
      expect(nodeElement).toHaveClass('minimal-node--success');
    });

    it('handles error status correctly', () => {
      const errorNode = {
        ...mockNode,
        data: { ...mockNodeData, status: 'error' }
      };
      
      const { container } = render(
        <TestWrapper>
          <MinimalNode {...errorNode} />
        </TestWrapper>
      );
      
      const nodeElement = container.querySelector('.minimal-node');
      expect(nodeElement).toHaveClass('minimal-node--error');
    });

    it('shows building animation when status is building', () => {
      const buildingNode = {
        ...mockNode,
        data: { ...mockNodeData, status: 'building' }
      };
      
      const { container } = render(
        <TestWrapper>
          <MinimalNode {...buildingNode} />
        </TestWrapper>
      );
      
      const nodeElement = container.querySelector('.minimal-node');
      expect(nodeElement).toHaveClass('minimal-node--building');
      expect(nodeElement).toHaveClass('pulse-animation');
    });
  });

  describe('Interactions', () => {
    it('handles click events correctly', () => {
      const mockOnClick = jest.fn();
      
      render(
        <TestWrapper>
          <MinimalNode {...mockNode} onClick={mockOnClick} />
        </TestWrapper>
      );
      
      const nodeElement = screen.getByRole('button');
      fireEvent.click(nodeElement);
      
      expect(mockOnClick).toHaveBeenCalledWith(
        expect.any(Object),
        mockNode
      );
    });

    it('handles hover states correctly', () => {
      const { container } = render(
        <TestWrapper>
          <MinimalNode {...mockNode} />
        </TestWrapper>
      );
      
      const nodeElement = container.querySelector('.minimal-node');
      
      fireEvent.mouseEnter(nodeElement!);
      expect(nodeElement).toHaveClass('minimal-node--hover');
      
      fireEvent.mouseLeave(nodeElement!);
      expect(nodeElement).not.toHaveClass('minimal-node--hover');
    });

    it('handles selection state correctly', () => {
      const selectedNode = {
        ...mockNode,
        selected: true
      };
      
      const { container } = render(
        <TestWrapper>
          <MinimalNode {...selectedNode} />
        </TestWrapper>
      );
      
      const nodeElement = container.querySelector('.minimal-node');
      expect(nodeElement).toHaveClass('minimal-node--selected');
    });

    it('handles dragging state correctly', () => {
      const draggingNode = {
        ...mockNode,
        dragging: true
      };
      
      const { container } = render(
        <TestWrapper>
          <MinimalNode {...draggingNode} />
        </TestWrapper>
      );
      
      const nodeElement = container.querySelector('.minimal-node');
      expect(nodeElement).toHaveClass('minimal-node--dragging');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <MinimalNode {...mockNode} />
        </TestWrapper>
      );
      
      const nodeElement = screen.getByRole('button');
      expect(nodeElement).toHaveAttribute('aria-label', 'Test Node node');
      expect(nodeElement).toHaveAttribute('tabIndex', '0');
    });

    it('supports keyboard navigation', () => {
      const mockOnClick = jest.fn();
      
      render(
        <TestWrapper>
          <MinimalNode {...mockNode} onClick={mockOnClick} />
        </TestWrapper>
      );
      
      const nodeElement = screen.getByRole('button');
      
      // Test Enter key
      fireEvent.keyDown(nodeElement, { key: 'Enter', code: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      
      // Test Space key
      fireEvent.keyDown(nodeElement, { key: ' ', code: 'Space' });
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });

    it('has proper focus management', () => {
      render(
        <TestWrapper>
          <MinimalNode {...mockNode} />
        </TestWrapper>
      );
      
      const nodeElement = screen.getByRole('button');
      nodeElement.focus();
      
      expect(nodeElement).toHaveFocus();
      expect(nodeElement).toHaveClass('minimal-node--focused');
    });
  });

  describe('Performance', () => {
    it('memoizes correctly to prevent unnecessary re-renders', () => {
      const { rerender } = render(
        <TestWrapper>
          <MinimalNode {...mockNode} />
        </TestWrapper>
      );
      
      // Re-render with same props
      rerender(
        <TestWrapper>
          <MinimalNode {...mockNode} />
        </TestWrapper>
      );
      
      // Component should be memoized and not re-render
      expect(screen.getByText('Test Node')).toBeInTheDocument();
    });

    it('re-renders when props change', () => {
      const { rerender } = render(
        <TestWrapper>
          <MinimalNode {...mockNode} />
        </TestWrapper>
      );
      
      const updatedNode = {
        ...mockNode,
        data: {
          ...mockNodeData,
          node: {
            ...mockNodeData.node,
            display_name: 'Updated Node'
          }
        }
      };
      
      rerender(
        <TestWrapper>
          <MinimalNode {...updatedNode} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Updated Node')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing node data gracefully', () => {
      const nodeWithoutData = {
        ...mockNode,
        data: null
      };
      
      const { container } = render(
        <TestWrapper>
          <MinimalNode {...nodeWithoutData} />
        </TestWrapper>
      );
      
      // Should render without crashing
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles missing display name gracefully', () => {
      const nodeWithoutDisplayName = {
        ...mockNode,
        data: {
          ...mockNodeData,
          node: {
            ...mockNodeData.node,
            display_name: undefined
          }
        }
      };
      
      render(
        <TestWrapper>
          <MinimalNode {...nodeWithoutDisplayName} />
        </TestWrapper>
      );
      
      // Should fall back to type
      expect(screen.getByText('ChatOpenAI')).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('applies correct visual state for different node types', () => {
      const nodeTypes = ['input', 'processing', 'output'];
      
      nodeTypes.forEach(type => {
        const typedNode = {
          ...mockNode,
          data: { ...mockNodeData, type }
        };
        
        const { container } = render(
          <TestWrapper>
            <MinimalNode {...typedNode} />
          </TestWrapper>
        );
        
        const nodeElement = container.querySelector('.minimal-node');
        expect(nodeElement).toHaveClass(`minimal-node--${type}`);
      });
    });

    it('handles connection states correctly', () => {
      const connectedNode = {
        ...mockNode,
        data: { ...mockNodeData, connected: true }
      };
      
      const { container } = render(
        <TestWrapper>
          <MinimalNode {...connectedNode} />
        </TestWrapper>
      );
      
      const nodeElement = container.querySelector('.minimal-node');
      expect(nodeElement).toHaveClass('minimal-node--connected');
    });
  });
}); 