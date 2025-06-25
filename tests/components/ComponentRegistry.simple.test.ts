import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { componentRegistry } from '../../resources/js/components/ReactComponentRegistry';

// Simple mock component for testing
const TestComponent = ({ title = 'Test' }: { title?: string }) => 
  React.createElement('div', { 'data-testid': 'test-component' }, title);

describe('ComponentRegistry - Basic Functionality', () => {
  beforeEach(() => {
    componentRegistry.clear();
  });

  it('should register and retrieve a component', () => {
    componentRegistry.register({
      name: 'TestComponent',
      component: TestComponent
    });

    expect(componentRegistry.has('TestComponent')).toBe(true);
    const retrieved = componentRegistry.get('TestComponent');
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('TestComponent');
  });

  it('should return false for non-existent components', () => {
    expect(componentRegistry.has('NonExistent')).toBe(false);
    expect(componentRegistry.get('NonExistent')).toBeUndefined();
  });

  it('should clear all components', () => {
    componentRegistry.register({
      name: 'TestComponent1',
      component: TestComponent
    });
    
    componentRegistry.register({
      name: 'TestComponent2', 
      component: TestComponent
    });

    expect(componentRegistry.getComponentNames()).toHaveLength(2);
    
    componentRegistry.clear();
    
    expect(componentRegistry.getComponentNames()).toHaveLength(0);
  });

  it('should get component names', () => {
    componentRegistry.register({
      name: 'Component1',
      component: TestComponent
    });
    
    componentRegistry.register({
      name: 'Component2',
      component: TestComponent
    });

    const names = componentRegistry.getComponentNames();
    expect(names).toContain('Component1');
    expect(names).toContain('Component2');
    expect(names).toHaveLength(2);
  });

  it('should unregister components', () => {
    componentRegistry.register({
      name: 'TestComponent',
      component: TestComponent
    });

    expect(componentRegistry.has('TestComponent')).toBe(true);
    
    const removed = componentRegistry.unregister('TestComponent');
    expect(removed).toBe(true);
    expect(componentRegistry.has('TestComponent')).toBe(false);
  });

  it('should return stats', () => {
    componentRegistry.register({
      name: 'TestComponent',
      component: TestComponent
    });

    const stats = componentRegistry.getStats();
    expect(stats).toBeDefined();
    expect(typeof stats.totalComponents).toBe('number');
  });
});