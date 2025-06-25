import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { universalReactRenderer } from '@/components/UniversalReactRenderer';
import { componentRegistry } from '@/components/ReactComponentRegistry';

// Mock component for testing
const TestComponent = ({ title = 'Test', onClick }: { title?: string; onClick?: () => void }) => 
  React.createElement('div', { 
    'data-testid': 'test-component',
    onClick 
  }, title);

const AsyncTestComponent = () => Promise.resolve({ default: TestComponent });

describe('UniversalReactRenderer', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    // Clear registry
    componentRegistry.clear();
    
    // Create container
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Cleanup
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    universalReactRenderer.unmountAll();
  });

  describe('Component Mounting', () => {
    beforeEach(() => {
      componentRegistry.register({
        name: 'TestComponent',
        component: TestComponent,
        defaultProps: { title: 'Default Title' }
      });
    });

    it('should mount component to container', () => {
      universalReactRenderer.mount('TestComponent', 'test-container');
      
      const mountedElement = container.querySelector('[data-testid="test-component"]');
      expect(mountedElement).toBeTruthy();
      expect(mountedElement?.textContent).toBe('Default Title');
    });

    it('should mount component with custom props', () => {
      universalReactRenderer.mount('TestComponent', 'test-container', {
        title: 'Custom Title'
      });
      
      const mountedElement = container.querySelector('[data-testid="test-component"]');
      expect(mountedElement?.textContent).toBe('Custom Title');
    });

    it('should throw error when mounting non-existent component', () => {
      expect(() => {
        universalReactRenderer.mount('NonExistentComponent', 'test-container');
      }).toThrow('Component NonExistentComponent not found in registry');
    });

    it('should throw error when mounting to non-existent container', () => {
      expect(() => {
        universalReactRenderer.mount('TestComponent', 'non-existent-container');
      }).toThrow('Container element with ID non-existent-container not found');
    });

    it('should handle multiple mounts to same container', () => {
      universalReactRenderer.mount('TestComponent', 'test-container', { title: 'First' });
      universalReactRenderer.mount('TestComponent', 'test-container', { title: 'Second' });
      
      const mountedElements = container.querySelectorAll('[data-testid="test-component"]');
      expect(mountedElements).toHaveLength(1);
      expect(mountedElements[0].textContent).toBe('Second');
    });
  });

  describe('Component Unmounting', () => {
    beforeEach(() => {
      componentRegistry.register({
        name: 'TestComponent',
        component: TestComponent
      });
    });

    it('should unmount component from container', () => {
      universalReactRenderer.mount('TestComponent', 'test-container');
      expect(container.querySelector('[data-testid="test-component"]')).toBeTruthy();
      
      universalReactRenderer.unmount('test-container');
      expect(container.querySelector('[data-testid="test-component"]')).toBeFalsy();
    });

    it('should handle unmounting from non-existent container', () => {
      expect(() => {
        universalReactRenderer.unmount('non-existent-container');
      }).not.toThrow();
    });

    it('should unmount all components', () => {
      const container2 = document.createElement('div');
      container2.id = 'test-container-2';
      document.body.appendChild(container2);

      universalReactRenderer.mount('TestComponent', 'test-container');
      universalReactRenderer.mount('TestComponent', 'test-container-2');

      expect(container.querySelector('[data-testid="test-component"]')).toBeTruthy();
      expect(container2.querySelector('[data-testid="test-component"]')).toBeTruthy();

      universalReactRenderer.unmountAll();

      expect(container.querySelector('[data-testid="test-component"]')).toBeFalsy();
      expect(container2.querySelector('[data-testid="test-component"]')).toBeFalsy();

      // Cleanup
      document.body.removeChild(container2);
    });
  });

  describe('Async Component Loading', () => {
    beforeEach(() => {
      componentRegistry.register({
        name: 'AsyncComponent',
        component: AsyncTestComponent,
        isAsync: true,
        config: { lazy: true }
      });
    });

    it('should load and mount async component', async () => {
      await universalReactRenderer.mount('AsyncComponent', 'test-container');
      
      const mountedElement = container.querySelector('[data-testid="test-component"]');
      expect(mountedElement).toBeTruthy();
    });

    it('should show loading state while async component loads', async () => {
      const mountPromise = universalReactRenderer.mount('AsyncComponent', 'test-container');
      
      // Check for loading indicator
      expect(container.textContent).toContain('Loading...');
      
      await mountPromise;
      
      // Loading should be replaced with component
      expect(container.textContent).not.toContain('Loading...');
      expect(container.querySelector('[data-testid="test-component"]')).toBeTruthy();
    });

    it('should handle async component load errors', async () => {
      const FailingAsyncComponent = () => Promise.reject(new Error('Load failed'));
      
      componentRegistry.register({
        name: 'FailingComponent',
        component: FailingAsyncComponent,
        isAsync: true
      });

      await expect(
        universalReactRenderer.mount('FailingComponent', 'test-container')
      ).rejects.toThrow('Load failed');
    });
  });

  describe('Auto-Discovery', () => {
    beforeEach(() => {
      componentRegistry.register({
        name: 'AutoDiscoverComponent',
        component: TestComponent,
        defaultProps: { title: 'Auto Discovered' }
      });
    });

    it('should auto-discover and mount components from DOM', () => {
      container.innerHTML = `
        <div data-react-component="AutoDiscoverComponent"></div>
      `;

      universalReactRenderer.scanAndMount();

      const mountedElement = container.querySelector('[data-testid="test-component"]');
      expect(mountedElement).toBeTruthy();
      expect(mountedElement?.textContent).toBe('Auto Discovered');
    });

    it('should parse props from data attributes', () => {
      container.innerHTML = `
        <div 
          data-react-component="AutoDiscoverComponent"
          data-react-props='{"title": "Props from Data"}'
        ></div>
      `;

      universalReactRenderer.scanAndMount();

      const mountedElement = container.querySelector('[data-testid="test-component"]');
      expect(mountedElement?.textContent).toBe('Props from Data');
    });

    it('should handle invalid JSON in props', () => {
      container.innerHTML = `
        <div 
          data-react-component="AutoDiscoverComponent"
          data-react-props='invalid json'
        ></div>
      `;

      // Should not throw error and should use default props
      expect(() => universalReactRenderer.scanAndMount()).not.toThrow();

      const mountedElement = container.querySelector('[data-testid="test-component"]');
      expect(mountedElement?.textContent).toBe('Auto Discovered');
    });

    it('should scan specific container', () => {
      const specificContainer = document.createElement('div');
      specificContainer.innerHTML = `
        <div data-react-component="AutoDiscoverComponent"></div>
      `;
      document.body.appendChild(specificContainer);

      universalReactRenderer.scanAndMount(specificContainer);

      expect(specificContainer.querySelector('[data-testid="test-component"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="test-component"]')).toBeFalsy();

      document.body.removeChild(specificContainer);
    });
  });

  describe('Error Handling', () => {
    it('should wrap components in error boundary', () => {
      const ErrorComponent = () => {
        throw new Error('Component error');
      };

      componentRegistry.register({
        name: 'ErrorComponent',
        component: ErrorComponent
      });

      // Should not throw error due to error boundary
      expect(() => {
        universalReactRenderer.mount('ErrorComponent', 'test-container');
      }).not.toThrow();

      // Should show error message
      expect(container.textContent).toContain('Something went wrong');
    });

    it('should call custom error handler', () => {
      const errorHandler = vi.fn();
      const ErrorComponent = () => {
        throw new Error('Custom error');
      };

      componentRegistry.register({
        name: 'ErrorComponent',
        component: ErrorComponent,
        config: {
          onError: errorHandler
        }
      });

      universalReactRenderer.mount('ErrorComponent', 'test-container');

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Custom error' }),
        'ErrorComponent'
      );
    });
  });

  describe('Container Management', () => {
    beforeEach(() => {
      componentRegistry.register({
        name: 'TestComponent',
        component: TestComponent
      });
    });

    it('should track active containers', () => {
      universalReactRenderer.mount('TestComponent', 'test-container');
      
      const activeContainers = universalReactRenderer.getActiveContainers();
      expect(activeContainers).toContain('test-container');
    });

    it('should remove containers from tracking on unmount', () => {
      universalReactRenderer.mount('TestComponent', 'test-container');
      universalReactRenderer.unmount('test-container');
      
      const activeContainers = universalReactRenderer.getActiveContainers();
      expect(activeContainers).not.toContain('test-container');
    });

    it('should check if container is mounted', () => {
      expect(universalReactRenderer.isMounted('test-container')).toBe(false);
      
      universalReactRenderer.mount('TestComponent', 'test-container');
      expect(universalReactRenderer.isMounted('test-container')).toBe(true);
      
      universalReactRenderer.unmount('test-container');
      expect(universalReactRenderer.isMounted('test-container')).toBe(false);
    });
  });

  describe('Performance Optimizations', () => {
    beforeEach(() => {
      componentRegistry.register({
        name: 'TestComponent',
        component: TestComponent
      });
    });

    it('should batch multiple mount operations', () => {
      const container2 = document.createElement('div');
      container2.id = 'test-container-2';
      document.body.appendChild(container2);

      const container3 = document.createElement('div');
      container3.id = 'test-container-3';
      document.body.appendChild(container3);

      // Multiple mounts should be batched
      universalReactRenderer.batchMount([
        { component: 'TestComponent', container: 'test-container' },
        { component: 'TestComponent', container: 'test-container-2' },
        { component: 'TestComponent', container: 'test-container-3' }
      ]);

      expect(container.querySelector('[data-testid="test-component"]')).toBeTruthy();
      expect(container2.querySelector('[data-testid="test-component"]')).toBeTruthy();
      expect(container3.querySelector('[data-testid="test-component"]')).toBeTruthy();

      // Cleanup
      document.body.removeChild(container2);
      document.body.removeChild(container3);
    });

    it('should cache component instances when enabled', () => {
      componentRegistry.register({
        name: 'CachedComponent',
        component: TestComponent,
        config: { cache: true }
      });

      universalReactRenderer.mount('CachedComponent', 'test-container');
      universalReactRenderer.unmount('test-container');
      
      // Second mount should use cached instance
      universalReactRenderer.mount('CachedComponent', 'test-container');
      
      expect(container.querySelector('[data-testid="test-component"]')).toBeTruthy();
    });
  });
});