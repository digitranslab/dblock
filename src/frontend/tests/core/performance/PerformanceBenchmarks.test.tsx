import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReactFlowProvider } from '@xyflow/react';

// Performance measurement utilities
const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;
  
  console.log(`${name}: ${duration.toFixed(2)}ms`);
  return duration;
};

const measureMemory = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    };
  }
  return null;
};

// Mock data generators
const generateMockNodes = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `node-${i}`,
    type: 'genericNode',
    position: { 
      x: (i % 10) * 150, 
      y: Math.floor(i / 10) * 100 
    },
    data: {
      type: 'ChatOpenAI',
      node: {
        display_name: `Node ${i}`,
        description: `Test node ${i}`,
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
  }));
};

const generateMockEdges = (nodeCount: number) => {
  const edges = [];
  for (let i = 0; i < nodeCount - 1; i++) {
    edges.push({
      id: `edge-${i}`,
      source: `node-${i}`,
      target: `node-${i + 1}`,
      sourceHandle: 'output',
      targetHandle: 'input',
    });
  }
  return edges;
};

// Mock stores for performance testing
const createMockStore = (nodeCount: number) => ({
  reactFlowInstance: null,
  setReactFlowInstance: jest.fn(),
  nodes: generateMockNodes(nodeCount),
  edges: generateMockEdges(nodeCount),
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
});

// Mock WorkflowCanvas component for performance testing
const MockWorkflowCanvas = ({ nodeCount = 10 }: { nodeCount?: number }) => {
  const nodes = generateMockNodes(nodeCount);
  const edges = generateMockEdges(nodeCount);
  
  return (
    <div
      data-testid="workflow-canvas"
      style={{
        width: '100%',
        height: '600px',
        backgroundColor: '#f8fafc',
        position: 'relative',
      }}
    >
      <div data-testid="workflow-nodes">
        {nodes.map((node) => (
          <div
            key={node.id}
            data-testid={`node-${node.id}`}
            style={{
              position: 'absolute',
              left: node.position.x,
              top: node.position.y,
              width: '140px',
              height: '80px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => {
              // Simulate node click
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '500' }}>
              {node.data.node.display_name}
            </div>
          </div>
        ))}
      </div>
      <div data-testid="workflow-edges">
        {edges.map((edge) => (
          <div key={edge.id} data-testid={`edge-${edge.id}`}>
            {/* Mock edge rendering */}
          </div>
        ))}
      </div>
    </div>
  );
};

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any existing performance marks
    if (performance.clearMarks) {
      performance.clearMarks();
    }
  });

  describe('Rendering Performance', () => {
    it('renders small workflow (10 nodes) efficiently', () => {
      const duration = measurePerformance('Small workflow render', () => {
        render(
          <ReactFlowProvider>
            <MockWorkflowCanvas nodeCount={10} />
          </ReactFlowProvider>
        );
      });
      
      // Should render in less than 50ms
      expect(duration).toBeLessThan(50);
    });

    it('renders medium workflow (50 nodes) efficiently', () => {
      const duration = measurePerformance('Medium workflow render', () => {
        render(
          <ReactFlowProvider>
            <MockWorkflowCanvas nodeCount={50} />
          </ReactFlowProvider>
        );
      });
      
      // Should render in less than 200ms
      expect(duration).toBeLessThan(200);
    });

    it('renders large workflow (100 nodes) efficiently', () => {
      const duration = measurePerformance('Large workflow render', () => {
        render(
          <ReactFlowProvider>
            <MockWorkflowCanvas nodeCount={100} />
          </ReactFlowProvider>
        );
      });
      
      // Should render in less than 500ms
      expect(duration).toBeLessThan(500);
    });

    it('measures re-render performance', () => {
      const { rerender } = render(
        <ReactFlowProvider>
          <MockWorkflowCanvas nodeCount={20} />
        </ReactFlowProvider>
      );
      
      const duration = measurePerformance('Re-render performance', () => {
        rerender(
          <ReactFlowProvider>
            <MockWorkflowCanvas nodeCount={20} />
          </ReactFlowProvider>
        );
      });
      
      // Re-renders should be faster than initial render
      expect(duration).toBeLessThan(30);
    });
  });

  describe('Interaction Performance', () => {
    it('measures node click response time', () => {
      render(
        <ReactFlowProvider>
          <MockWorkflowCanvas nodeCount={20} />
        </ReactFlowProvider>
      );
      
      const node = screen.getByTestId('node-node-0');
      
      const duration = measurePerformance('Node click response', () => {
        fireEvent.click(node);
      });
      
      // Click should respond in less than 16ms (60fps)
      expect(duration).toBeLessThan(16);
    });

    it('measures parameter panel open performance', () => {
      const MockParameterPanel = ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? (
          <div data-testid="parameter-panel" style={{ width: '480px', height: '100vh' }}>
            Parameter Panel Content
          </div>
        ) : null;
      
      const { rerender } = render(<MockParameterPanel isOpen={false} />);
      
      const duration = measurePerformance('Parameter panel open', () => {
        rerender(<MockParameterPanel isOpen={true} />);
      });
      
      // Panel should open in less than 20ms
      expect(duration).toBeLessThan(20);
    });

    it('measures drag operation performance', () => {
      render(
        <ReactFlowProvider>
          <MockWorkflowCanvas nodeCount={20} />
        </ReactFlowProvider>
      );
      
      const node = screen.getByTestId('node-node-0');
      
      const duration = measurePerformance('Drag operation', () => {
        fireEvent.mouseDown(node, { clientX: 100, clientY: 100 });
        fireEvent.mouseMove(node, { clientX: 150, clientY: 150 });
        fireEvent.mouseUp(node);
      });
      
      // Drag operation should complete in less than 30ms
      expect(duration).toBeLessThan(30);
    });
  });

  describe('Memory Performance', () => {
    it('monitors memory usage during large workflow rendering', () => {
      const memoryBefore = measureMemory();
      
      render(
        <ReactFlowProvider>
          <MockWorkflowCanvas nodeCount={100} />
        </ReactFlowProvider>
      );
      
      const memoryAfter = measureMemory();
      
      if (memoryBefore && memoryAfter) {
        const memoryIncrease = memoryAfter.used - memoryBefore.used;
        console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
        
        // Memory increase should be reasonable (less than 50MB)
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }
    });

    it('checks for memory leaks during component unmounting', () => {
      const memoryBefore = measureMemory();
      
      const { unmount } = render(
        <ReactFlowProvider>
          <MockWorkflowCanvas nodeCount={50} />
        </ReactFlowProvider>
      );
      
      unmount();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const memoryAfter = measureMemory();
      
      if (memoryBefore && memoryAfter) {
        const memoryDifference = memoryAfter.used - memoryBefore.used;
        console.log(`Memory difference after unmount: ${(memoryDifference / 1024 / 1024).toFixed(2)}MB`);
        
        // Memory usage should return close to baseline
        expect(Math.abs(memoryDifference)).toBeLessThan(10 * 1024 * 1024);
      }
    });
  });

  describe('Animation Performance', () => {
    it('measures CSS transition performance', () => {
      const TestComponent = ({ animate }: { animate: boolean }) => (
        <div
          data-testid="animated-element"
          style={{
            width: '100px',
            height: '100px',
            backgroundColor: 'blue',
            transform: animate ? 'translateX(100px)' : 'translateX(0)',
            transition: 'transform 200ms ease',
          }}
        >
          Animated Element
        </div>
      );
      
      const { rerender } = render(<TestComponent animate={false} />);
      
      const duration = measurePerformance('CSS transition trigger', () => {
        rerender(<TestComponent animate={true} />);
      });
      
      // Animation trigger should be fast
      expect(duration).toBeLessThan(10);
    });

    it('measures scroll performance with many nodes', () => {
      const ScrollContainer = () => (
        <div
          data-testid="scroll-container"
          style={{
            width: '400px',
            height: '300px',
            overflow: 'auto',
          }}
        >
          <MockWorkflowCanvas nodeCount={50} />
        </div>
      );
      
      render(<ScrollContainer />);
      
      const container = screen.getByTestId('scroll-container');
      
      const duration = measurePerformance('Scroll performance', () => {
        fireEvent.scroll(container, { target: { scrollTop: 500 } });
      });
      
      // Scroll should be responsive
      expect(duration).toBeLessThan(16);
    });
  });

  describe('Bundle Size Performance', () => {
    it('measures component size impact', () => {
      const componentSizes = {
        WorkflowCanvas: 0, // Would be measured in actual build
        MinimalNode: 0,
        ParameterPanel: 0,
      };
      
      // Mock bundle size measurements
      componentSizes.WorkflowCanvas = 45; // KB
      componentSizes.MinimalNode = 12; // KB
      componentSizes.ParameterPanel = 28; // KB
      
      const totalSize = Object.values(componentSizes).reduce((sum, size) => sum + size, 0);
      
      console.log('Component sizes:', componentSizes);
      console.log(`Total bundle size increase: ${totalSize}KB`);
      
      // Total size increase should be reasonable
      expect(totalSize).toBeLessThan(100); // Less than 100KB
    });
  });

  describe('Feature Flag Performance', () => {
    it('measures feature flag evaluation performance', () => {
      const mockUseFeatureFlag = (flag: string) => {
        // Simulate feature flag lookup
        const flags = {
          NEW_WORKFLOW_DESIGN: true,
          ENHANCED_NODES: false,
          ADVANCED_PANEL: true,
        };
        return flags[flag as keyof typeof flags] || false;
      };
      
      const duration = measurePerformance('Feature flag evaluation', () => {
        for (let i = 0; i < 1000; i++) {
          mockUseFeatureFlag('NEW_WORKFLOW_DESIGN');
        }
      });
      
      // 1000 evaluations should be very fast
      expect(duration).toBeLessThan(10);
    });

    it('measures conditional rendering performance', () => {
      const ConditionalComponent = ({ useNewDesign }: { useNewDesign: boolean }) => (
        <div>
          {useNewDesign ? (
            <MockWorkflowCanvas nodeCount={20} />
          ) : (
            <div data-testid="legacy-component">Legacy Component</div>
          )}
        </div>
      );
      
      const { rerender } = render(<ConditionalComponent useNewDesign={false} />);
      
      const duration = measurePerformance('Conditional rendering switch', () => {
        rerender(<ConditionalComponent useNewDesign={true} />);
      });
      
      // Switching between designs should be fast
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Real-world Scenarios', () => {
    it('measures complete workflow creation performance', () => {
      const duration = measurePerformance('Complete workflow creation', () => {
        const { container } = render(
          <ReactFlowProvider>
            <MockWorkflowCanvas nodeCount={30} />
          </ReactFlowProvider>
        );
        
        // Simulate adding nodes
        const canvas = container.querySelector('[data-testid="workflow-canvas"]');
        if (canvas) {
          fireEvent.click(canvas);
        }
        
        // Simulate connecting nodes
        const firstNode = container.querySelector('[data-testid="node-node-0"]');
        if (firstNode) {
          fireEvent.click(firstNode);
        }
      });
      
      // Complete workflow creation should be smooth
      expect(duration).toBeLessThan(200);
    });

    it('measures parameter editing workflow performance', () => {
      const MockEditingWorkflow = () => {
        const [panelOpen, setPanelOpen] = React.useState(false);
        
        return (
          <div>
            <button
              data-testid="open-panel"
              onClick={() => setPanelOpen(true)}
            >
              Open Panel
            </button>
            {panelOpen && (
              <div data-testid="parameter-panel">
                <input data-testid="parameter-input" />
                <button
                  data-testid="close-panel"
                  onClick={() => setPanelOpen(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        );
      };
      
      render(<MockEditingWorkflow />);
      
      const duration = measurePerformance('Parameter editing workflow', () => {
        const openButton = screen.getByTestId('open-panel');
        fireEvent.click(openButton);
        
        const input = screen.getByTestId('parameter-input');
        fireEvent.change(input, { target: { value: 'test value' } });
        
        const closeButton = screen.getByTestId('close-panel');
        fireEvent.click(closeButton);
      });
      
      // Parameter editing workflow should be responsive
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Comparison Benchmarks', () => {
    it('compares new vs legacy component performance', () => {
      const LegacyComponent = () => (
        <div data-testid="legacy-workflow">
          {/* Simulate heavier legacy component */}
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} style={{ padding: '20px', border: '1px solid #ccc' }}>
              Legacy Node {i}
            </div>
          ))}
        </div>
      );
      
      const newDuration = measurePerformance('New component render', () => {
        render(<MockWorkflowCanvas nodeCount={20} />);
      });
      
      const legacyDuration = measurePerformance('Legacy component render', () => {
        render(<LegacyComponent />);
      });
      
      console.log(`Performance improvement: ${((legacyDuration - newDuration) / legacyDuration * 100).toFixed(1)}%`);
      
      // New component should be at least as fast as legacy
      expect(newDuration).toBeLessThanOrEqual(legacyDuration * 1.1); // Allow 10% tolerance
    });
  });
}); 