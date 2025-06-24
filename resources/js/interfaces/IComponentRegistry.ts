/**
 * Component Registry Interface - defines contract for component management
 * Following Interface Segregation Principle
 */

export interface IComponentDefinition {
  name: string;
  component: React.ComponentType<any> | (() => Promise<{ default: React.ComponentType<any> }>);
  isAsync?: boolean;
  defaultProps?: Record<string, any>;
  propTypes?: Record<string, any>;
  config?: IComponentConfig;
  metadata?: IComponentMetadata;
}

export interface IComponentConfig {
  lazy?: boolean;
  cache?: boolean;
  ssr?: boolean;
  preload?: boolean;
  wrapper?: string | React.ComponentType<any>;
  middleware?: Array<IComponentMiddleware>;
  dependencies?: string[];
  version?: string;
}

export interface IComponentMetadata {
  description?: string;
  category?: string;
  tags?: string[];
  author?: string;
  docs?: string;
  examples?: Array<{
    name: string;
    props: Record<string, any>;
    description?: string;
  }>;
}

export type IComponentMiddleware = (
  component: React.ComponentType<any>,
  props: Record<string, any>,
  context: IComponentContext
) => React.ComponentType<any> | Promise<React.ComponentType<any>>;

export interface IComponentContext {
  registry: IComponentRegistry;
  hooks: IHookManager;
  config: IComponentConfig;
  metadata: IComponentMetadata;
}

export interface IHookManager {
  addHook(event: string, callback: Function, priority?: number): void;
  removeHook(event: string, callback: Function): void;
  executeHooks(event: string, data?: any): any;
}

export interface IComponentRegistry {
  register(definition: IComponentDefinition): void;
  get(name: string): IComponentDefinition | undefined;
  create(name: string, props?: Record<string, any>): React.ComponentType<any> | null;
  has(name: string): boolean;
  unregister(name: string): boolean;
  clear(): void;
  getComponentNames(): string[];
  getStats(): {
    totalComponents: number;
    categoryCounts: Record<string, number>;
    tagCounts: Record<string, number>;
  };
  mount(componentName: string, containerId: string, props?: Record<string, any>): void;
  unmount(containerId: string): void;
}

export interface IEventSystem {
  on(event: string, callback: Function, priority?: number): void;
  off(event: string, callback: Function): void;
  emit(event: string, data?: any): any;
  hasListeners(event: string): boolean;
}