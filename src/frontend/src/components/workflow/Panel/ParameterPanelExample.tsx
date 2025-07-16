import React, { useState, useCallback } from 'react';
import { ParameterPanel } from './ParameterPanel';
import useFlowStore from '../../../stores/flowStore';
import './ParameterPanelExample.scss';

// ============================================================================
// Example: How to integrate the Enhanced Parameter Panel
// ============================================================================

interface ParameterPanelExampleProps {
  className?: string;
}

export const ParameterPanelExample: React.FC<ParameterPanelExampleProps> = ({
  className = ''
}) => {
  // Local state for demonstration
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Flow store integration
  const nodes = useFlowStore(state => state.nodes);
  const setNode = useFlowStore(state => state.setNode);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setIsPanelOpen(true);
  }, []);

  const handlePanelClose = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedNodeId(null);
  }, []);

  const handleParameterSave = useCallback(async (
    nodeId: string, 
    parameters: Record<string, unknown>
  ) => {
    try {
      // Custom save logic can go here
      console.log('Saving parameters for node:', nodeId, parameters);
      
      // Example: Call API to save parameters
      // await api.saveNodeParameters(nodeId, parameters);
      
      // Example: Update additional state
      // updateWorkflowState(nodeId, parameters);
      
      // The panel will automatically update the flow store via setNode
      console.log('Parameters saved successfully');
    } catch (error) {
      console.error('Failed to save parameters:', error);
      throw error; // Re-throw to let the panel handle the error
    }
  }, []);

  // ============================================================================
  // Demo Node Data
  // ============================================================================

  const demoNodes = [
    {
      id: 'node-1',
      type: 'ChatOpenAI',
      data: {
        type: 'ChatOpenAI',
        display_name: 'OpenAI Chat',
        description: 'Chat with OpenAI GPT models for natural language processing',
        template: {
          model_name: {
            type: 'str',
            required: true,
            display_name: 'Model Name',
            description: 'The OpenAI model to use',
            value: 'gpt-3.5-turbo',
            options: [
              { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
              { label: 'GPT-4', value: 'gpt-4' },
              { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' }
            ]
          },
          temperature: {
            type: 'float',
            required: false,
            display_name: 'Temperature',
            description: 'Controls randomness in the response (0.0 to 2.0)',
            value: 0.7,
            pattern: '^[0-2](\.[0-9]*)?$'
          },
          max_tokens: {
            type: 'int',
            required: false,
            display_name: 'Max Tokens',
            description: 'Maximum number of tokens to generate',
            value: 1000
          },
          streaming: {
            type: 'bool',
            required: false,
            display_name: 'Streaming',
            description: 'Enable streaming responses',
            value: false
          },
          system_message: {
            type: 'text',
            required: false,
            display_name: 'System Message',
            description: 'System message to guide the AI behavior',
            value: 'You are a helpful assistant.',
            rows: 3
          },
          api_key: {
            type: 'str',
            required: true,
            display_name: 'API Key',
            description: 'OpenAI API key for authentication',
            value: '',
            advanced: true
          }
        }
      }
    },
    {
      id: 'node-2',
      type: 'TextInput',
      data: {
        type: 'TextInput',
        display_name: 'Text Input',
        description: 'Input component for text data',
        template: {
          placeholder: {
            type: 'str',
            required: false,
            display_name: 'Placeholder',
            description: 'Placeholder text for the input field',
            value: 'Enter your text here...'
          },
          multiline: {
            type: 'bool',
            required: false,
            display_name: 'Multiline',
            description: 'Allow multiple lines of text',
            value: false
          }
        }
      }
    }
  ];

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`parameter-panel-example ${className}`}>
      {/* Demo Header */}
      <div className="example-header">
        <h2>Enhanced Parameter Panel Example</h2>
        <p>Click on a node below to open the parameter panel</p>
      </div>

      {/* Demo Nodes */}
      <div className="example-nodes">
        {demoNodes.map((node) => (
          <div
            key={node.id}
            className={`example-node ${selectedNodeId === node.id ? 'example-node--selected' : ''}`}
            onClick={() => handleNodeClick(node.id)}
          >
            <div className="example-node__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </div>
            <div className="example-node__details">
              <h3>{node.data.display_name}</h3>
              <p>{node.data.type}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Features List */}
      <div className="example-features">
        <h3>Enhanced Parameter Panel Features:</h3>
        <ul>
          <li>✅ **Real-time Parameter Validation** - Validates required fields and data types</li>
          <li>✅ **Unsaved Changes Warning** - Prevents accidental data loss</li>
          <li>✅ **Auto-save Integration** - Seamlessly integrates with flow store</li>
          <li>✅ **Error State Management** - Displays field-specific error messages</li>
          <li>✅ **Advanced Parameters Section** - Organizes complex configuration</li>
          <li>✅ **Loading & Saving States** - Visual feedback during operations</li>
          <li>✅ **Keyboard Shortcuts** - ESC to close, Ctrl+S to save</li>
          <li>✅ **Migration System Integration** - Safe rollback and feature flags</li>
          <li>✅ **Accessibility Support** - ARIA labels and keyboard navigation</li>
          <li>✅ **Mobile Responsive** - Adapts to different screen sizes</li>
        </ul>
      </div>

      {/* Usage Instructions */}
      <div className="example-instructions">
        <h3>How to Use:</h3>
        <ol>
          <li>Click on any node above to open the parameter panel</li>
          <li>Modify parameters in the panel</li>
          <li>See real-time validation feedback</li>
          <li>Save changes or reset to original values</li>
          <li>Try keyboard shortcuts (ESC, Ctrl+S)</li>
          <li>Test unsaved changes warning by closing without saving</li>
        </ol>
      </div>

      {/* Parameter Panel */}
      <ParameterPanel
        isOpen={isPanelOpen}
        nodeId={selectedNodeId}
        onClose={handlePanelClose}
        onSave={handleParameterSave}
      />


    </div>
  );
};

export default ParameterPanelExample; 