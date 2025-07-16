// NodeIcon - Node Icon Component
// Displays icons for workflow nodes with status indicators

import React from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Play, 
  Settings,
  Zap,
  Database,
  Globe,
  Mail,
  FileText,
  Code,
  Bot
} from 'lucide-react';

// Default icon mapping for common node types
const DEFAULT_ICONS: Record<string, React.ComponentType<any>> = {
  // Common workflow types
  trigger: Play,
  action: Zap,
  condition: Settings,
  loop: Activity,
  transform: Code,
  
  // Data types
  database: Database,
  api: Globe,
  webhook: Globe,
  email: Mail,
  file: FileText,
  text: FileText,
  
  // AI/ML types
  ai: Bot,
  llm: Bot,
  chat: Bot,
  
  // Default fallback
  default: Settings,
};

// Status indicator colors
const STATUS_COLORS = {
  idle: 'var(--color-text-base)',
  running: 'var(--color-primary)',
  success: 'var(--color-success)',
  error: 'var(--color-danger)',
  warning: 'var(--color-warning)',
};

export interface NodeIconProps {
  type: string;
  icon?: string;
  status?: 'idle' | 'running' | 'success' | 'error' | 'warning';
  disabled?: boolean;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const NodeIcon: React.FC<NodeIconProps> = ({
  type,
  icon,
  status = 'idle',
  disabled = false,
  size = 24,
  className,
  style,
}) => {
  // Determine which icon to use
  const getIconComponent = (): React.ComponentType<any> => {
    // If custom icon is provided, try to use it
    if (icon && typeof icon === 'string') {
      // For now, we'll use the type-based mapping
      // In the future, this could be enhanced to support custom icon strings
      return DEFAULT_ICONS[icon.toLowerCase()] || DEFAULT_ICONS[type.toLowerCase()] || DEFAULT_ICONS.default;
    }
    
    // Use type-based icon mapping
    return DEFAULT_ICONS[type.toLowerCase()] || DEFAULT_ICONS.default;
  };

  const IconComponent = getIconComponent();

  // Determine icon color based on status and disabled state
  const getIconColor = (): string => {
    if (disabled) {
      return 'var(--color-text-light)';
    }
    return STATUS_COLORS[status];
  };

  // Icon styles
  const iconStyles: React.CSSProperties = {
    color: getIconColor(),
    transition: 'color var(--ds-duration-fast)ms var(--ds-easing-ease)',
    ...style,
  };

  return (
    <div className={`node-icon ${className || ''}`} style={iconStyles}>
      <IconComponent 
        size={size}
        strokeWidth={1.5}
      />
      
      {/* Status indicator for running state */}
      {status === 'running' && (
        <div 
          className="node-icon__status-indicator"
          style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '6px',
            height: '6px',
            backgroundColor: STATUS_COLORS.running,
            borderRadius: '50%',
            animation: 'pulse 2s infinite',
          }}
        />
      )}
    </div>
  );
};

export default NodeIcon; 