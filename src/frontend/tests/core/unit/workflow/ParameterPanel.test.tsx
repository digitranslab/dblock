import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ParameterPanel from '../../../../src/components/ParameterPanel';
import { NodeData } from '../../../../src/types/flow';

// Mock dependencies
jest.mock('../../../../src/stores/flowStore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    selectedNodeId: 'test-node-id',
    nodes: [
      {
        id: 'test-node-id',
        type: 'genericNode',
        data: {
          type: 'ChatOpenAI',
          node: {
            display_name: 'Test Node',
            description: 'A test node for parameter panel testing',
            icon: 'OpenAi',
            template: {
              temperature: {
                display_name: 'Temperature',
                type: 'float',
                value: 0.7,
              },
              max_tokens: {
                display_name: 'Max Tokens',
                type: 'int',
                value: 100,
              },
            },
          },
        },
      },
    ],
  })),
}));

jest.mock('../../../../src/CustomNodes/GenericNode/components/nodeIcon', () => ({
  NodeIcon: ({ dataType }: { dataType: string }) => (
    <div data-testid="node-icon" data-type={dataType}>
      Icon
    </div>
  ),
}));

jest.mock('../../../../src/modals/editNodeModal/components/editNodeComponent', () => ({
  EditNodeComponent: ({ nodeId, nodeClass }: { nodeId: string; nodeClass: any }) => (
    <div data-testid="edit-node-component" data-node-id={nodeId}>
      <div>Parameter Form</div>
      <input data-testid="temperature-input" placeholder="Temperature" />
      <input data-testid="max-tokens-input" placeholder="Max Tokens" />
    </div>
  ),
}));

describe('ParameterPanel', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when open with selected node', () => {
      render(<ParameterPanel isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByTestId('node-icon')).toBeInTheDocument();
      expect(screen.getByText('Test Node')).toBeInTheDocument();
      expect(screen.getByText('ChatOpenAI')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<ParameterPanel isOpen={false} onClose={mockOnClose} />);
      
      expect(screen.queryByTestId('node-icon')).not.toBeInTheDocument();
    });

    it('renders with correct styling and dimensions', () => {
      const { container } = render(
        <ParameterPanel isOpen={true} onClose={mockOnClose} />
      );
      
      const panelElement = container.querySelector('[data-parameter-panel="true"]');
      expect(panelElement).toHaveClass('w-[480px]');
      expect(panelElement).toHaveClass('fixed');
      expect(panelElement).toHaveClass('top-0');
      expect(panelElement).toHaveClass('right-0');
    });

    it('shows backdrop when open', () => {
      const { container } = render(
        <ParameterPanel isOpen={true} onClose={mockOnClose} />
      );
      
      const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/20');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('displays node information correctly', () => {
      render(<ParameterPanel isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByText('Test Node')).toBeInTheDocument();
      expect(screen.getByText('ChatOpenAI')).toBeInTheDocument();
      expect(screen.getByText('A test node for parameter panel testing')).toBeInTheDocument();
    });

    it('displays configuration section', () => {
      render(<ParameterPanel isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByText('Configuration')).toBeInTheDocument();
      expect(screen.getByTestId('edit-node-component')).toBeInTheDocument();
    });

    it('displays node ID in footer', () => {
      render(<ParameterPanel isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByText('Node ID: test-node-id')).toBeInTheDocument();
    });

    it('displays keyboard shortcut hint', () => {
      render(<ParameterPanel isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByText('Press')).toBeInTheDocument();
      expect(screen.getByText('Esc')).toBeInTheDocument();
      expect(screen.getByText('to close')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClose when close button is clicked', () => {
      render(<ParameterPanel isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button', { name: 'Close panel' });
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
      const { container } = render(
        <ParameterPanel isOpen={true} onClose={mockOnClose} />
      );
      
      const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/20');
      fireEvent.click(backdrop!);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when clicking inside panel', () => {
      const { container } = render(
        <ParameterPanel isOpen={true} onClose={mockOnClose} />
      );
      
      const panel = container.querySelector('[data-parameter-panel="true"]');
      fireEvent.click(panel!);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', async () => {
      render(<ParameterPanel isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call onClose when other keys are pressed', () => {
      render(<ParameterPanel isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Animation and Transitions', () => {
    it('applies correct transition classes when opening', () => {
      const { container } = render(
        <ParameterPanel isOpen={true} onClose={mockOnClose} />
      );
      
      const panel = container.querySelector('[data-parameter-panel="true"]');
      expect(panel).toHaveClass('transition-transform');
      expect(panel).toHaveClass('duration-300');
      expect(panel).toHaveClass('translate-x-0');
    });

    it('applies correct transition classes when closing', () => {
      const { container, rerender } = render(
        <ParameterPanel isOpen={true} onClose={mockOnClose} />
      );
      
      rerender(<ParameterPanel isOpen={false} onClose={mockOnClose} />);
      
      const panel = container.querySelector('[data-parameter-panel="true"]');
      expect(panel).toHaveClass('translate-x-full');
    });

    it('applies backdrop opacity transitions', () => {
      const { container } = render(
        <ParameterPanel isOpen={true} onClose={mockOnClose} />
      );
      
      const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/20');
      expect(backdrop).toHaveClass('transition-opacity');
      expect(backdrop).toHaveClass('duration-300');
      expect(backdrop).toHaveClass('opacity-100');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ParameterPanel isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button', { name: 'Close panel' });
      expect(closeButton).toHaveAttribute('aria-label', 'Close panel');
    });

    it('focuses management works correctly', () => {
      render(<ParameterPanel isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button', { name: 'Close panel' });
      closeButton.focus();
      
      expect(closeButton).toHaveFocus();
    });

    it('supports keyboard navigation', () => {
      render(<ParameterPanel isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button', { name: 'Close panel' });
      
      // Test Enter key
      fireEvent.keyDown(closeButton, { key: 'Enter' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      
      // Reset mock
      mockOnClose.mockClear();
      
      // Test Space key
      fireEvent.keyDown(closeButton, { key: ' ' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('handles missing node data gracefully', () => {
      // Mock store with no nodes
      jest.doMock('../../../../src/stores/flowStore', () => ({
        __esModule: true,
        default: jest.fn(() => ({
          selectedNodeId: 'non-existent-node',
          nodes: [],
        })),
      }));
      
      const { container } = render(
        <ParameterPanel isOpen={true} onClose={mockOnClose} />
      );
      
      // Should not render when no node is found
      expect(container.firstChild).toBeNull();
    });

    it('handles missing node properties gracefully', () => {
      // Mock store with incomplete node data
      jest.doMock('../../../../src/stores/flowStore', () => ({
        __esModule: true,
        default: jest.fn(() => ({
          selectedNodeId: 'incomplete-node',
          nodes: [
            {
              id: 'incomplete-node',
              type: 'genericNode',
              data: {
                type: 'UnknownNode',
                node: {
                  display_name: undefined,
                  description: undefined,
                },
              },
            },
          ],
        })),
      }));
      
      const { container } = render(
        <ParameterPanel isOpen={true} onClose={mockOnClose} />
      );
      
      // Should render without crashing
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('only renders when open', () => {
      const { container, rerender } = render(
        <ParameterPanel isOpen={false} onClose={mockOnClose} />
      );
      
      expect(container.firstChild).toBeNull();
      
      rerender(<ParameterPanel isOpen={true} onClose={mockOnClose} />);
      
      expect(container.firstChild).toBeInTheDocument();
    });

    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(
        <ParameterPanel isOpen={true} onClose={mockOnClose} />
      );
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Visual States', () => {
    it('shows different states for different node types', () => {
      const nodeTypes = ['input', 'processing', 'output'];
      
      nodeTypes.forEach(type => {
        // Mock different node types
        jest.doMock('../../../../src/stores/flowStore', () => ({
          __esModule: true,
          default: jest.fn(() => ({
            selectedNodeId: `${type}-node`,
            nodes: [
              {
                id: `${type}-node`,
                type: 'genericNode',
                data: {
                  type: type,
                  node: {
                    display_name: `${type} Node`,
                    description: `A ${type} node`,
                  },
                },
              },
            ],
          })),
        }));
        
        render(<ParameterPanel isOpen={true} onClose={mockOnClose} />);
        
        expect(screen.getByText(`${type} Node`)).toBeInTheDocument();
      });
    });
  });
}); 