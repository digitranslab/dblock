// NodeTypeRegistry - Centralized Node Type Management
// Provides registration and management of node types for the workflow system

import React, { ComponentType } from 'react';
import { NodeTypes } from 'reactflow';
import { WorkflowNode, type WorkflowNodeData } from './WorkflowNode';
import { NodeAdapter } from './NodeAdapter';

// Node type configuration interface
export interface NodeTypeConfig {
  id: string;
  name: string;
  category: string;
  description?: string;
  icon?: string;
  component: ComponentType<any>;
  defaultData?: Partial<WorkflowNodeData>;
  isLegacy?: boolean;
  deprecated?: boolean;
  version?: string;
  tags?: string[];
}

// Node category definitions
export const NODE_CATEGORIES = {
  INPUT: 'input',
  PROCESSING: 'processing',
  OUTPUT: 'output',
  LOGIC: 'logic',
  AI: 'ai',
  DATA: 'data',
  UTILITY: 'utility',
  CUSTOM: 'custom',
  LEGACY: 'legacy',
} as const;

// Registry class for managing node types
class NodeTypeRegistryClass {
  private nodeTypes: Map<string, NodeTypeConfig> = new Map();
  private reactFlowNodeTypes: NodeTypes = {};

  // Register a new node type
  register(config: NodeTypeConfig): void {
    this.nodeTypes.set(config.id, config);
    this.updateReactFlowTypes();
  }

  // Register multiple node types
  registerBatch(configs: NodeTypeConfig[]): void {
    configs.forEach(config => this.nodeTypes.set(config.id, config));
    this.updateReactFlowTypes();
  }

  // Unregister a node type
  unregister(nodeTypeId: string): boolean {
    const deleted = this.nodeTypes.delete(nodeTypeId);
    if (deleted) {
      this.updateReactFlowTypes();
    }
    return deleted;
  }

  // Get node type configuration
  getNodeType(nodeTypeId: string): NodeTypeConfig | undefined {
    return this.nodeTypes.get(nodeTypeId);
  }

  // Get all node types
  getAllNodeTypes(): NodeTypeConfig[] {
    return Array.from(this.nodeTypes.values());
  }

  // Get node types by category
  getNodeTypesByCategory(category: string): NodeTypeConfig[] {
    return this.getAllNodeTypes().filter(config => config.category === category);
  }

  // Get ReactFlow node types object
  getReactFlowNodeTypes(): NodeTypes {
    return this.reactFlowNodeTypes;
  }

  // Check if node type exists
  hasNodeType(nodeTypeId: string): boolean {
    return this.nodeTypes.has(nodeTypeId);
  }

  // Search node types
  searchNodeTypes(query: string): NodeTypeConfig[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllNodeTypes().filter(config => 
      config.name.toLowerCase().includes(lowerQuery) ||
      config.description?.toLowerCase().includes(lowerQuery) ||
      config.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Get node types by tags
  getNodeTypesByTags(tags: string[]): NodeTypeConfig[] {
    return this.getAllNodeTypes().filter(config =>
      config.tags?.some(tag => tags.includes(tag))
    );
  }

  // Update ReactFlow node types mapping
  private updateReactFlowTypes(): void {
    this.reactFlowNodeTypes = {};
    
    this.nodeTypes.forEach((config, id) => {
      this.reactFlowNodeTypes[id] = config.component;
    });
  }

  // Clear all node types
  clear(): void {
    this.nodeTypes.clear();
    this.reactFlowNodeTypes = {};
  }

  // Get registry statistics
  getStats() {
    const types = this.getAllNodeTypes();
    const categories = types.reduce((acc, type) => {
      acc[type.category] = (acc[type.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTypes: types.length,
      categories,
      legacyTypes: types.filter(t => t.isLegacy).length,
      deprecatedTypes: types.filter(t => t.deprecated).length,
    };
  }
}

// Singleton instance
export const NodeTypeRegistry = new NodeTypeRegistryClass();

// Default node type configurations
const DEFAULT_NODE_TYPES: NodeTypeConfig[] = [
  {
    id: 'workflowNode',
    name: 'Workflow Node',
    category: NODE_CATEGORIES.PROCESSING,
    description: 'Standard workflow node with n8n-style design',
    icon: 'settings',
    component: WorkflowNode,
    defaultData: {
      status: 'idle',
      disabled: false,
    },
  },
  {
    id: 'legacyNode',
    name: 'Legacy Node',
    category: NODE_CATEGORIES.LEGACY,
    description: 'Compatibility wrapper for legacy GenericNode components',
    icon: 'archive',
    component: NodeAdapter,
    isLegacy: true,
    defaultData: {
      status: 'idle',
      disabled: false,
    },
  },
];

// Initialize default node types
NodeTypeRegistry.registerBatch(DEFAULT_NODE_TYPES);

// Hook for using node type registry
export const useNodeTypeRegistry = () => {
  return {
    register: NodeTypeRegistry.register.bind(NodeTypeRegistry),
    unregister: NodeTypeRegistry.unregister.bind(NodeTypeRegistry),
    getNodeType: NodeTypeRegistry.getNodeType.bind(NodeTypeRegistry),
    getAllNodeTypes: NodeTypeRegistry.getAllNodeTypes.bind(NodeTypeRegistry),
    getNodeTypesByCategory: NodeTypeRegistry.getNodeTypesByCategory.bind(NodeTypeRegistry),
    getReactFlowNodeTypes: NodeTypeRegistry.getReactFlowNodeTypes.bind(NodeTypeRegistry),
    hasNodeType: NodeTypeRegistry.hasNodeType.bind(NodeTypeRegistry),
    searchNodeTypes: NodeTypeRegistry.searchNodeTypes.bind(NodeTypeRegistry),
    getNodeTypesByTags: NodeTypeRegistry.getNodeTypesByTags.bind(NodeTypeRegistry),
    getStats: NodeTypeRegistry.getStats.bind(NodeTypeRegistry),
  };
};

// Higher-order component for registering node types
export const withNodeTypeRegistration = <P extends object>(
  Component: ComponentType<P>,
  nodeTypeConfig: Omit<NodeTypeConfig, 'component'>
) => {
  // Register the component as a node type
  NodeTypeRegistry.register({
    ...nodeTypeConfig,
    component: Component,
  });

  return Component;
};

// Utility function to create node type configuration
export const createNodeTypeConfig = (
  id: string,
  name: string,
  category: string,
  component: ComponentType<any>,
  options: Partial<Omit<NodeTypeConfig, 'id' | 'name' | 'category' | 'component'>> = {}
): NodeTypeConfig => {
  return {
    id,
    name,
    category,
    component,
    ...options,
  };
};

// Migration helper for legacy node types
export const migrateLegacyNodeType = (
  legacyId: string,
  newConfig: Omit<NodeTypeConfig, 'id' | 'isLegacy'>
): void => {
  // Register new node type
  NodeTypeRegistry.register({
    ...newConfig,
    id: newConfig.name.toLowerCase().replace(/\s+/g, '_'),
    isLegacy: false,
  });

  // Mark legacy type as deprecated if it exists
  const legacyType = NodeTypeRegistry.getNodeType(legacyId);
  if (legacyType) {
    NodeTypeRegistry.register({
      ...legacyType,
      deprecated: true,
      isLegacy: true,
    });
  }
};

export default NodeTypeRegistry; 