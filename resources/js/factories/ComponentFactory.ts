/**
 * Component Factory - creates components following Open/Closed Principle
 * Open for extension, closed for modification
 */

import React from 'react';
import {
  IComponentDefinition,
  IComponentContext,
  IComponentMiddleware,
} from '../interfaces/IComponentRegistry';

export abstract class BaseComponentFactory {
  abstract createComponent(
    definition: IComponentDefinition,
    props: Record<string, any>
  ): React.ComponentType<any> | null;

  protected applyMiddleware(
    component: React.ComponentType<any>,
    props: Record<string, any>,
    middleware: IComponentMiddleware[],
    context: IComponentContext
  ): React.ComponentType<any> {
    return middleware.reduce((comp, mw) => {
      try {
        const result = mw(comp, props, context);
        if (result instanceof Promise) {
          console.warn('Async middleware not supported in synchronous factory');
          return comp; // Return original component for async middleware
        }
        return result;
      } catch (error) {
        console.error('Error in component middleware:', error);
        return comp; // Return original component on error
      }
    }, component);
  }

  protected validateComponent(component: any): boolean {
    return (
      typeof component === 'function' &&
      (component.prototype?.isReactComponent ||
        (typeof component === 'function' && !component.prototype?.isReactComponent))
    );
  }
}

export class SynchronousComponentFactory extends BaseComponentFactory {
  createComponent(
    definition: IComponentDefinition,
    props: Record<string, any> = {}
  ): React.ComponentType<any> | null {
    if (!definition.component || definition.isAsync) {
      return null;
    }

    const component = definition.component as React.ComponentType<any>;

    if (!this.validateComponent(component)) {
      console.error(`Invalid component: ${definition.name}`);
      return null;
    }

    // Apply default props
    const mergedProps = { ...definition.defaultProps, ...props };

    // Create wrapper component with merged props
    const WrappedComponent: React.ComponentType<any> = componentProps => {
      return React.createElement(component, {
        ...mergedProps,
        ...componentProps,
      });
    };

    WrappedComponent.displayName = `Wrapped${definition.name}`;

    return WrappedComponent;
  }
}

export class AsynchronousComponentFactory extends BaseComponentFactory {
  private componentCache: Map<string, React.ComponentType<any>> = new Map();

  async createComponentAsync(
    definition: IComponentDefinition,
    _props: Record<string, any> = {}
  ): Promise<React.ComponentType<any> | null> {
    if (!definition.isAsync) {
      return null;
    }

    // Check cache first
    if (definition.config?.cache && this.componentCache.has(definition.name)) {
      return this.componentCache.get(definition.name)!;
    }

    try {
      const componentLoader = definition.component as () => Promise<{
        default: React.ComponentType<any>;
      }>;
      const module = await componentLoader();
      const component = module.default;

      if (!this.validateComponent(component)) {
        console.error(`Invalid async component: ${definition.name}`);
        return null;
      }

      // Cache if enabled
      if (definition.config?.cache) {
        this.componentCache.set(definition.name, component);
      }

      return component;
    } catch (error) {
      console.error(`Error loading async component ${definition.name}:`, error);
      return null;
    }
  }

  createComponent(
    definition: IComponentDefinition,
    props: Record<string, any> = {}
  ): React.ComponentType<any> | null {
    // For sync factory, return lazy component wrapper
    if (!definition.isAsync) {
      return null;
    }

    return React.lazy(async () => {
      const component = await this.createComponentAsync(definition, props);
      return {
        default: component || (() => React.createElement('div', null, 'Component failed to load')),
      };
    });
  }

  clearCache(): void {
    this.componentCache.clear();
  }
}

export class ComponentFactoryManager {
  private syncFactory = new SynchronousComponentFactory();
  private asyncFactory = new AsynchronousComponentFactory();

  createComponent(
    definition: IComponentDefinition,
    props: Record<string, any> = {}
  ): React.ComponentType<any> | null {
    if (definition.isAsync) {
      return this.asyncFactory.createComponent(definition, props);
    } else {
      return this.syncFactory.createComponent(definition, props);
    }
  }

  async createComponentAsync(
    definition: IComponentDefinition,
    props: Record<string, any> = {}
  ): Promise<React.ComponentType<any> | null> {
    if (definition.isAsync) {
      return this.asyncFactory.createComponentAsync(definition, props);
    } else {
      return this.syncFactory.createComponent(definition, props);
    }
  }

  clearAsyncCache(): void {
    this.asyncFactory.clearCache();
  }
}
