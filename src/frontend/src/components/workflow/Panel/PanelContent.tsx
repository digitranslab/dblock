// PanelContent - Parameter Panel Content Component
// Displays and handles editing of node parameters

import React, { memo, useCallback, useState, useEffect } from 'react';
import { Settings, Info, Save, RotateCcw } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface NodeData {
  id: string;
  type: string;
  display_name?: string;
  description?: string;
  template?: Record<string, any>;
  parameters?: Record<string, unknown>;
}

export interface PanelContentProps {
  node: NodeData;
  onParametersChange?: (parameters: Record<string, unknown>) => void;
  onErrorsChange?: (errors: Record<string, string>) => void;
}

interface ParameterFieldProps {
  name: string;
  parameter: any;
  value: unknown;
  error?: string;
  onChange: (key: string, value: unknown) => void;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// ============================================================================
// Validation Function
// ============================================================================

const validateParameter = (
  key: string, 
  value: unknown, 
  template: Record<string, any>
): ValidationResult => {
  const param = template[key];
  if (!param) return { isValid: true };

  // Check required fields
  if (param.required && (value === undefined || value === null || value === '')) {
    return {
      isValid: false,
      error: `${param.display_name || key} is required`
    };
  }

  // Type validation
  if (value !== undefined && value !== null && value !== '') {
    switch (param.type) {
      case 'str':
        if (typeof value !== 'string') {
          return {
            isValid: false,
            error: `${param.display_name || key} must be a string`
          };
        }
        break;
      case 'int':
        if (!Number.isInteger(Number(value))) {
          return {
            isValid: false,
            error: `${param.display_name || key} must be an integer`
          };
        }
        break;
      case 'float':
        if (isNaN(Number(value))) {
          return {
            isValid: false,
            error: `${param.display_name || key} must be a number`
          };
        }
        break;
      case 'bool':
        if (typeof value !== 'boolean') {
          return {
            isValid: false,
            error: `${param.display_name || key} must be a boolean`
          };
        }
        break;
    }
  }

  // Pattern validation
  if (value && param.pattern) {
    const regex = new RegExp(param.pattern);
    if (!regex.test(String(value))) {
      return {
        isValid: false,
        error: param.pattern_message || `${param.display_name || key} format is invalid`
      };
    }
  }

  return { isValid: true };
};

// ============================================================================
// Parameter Field Component
// ============================================================================

const ParameterField: React.FC<ParameterFieldProps> = memo(({
  name,
  parameter,
  value,
  error,
  onChange
}) => {
  const displayName = parameter?.display_name || name;
  const description = parameter?.description;
  const required = parameter?.required;
  const type = parameter?.type || 'str';
  const options = parameter?.options;

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let newValue: unknown = event.target.value;

    // Type conversion based on parameter type
    switch (type) {
      case 'int':
        newValue = parseInt(event.target.value) || 0;
        break;
      case 'float':
        newValue = parseFloat(event.target.value) || 0;
        break;
      case 'bool':
        newValue = (event.target as HTMLInputElement).checked;
        break;
      default:
        newValue = event.target.value;
    }

    onChange(name, newValue);
  }, [onChange, name, type]);

  const renderInput = () => {
    switch (type) {
      case 'bool':
        return (
          <label className="parameter-field__checkbox">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={handleChange}
              className="parameter-field__checkbox-input"
            />
            <span className="parameter-field__checkbox-label">
              {displayName}
            </span>
          </label>
        );

      case 'int':
      case 'float':
        return (
          <input
            type="number"
            value={String(value || '')}
            onChange={handleChange}
            step={type === 'float' ? 'any' : '1'}
            className={`parameter-field__input ${error ? 'parameter-field__input--error' : ''}`}
            placeholder={parameter?.placeholder || `Enter ${displayName.toLowerCase()}`}
          />
        );

      case 'text':
        return (
          <textarea
            value={String(value || '')}
            onChange={handleChange}
            rows={parameter?.rows || 4}
            className={`parameter-field__input parameter-field__textarea ${error ? 'parameter-field__input--error' : ''}`}
            placeholder={parameter?.placeholder || `Enter ${displayName.toLowerCase()}`}
          />
        );

      default:
        if (options && Array.isArray(options)) {
          return (
            <select
              value={String(value || '')}
              onChange={handleChange}
              className={`parameter-field__input parameter-field__select ${error ? 'parameter-field__input--error' : ''}`}
            >
              <option value="">Select {displayName.toLowerCase()}</option>
              {options.map((option: any) => (
                <option key={option.value || option} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
            </select>
          );
        }

        return (
          <input
            type="text"
            value={String(value || '')}
            onChange={handleChange}
            className={`parameter-field__input ${error ? 'parameter-field__input--error' : ''}`}
            placeholder={parameter?.placeholder || `Enter ${displayName.toLowerCase()}`}
          />
        );
    }
  };

  if (type === 'bool') {
    return (
      <div className="parameter-field">
        {renderInput()}
        {description && (
          <p className="parameter-field__description">{description}</p>
        )}
        {error && (
          <div className="parameter-field__error">{error}</div>
        )}
      </div>
    );
  }

  return (
    <div className="parameter-field">
      <label className="parameter-field__label">
        {displayName}
        {required && <span className="required-indicator">*</span>}
      </label>
      <div className="parameter-field__input-wrapper">
        {renderInput()}
      </div>
      {description && (
        <p className="parameter-field__description">{description}</p>
      )}
      {error && (
        <div className="parameter-field__error">{error}</div>
      )}
    </div>
  );
});

ParameterField.displayName = 'ParameterField';

// ============================================================================
// Panel Content Component - Step 3.2 Implementation
// ============================================================================

export const PanelContent: React.FC<PanelContentProps> = memo(({ 
  node, 
  onParametersChange, 
  onErrorsChange 
}) => {
  // Local state management as specified in Step 3.2
  const [parameters, setParameters] = useState<Record<string, unknown>>(node.parameters || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync with node parameters when node changes
  useEffect(() => {
    setParameters(node.parameters || {});
  }, [node.parameters]);

  // Notify parent of parameter changes
  useEffect(() => {
    onParametersChange?.(parameters);
  }, [parameters, onParametersChange]);

  // Notify parent of error changes
  useEffect(() => {
    onErrorsChange?.(errors);
  }, [errors, onErrorsChange]);

  // Handle parameter changes with validation as specified in Step 3.2
  const handleParameterChange = useCallback((key: string, value: unknown) => {
    // Update parameters
    setParameters(prev => ({ ...prev, [key]: value }));
    
    // Validate parameter
    const validation = validateParameter(key, value, node.template || {});
    if (validation.error) {
      setErrors(prev => ({ ...prev, [key]: validation.error! }));
    } else {
      setErrors(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [node.template]);

  return (
    <div className="panel-content">
      {/* Description Section */}
      <div className="panel-content__description">
        {node.description && (
          <p className="panel-content__description-text">
            {node.description}
          </p>
        )}
      </div>
      
      {/* Parameters Section */}
      <div className="panel-content__parameters">
        <h3>Configuration</h3>
        {Object.entries(node.template || {}).map(([key, param]) => (
          <ParameterField
            key={key}
            name={key}
            parameter={param}
            value={parameters[key]}
            error={errors[key]}
            onChange={handleParameterChange}
          />
        ))}
      </div>
    </div>
  );
});

PanelContent.displayName = 'PanelContent';

export default PanelContent; 