import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { componentRegistry } from '@/components/ReactComponentRegistry';
import type { IComponentDefinition } from '@/interfaces/IComponentRegistry';

// Mock React component for testing
const MockComponent = ({ title = 'Test' }: { title?: string }) => 
  React.createElement('div', { 'data-testid': 'mock-component' }, title);

const AsyncMockComponent = () => Promise.resolve({ default: MockComponent });

describe('ReactComponentRegistry', () => {
  beforeEach(() => {
    componentRegistry.clear();
  });

  describe('Component Registration', () => {
    it('should register a basic component', () => {
      const definition: IComponentDefinition = {
        name: 'TestComponent',
        component: MockComponent,
        defaultProps: { title: 'Default Title' }
      };

      componentRegistry.register(definition);

      expect(componentRegistry.has('TestComponent')).toBe(true);
      expect(componentRegistry.get('TestComponent')).toEqual(definition);
    });

    it('should register an async component', () => {
      const definition: IComponentDefinition = {
        name: 'AsyncComponent',
        component: AsyncMockComponent,
        isAsync: true,
        config: {
          lazy: true,
          cache: true
        }
      };

      componentRegistry.register(definition);

      expect(componentRegistry.has('AsyncComponent')).toBe(true);
      const registered = componentRegistry.get('AsyncComponent');
      expect(registered?.isAsync).toBe(true);
      expect(registered?.config?.lazy).toBe(true);
    });

    it('should throw error when registering component without name', () => {
      expect(() => {
        componentRegistry.register({
          name: '',
          component: MockComponent
        });
      }).toThrow('Component name is required');
    });

    it('should throw error when registering component without component', () => {
      expect(() => {
        componentRegistry.register({
          name: 'TestComponent',
          component: null as any
        });
      }).toThrow('Component is required');
    });

    it('should override existing component when registering with same name', () => {
      const definition1: IComponentDefinition = {
        name: 'TestComponent',
        component: MockComponent,
        defaultProps: { title: 'First' }
      };

      const definition2: IComponentDefinition = {
        name: 'TestComponent',
        component: MockComponent,
        defaultProps: { title: 'Second' }
      };

      componentRegistry.register(definition1);
      componentRegistry.register(definition2);

      const registered = componentRegistry.get('TestComponent');
      expect(registered?.defaultProps?.title).toBe('Second');
    });
  });

  describe('Component Retrieval', () => {
    beforeEach(() => {
      componentRegistry.register({
        name: 'TestComponent',
        component: MockComponent,
        defaultProps: { title: 'Test Title' }
      });
    });

    it('should retrieve registered component', () => {
      const component = componentRegistry.get('TestComponent');
      expect(component).toBeDefined();
      expect(component?.name).toBe('TestComponent');
    });

    it('should return undefined for non-existent component', () => {
      const component = componentRegistry.get('NonExistent');
      expect(component).toBeUndefined();
    });

    it('should check if component exists', () => {
      expect(componentRegistry.has('TestComponent')).toBe(true);
      expect(componentRegistry.has('NonExistent')).toBe(false);
    });

    it('should get list of component names', () => {
      componentRegistry.register({
        name: 'AnotherComponent',
        component: MockComponent
      });

      const names = componentRegistry.getComponentNames();
      expect(names).toContain('TestComponent');
      expect(names).toContain('AnotherComponent');
      expect(names).toHaveLength(2);
    });
  });

  describe('Component Creation', () => {
    beforeEach(() => {
      componentRegistry.register({
        name: 'TestComponent',
        component: MockComponent,
        defaultProps: { title: 'Default' }
      });
    });

    it('should create component with default props', () => {
      const CreatedComponent = componentRegistry.create('TestComponent');
      expect(CreatedComponent).toBeDefined();
    });

    it('should create component with custom props', () => {
      const CreatedComponent = componentRegistry.create('TestComponent', { title: 'Custom' });
      expect(CreatedComponent).toBeDefined();
    });

    it('should return null for non-existent component', () => {
      const CreatedComponent = componentRegistry.create('NonExistent');
      expect(CreatedComponent).toBeNull();
    });

    it('should merge default props with provided props', () => {
      const CreatedComponent = componentRegistry.create('TestComponent', { 
        title: 'Custom',
        extraProp: 'value'
      });
      expect(CreatedComponent).toBeDefined();
    });
  });

  describe('Component Management', () => {
    beforeEach(() => {
      componentRegistry.register({
        name: 'TestComponent1',
        component: MockComponent
      });
      componentRegistry.register({
        name: 'TestComponent2',
        component: MockComponent
      });
    });

    it('should unregister component', () => {
      expect(componentRegistry.has('TestComponent1')).toBe(true);
      
      const result = componentRegistry.unregister('TestComponent1');
      expect(result).toBe(true);
      expect(componentRegistry.has('TestComponent1')).toBe(false);
    });

    it('should return false when unregistering non-existent component', () => {
      const result = componentRegistry.unregister('NonExistent');
      expect(result).toBe(false);
    });

    it('should clear all components', () => {
      expect(componentRegistry.getComponentNames()).toHaveLength(2);
      
      componentRegistry.clear();
      expect(componentRegistry.getComponentNames()).toHaveLength(0);
    });

    it('should get registry statistics', () => {
      const stats = componentRegistry.getStats();
      expect(stats.totalComponents).toBe(2);
      expect(stats.asyncComponents).toBe(0);
      expect(stats.cachedComponents).toBe(0);
    });
  });

  describe('Event System', () => {
    it('should trigger events on component registration', () => {
      const listener = vi.fn();
      componentRegistry.on('component:registered', listener);

      componentRegistry.register({
        name: 'EventTestComponent',
        component: MockComponent
      });

      expect(listener).toHaveBeenCalledWith({
        name: 'EventTestComponent',
        component: MockComponent
      });
    });

    it('should remove event listeners', () => {
      const listener = vi.fn();
      componentRegistry.on('component:registered', listener);
      componentRegistry.off('component:registered', listener);

      componentRegistry.register({
        name: 'EventTestComponent',
        component: MockComponent
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Middleware Support', () => {
    it('should apply global middleware to components', () => {
      const middleware = vi.fn((component, _props, _context) => {
        return (componentProps: any) => React.createElement(component, componentProps);
      });

      componentRegistry.addMiddleware(middleware);
      componentRegistry.register({
        name: 'MiddlewareTestComponent',
        component: MockComponent
      });

      const CreatedComponent = componentRegistry.create('MiddlewareTestComponent');
      expect(CreatedComponent).toBeDefined();
    });

    it('should apply component-specific middleware', () => {
      const componentMiddleware = vi.fn((component, _props, _context) => {
        return (componentProps: any) => React.createElement(component, componentProps);
      });

      componentRegistry.register({
        name: 'SpecificMiddlewareComponent',
        component: MockComponent,
        config: {
          middleware: [componentMiddleware]
        }
      });

      const CreatedComponent = componentRegistry.create('SpecificMiddlewareComponent');
      expect(CreatedComponent).toBeDefined();
    });
  });
});