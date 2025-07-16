import React, { useState, useCallback } from 'react';
import { PanelContent } from './PanelContent';
import './ParameterPanelExample.scss';

// ============================================================================
// Step 3.2 Panel Content Architecture Example
// ============================================================================

interface Step3_2_ExampleProps {
  className?: string;
}

export const Step3_2_Example: React.FC<Step3_2_ExampleProps> = ({
  className = ''
}) => {
  // Local state for demonstration
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [currentParameters, setCurrentParameters] = useState<Record<string, unknown>>({});
  const [currentErrors, setCurrentErrors] = useState<Record<string, string>>({});

  // ============================================================================
  // Demo Node Data (Step 3.2 NodeData format)
  // ============================================================================

  const demoNodes = [
    {
      id: 'node-1',
      type: 'ChatOpenAI',
      display_name: 'OpenAI Chat',
      description: 'Chat with OpenAI GPT models for natural language processing',
      template: {
        model_name: {
          type: 'str',
          required: true,
          display_name: 'Model Name',
          description: 'The OpenAI model to use',
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
          pattern: '^[0-2](\.[0-9]*)?$'
        },
        max_tokens: {
          type: 'int',
          required: false,
          display_name: 'Max Tokens',
          description: 'Maximum number of tokens to generate'
        },
        streaming: {
          type: 'bool',
          required: false,
          display_name: 'Streaming',
          description: 'Enable streaming responses'
        }
      },
      parameters: {
        model_name: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000,
        streaming: false
      }
    },
    {
      id: 'node-2',
      type: 'TextInput',
      display_name: 'Text Input',
      description: 'Input component for text data',
      template: {
        placeholder: {
          type: 'str',
          required: false,
          display_name: 'Placeholder',
          description: 'Placeholder text for the input field'
        },
        multiline: {
          type: 'bool',
          required: false,
          display_name: 'Multiline',
          description: 'Allow multiple lines of text'
        },
        max_length: {
          type: 'int',
          required: true,
          display_name: 'Maximum Length',
          description: 'Maximum number of characters allowed'
        }
      },
      parameters: {
        placeholder: 'Enter your text here...',
        multiline: false,
        max_length: 500
      }
    },
    {
      id: 'node-3',
      type: 'Validation',
      display_name: 'Validation Test',
      description: 'Test various validation scenarios',
      template: {
        required_field: {
          type: 'str',
          required: true,
          display_name: 'Required Field',
          description: 'This field is required for testing'
        },
        email_field: {
          type: 'str',
          required: false,
          display_name: 'Email Address',
          description: 'Email with pattern validation',
          pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
          pattern_message: 'Please enter a valid email address'
        },
        number_range: {
          type: 'int',
          required: false,
          display_name: 'Number (1-100)',
          description: 'Integer between 1 and 100'
        }
      },
      parameters: {
        required_field: '',
        email_field: '',
        number_range: 50
      }
    }
  ];

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleNodeSelect = useCallback((node: any) => {
    setSelectedNode(node);
    setCurrentParameters({});
    setCurrentErrors({});
  }, []);

  const handleParametersChange = useCallback((parameters: Record<string, unknown>) => {
    setCurrentParameters(parameters);
  }, []);

  const handleErrorsChange = useCallback((errors: Record<string, string>) => {
    setCurrentErrors(errors);
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`parameter-panel-example ${className}`}>
      {/* Demo Header */}
      <div className="example-header">
        <h2>Step 3.2: Panel Content Architecture</h2>
        <p>Local state management with real-time validation</p>
      </div>

      {/* Architecture Overview */}
      <div className="example-features">
        <h3>Step 3.2 Architecture Features:</h3>
        <ul>
          <li>✅ **Local State Management** - PanelContent manages parameters and errors internally</li>
          <li>✅ **Real-time Validation** - Immediate feedback using validateParameter function</li>
          <li>✅ **Parent Communication** - onParametersChange and onErrorsChange callbacks</li>
          <li>✅ **Self-contained Logic** - All parameter handling within PanelContent</li>
          <li>✅ **Type Safety** - Proper NodeData interface implementation</li>
          <li>✅ **Error Management** - Local error state with parent notification</li>
        </ul>
      </div>

      <div className="example-layout">
        {/* Node Selection */}
        <div className="example-nodes">
          <h3>Select a Node to Edit:</h3>
          {demoNodes.map((node) => (
            <div
              key={node.id}
              className={`example-node ${selectedNode?.id === node.id ? 'example-node--selected' : ''}`}
              onClick={() => handleNodeSelect(node)}
            >
              <div className="example-node__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
              <div className="example-node__details">
                <h4>{node.display_name}</h4>
                <p>{node.type}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Panel Content Demo */}
        <div className="example-panel">
          <h3>Step 3.2 PanelContent Component:</h3>
          {selectedNode ? (
            <div className="panel-demo">
              <PanelContent
                node={selectedNode}
                onParametersChange={handleParametersChange}
                onErrorsChange={handleErrorsChange}
              />
            </div>
          ) : (
            <div className="panel-placeholder">
              <p>Select a node to see the Step 3.2 PanelContent in action</p>
            </div>
          )}
        </div>

        {/* State Display */}
        <div className="example-state">
          <h3>Current State:</h3>
          
          <div className="state-section">
            <h4>Parameters:</h4>
            <pre className="state-display">
              {JSON.stringify(currentParameters, null, 2)}
            </pre>
          </div>

          <div className="state-section">
            <h4>Validation Errors:</h4>
            <pre className={`state-display ${Object.keys(currentErrors).length > 0 ? 'state-display--errors' : ''}`}>
              {Object.keys(currentErrors).length > 0 
                ? JSON.stringify(currentErrors, null, 2)
                : 'No validation errors'
              }
            </pre>
          </div>

          <div className="state-section">
            <h4>Selected Node:</h4>
            <pre className="state-display">
              {selectedNode ? `${selectedNode.display_name} (${selectedNode.type})` : 'None'}
            </pre>
          </div>
        </div>
      </div>

      {/* Implementation Details */}
      <div className="example-instructions">
        <h3>Step 3.2 Implementation Details:</h3>
        <div className="implementation-grid">
          <div className="implementation-item">
            <h4>1. Local State Management</h4>
            <pre><code>{`const [parameters, setParameters] = useState(node.parameters || {});
const [errors, setErrors] = useState<Record<string, string>>({});`}</code></pre>
          </div>

          <div className="implementation-item">
            <h4>2. Real-time Validation</h4>
            <pre><code>{`const handleParameterChange = (key: string, value: unknown) => {
  setParameters(prev => ({ ...prev, [key]: value }));
  
  const validation = validateParameter(key, value, node.template);
  if (validation.error) {
    setErrors(prev => ({ ...prev, [key]: validation.error }));
  } else {
    setErrors(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }
};`}</code></pre>
          </div>

          <div className="implementation-item">
            <h4>3. Parent Communication</h4>
            <pre><code>{`useEffect(() => {
  onParametersChange?.(parameters);
}, [parameters, onParametersChange]);

useEffect(() => {
  onErrorsChange?.(errors);
}, [errors, onErrorsChange]);`}</code></pre>
          </div>

          <div className="implementation-item">
            <h4>4. Component Interface</h4>
            <pre><code>{`interface PanelContentProps {
  node: NodeData;
  onParametersChange?: (parameters: Record<string, unknown>) => void;
  onErrorsChange?: (errors: Record<string, string>) => void;
}`}</code></pre>
          </div>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="example-features">
        <h3>Testing Instructions:</h3>
        <ol>
          <li>**Select Different Nodes** - See how local state resets for each node</li>
          <li>**Test Validation** - Try the "Validation Test" node with invalid inputs</li>
          <li>**Watch State Updates** - Observe real-time parameter and error changes</li>
          <li>**Required Fields** - Leave required fields empty to see validation errors</li>
          <li>**Pattern Validation** - Test email pattern in the validation node</li>
          <li>**Type Validation** - Enter non-numeric values in number fields</li>
        </ol>
      </div>
    </div>
  );
};

export default Step3_2_Example; 