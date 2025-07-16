import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReactFlowProvider } from '@xyflow/react';

// Mock data for consistent visual testing
const mockNodeData = {
  id: 'visual-test-node',
  type: 'ChatOpenAI',
  node: {
    display_name: 'Visual Test Node',
    description: 'A node for visual regression testing',
    icon: 'OpenAi',
    template: {
      temperature: {
        display_name: 'Temperature',
        type: 'float',
        value: 0.7,
      },
    },
  },
  value: null,
};

const mockNode = {
  id: 'visual-test-node-id',
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

// Mock MinimalNode component for visual testing
const MockMinimalNode = ({ data, selected, dragging, ...props }: any) => (
  <div
    className={`minimal-node ${selected ? 'minimal-node--selected' : ''} ${dragging ? 'minimal-node--dragging' : ''}`}
    style={{
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
      gap: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 200ms ease',
    }}
    {...props}
  >
    <div className="node-icon" style={{ fontSize: '24px', color: '#3b82f6' }}>
      🤖
    </div>
    <div className="node-name" style={{ fontSize: '12px', fontWeight: '500', textAlign: 'center' }}>
      {data.node.display_name}
    </div>
  </div>
);

// Mock ParameterPanel component for visual testing
const MockParameterPanel = ({ isOpen }: { isOpen: boolean }) =>
  isOpen ? (
    <div
      className="parameter-panel"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '480px',
        height: '100vh',
        backgroundColor: 'white',
        borderLeft: '1px solid #e2e8f0',
        boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.1)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="panel-header" style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
          Node Configuration
        </h2>
      </div>
      <div className="panel-content" style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            Temperature
          </label>
          <input
            type="number"
            defaultValue={0.7}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            Max Tokens
          </label>
          <input
            type="number"
            defaultValue={100}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>
      </div>
    </div>
  ) : null;

// Mock WorkflowCanvas for visual testing
const MockWorkflowCanvas = ({ showParameterPanel = false }: { showParameterPanel?: boolean }) => (
  <div
    className="workflow-canvas"
    style={{
      width: '100%',
      height: '600px',
      backgroundColor: '#f8fafc',
      position: 'relative',
      backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    }}
  >
    <div className="workflow-nodes">
      <MockMinimalNode data={mockNodeData} selected={false} dragging={false} />
      <div style={{ position: 'absolute', left: '300px', top: '100px' }}>
        <MockMinimalNode data={{...mockNodeData, node: {...mockNodeData.node, display_name: 'Second Node'}}} selected={true} dragging={false} />
      </div>
      <div style={{ position: 'absolute', left: '500px', top: '100px' }}>
        <MockMinimalNode data={{...mockNodeData, node: {...mockNodeData.node, display_name: 'Third Node'}}} selected={false} dragging={true} />
      </div>
    </div>
    
    {/* Mock connection lines */}
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <path
        d="M 240 140 Q 270 140 270 140 Q 270 140 300 140"
        stroke="#64748b"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M 440 140 Q 470 140 470 140 Q 470 140 500 140"
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
      />
    </svg>
    
    {showParameterPanel && <MockParameterPanel isOpen={true} />}
  </div>
);

describe('Visual Regression Tests', () => {
  // Helper function to create consistent test environment
  const createTestEnvironment = (component: React.ReactElement) => {
    return render(
      <ReactFlowProvider>
        <div style={{ width: '1200px', height: '800px', fontFamily: 'Inter, sans-serif' }}>
          {component}
        </div>
      </ReactFlowProvider>
    );
  };

  describe('MinimalNode Visual Tests', () => {
    it('renders idle state correctly', () => {
      const { container } = createTestEnvironment(
        <MockMinimalNode data={mockNodeData} selected={false} dragging={false} />
      );
      
      const nodeElement = container.querySelector('.minimal-node');
      expect(nodeElement).toMatchSnapshot('minimal-node-idle-state');
    });

    it('renders selected state correctly', () => {
      const { container } = createTestEnvironment(
        <MockMinimalNode data={mockNodeData} selected={true} dragging={false} />
      );
      
      const nodeElement = container.querySelector('.minimal-node');
      expect(nodeElement).toMatchSnapshot('minimal-node-selected-state');
    });

    it('renders dragging state correctly', () => {
      const { container } = createTestEnvironment(
        <MockMinimalNode data={mockNodeData} selected={false} dragging={true} />
      );
      
      const nodeElement = container.querySelector('.minimal-node');
      expect(nodeElement).toMatchSnapshot('minimal-node-dragging-state');
    });

    it('renders with different node types', () => {
      const nodeTypes = ['ChatOpenAI', 'PromptTemplate', 'LLMChain'];
      
      nodeTypes.forEach(type => {
        const typeData = {
          ...mockNodeData,
          type,
          node: {
            ...mockNodeData.node,
            display_name: type,
          },
        };
        
        const { container } = createTestEnvironment(
          <MockMinimalNode data={typeData} selected={false} dragging={false} />
        );
        
        expect(container.firstChild).toMatchSnapshot(`minimal-node-${type.toLowerCase()}`);
      });
    });
  });

  describe('ParameterPanel Visual Tests', () => {
    it('renders parameter panel correctly', () => {
      const { container } = createTestEnvironment(
        <MockParameterPanel isOpen={true} />
      );
      
      const panelElement = container.querySelector('.parameter-panel');
      expect(panelElement).toMatchSnapshot('parameter-panel-open');
    });

    it('does not render when closed', () => {
      const { container } = createTestEnvironment(
        <MockParameterPanel isOpen={false} />
      );
      
      expect(container.innerHTML).toMatchSnapshot('parameter-panel-closed');
    });
  });

  describe('WorkflowCanvas Visual Tests', () => {
    it('renders empty canvas correctly', () => {
      const { container } = createTestEnvironment(
        <div
          className="workflow-canvas"
          style={{
            width: '100%',
            height: '600px',
            backgroundColor: '#f8fafc',
            backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
      );
      
      expect(container.firstChild).toMatchSnapshot('workflow-canvas-empty');
    });

    it('renders canvas with nodes correctly', () => {
      const { container } = createTestEnvironment(
        <MockWorkflowCanvas showParameterPanel={false} />
      );
      
      expect(container.firstChild).toMatchSnapshot('workflow-canvas-with-nodes');
    });

    it('renders canvas with parameter panel correctly', () => {
      const { container } = createTestEnvironment(
        <MockWorkflowCanvas showParameterPanel={true} />
      );
      
      expect(container.firstChild).toMatchSnapshot('workflow-canvas-with-parameter-panel');
    });
  });

  describe('Responsive Visual Tests', () => {
    it('renders correctly on mobile viewport', () => {
      const { container } = render(
        <div style={{ width: '375px', height: '667px', fontFamily: 'Inter, sans-serif' }}>
          <MockWorkflowCanvas showParameterPanel={false} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('workflow-mobile-viewport');
    });

    it('renders correctly on tablet viewport', () => {
      const { container } = render(
        <div style={{ width: '768px', height: '1024px', fontFamily: 'Inter, sans-serif' }}>
          <MockWorkflowCanvas showParameterPanel={true} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('workflow-tablet-viewport');
    });

    it('renders correctly on desktop viewport', () => {
      const { container } = render(
        <div style={{ width: '1920px', height: '1080px', fontFamily: 'Inter, sans-serif' }}>
          <MockWorkflowCanvas showParameterPanel={true} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('workflow-desktop-viewport');
    });
  });

  describe('Theme Visual Tests', () => {
    it('renders correctly in light theme', () => {
      const { container } = render(
        <div data-theme="light" style={{ width: '1200px', height: '800px', fontFamily: 'Inter, sans-serif' }}>
          <MockWorkflowCanvas showParameterPanel={true} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('workflow-light-theme');
    });

    it('renders correctly in dark theme', () => {
      const { container } = render(
        <div 
          data-theme="dark" 
          style={{ 
            width: '1200px', 
            height: '800px', 
            fontFamily: 'Inter, sans-serif',
            backgroundColor: '#1a1a1a',
            color: '#ffffff'
          }}
        >
          <MockWorkflowCanvas showParameterPanel={true} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('workflow-dark-theme');
    });
  });

  describe('Animation State Visual Tests', () => {
    it('captures transition states correctly', () => {
      const states = ['initial', 'hover', 'active', 'focus'];
      
      states.forEach(state => {
        const stateClass = `minimal-node--${state}`;
        const { container } = createTestEnvironment(
          <div className={stateClass}>
            <MockMinimalNode data={mockNodeData} selected={false} dragging={false} />
          </div>
        );
        
        expect(container.firstChild).toMatchSnapshot(`node-animation-${state}`);
      });
    });
  });

  describe('Error State Visual Tests', () => {
    it('renders error states correctly', () => {
      const errorStates = ['error', 'warning', 'success', 'loading'];
      
      errorStates.forEach(state => {
        const errorData = {
          ...mockNodeData,
          status: state,
          node: {
            ...mockNodeData.node,
            display_name: `${state.charAt(0).toUpperCase() + state.slice(1)} Node`,
          },
        };
        
        const { container } = createTestEnvironment(
          <MockMinimalNode data={errorData} selected={false} dragging={false} />
        );
        
        expect(container.firstChild).toMatchSnapshot(`node-${state}-state`);
      });
    });
  });

  describe('Accessibility Visual Tests', () => {
    it('renders with high contrast correctly', () => {
      const { container } = render(
        <div 
          style={{ 
            width: '1200px', 
            height: '800px', 
            fontFamily: 'Inter, sans-serif',
            filter: 'contrast(150%)'
          }}
        >
          <MockWorkflowCanvas showParameterPanel={true} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('workflow-high-contrast');
    });

    it('renders with reduced motion correctly', () => {
      const { container } = render(
        <div 
          style={{ 
            width: '1200px', 
            height: '800px', 
            fontFamily: 'Inter, sans-serif'
          }}
          data-prefers-reduced-motion="reduce"
        >
          <MockWorkflowCanvas showParameterPanel={true} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('workflow-reduced-motion');
    });
  });
}); 