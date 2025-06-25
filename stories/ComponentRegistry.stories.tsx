import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import { componentRegistry } from '@/components/ReactComponentRegistry';

// Example components for testing
const SimpleComponent = ({ title = 'Simple Component', color = 'blue' }: { title?: string; color?: string }) => (
  <div style={{ padding: '1rem', border: `2px solid ${color}`, borderRadius: '8px' }}>
    <h3>{title}</h3>
    <p>This is a simple React component rendered through the registry.</p>
  </div>
);

const InteractiveComponent = ({ 
  initialCount = 0, 
  title = 'Interactive Component' 
}: { 
  initialCount?: number; 
  title?: string; 
}) => {
  const [count, setCount] = useState(initialCount);
  
  return (
    <div style={{ padding: '1rem', border: '2px solid green', borderRadius: '8px' }}>
      <h3>{title}</h3>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setCount(c => c - 1)} style={{ marginLeft: '0.5rem' }}>Decrement</button>
      <button onClick={() => setCount(0)} style={{ marginLeft: '0.5rem' }}>Reset</button>
    </div>
  );
};

const AsyncComponent = React.lazy(() => 
  new Promise(resolve => {
    setTimeout(() => {
      resolve({
        default: ({ message = 'Async Component Loaded!' }: { message?: string }) => (
          <div style={{ padding: '1rem', border: '2px solid purple', borderRadius: '8px' }}>
            <h3>Async Component</h3>
            <p>{message}</p>
            <p>This component was loaded asynchronously.</p>
          </div>
        )
      });
    }, 1000);
  })
);

// Registry demonstration component
const RegistryDemo = () => {
  const [registeredComponents, setRegisteredComponents] = useState<string[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [componentProps, setComponentProps] = useState<Record<string, any>>({});
  const [RenderedComponent, setRenderedComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Register components
    componentRegistry.register({
      name: 'SimpleComponent',
      component: SimpleComponent,
      defaultProps: { title: 'Default Simple Component', color: 'blue' },
      metadata: {
        category: 'basic',
        description: 'A simple component with title and color props'
      }
    });

    componentRegistry.register({
      name: 'InteractiveComponent',
      component: InteractiveComponent,
      defaultProps: { initialCount: 0, title: 'Default Interactive Component' },
      metadata: {
        category: 'interactive',
        description: 'An interactive counter component'
      }
    });

    componentRegistry.register({
      name: 'AsyncComponent',
      component: AsyncComponent,
      isAsync: true,
      config: { lazy: true, cache: true },
      defaultProps: { message: 'Hello from Async!' },
      metadata: {
        category: 'async',
        description: 'A component that loads asynchronously'
      }
    });

    setRegisteredComponents(componentRegistry.getComponentNames());
  }, []);

  const renderComponent = (componentName: string, props: Record<string, any> = {}) => {
    const component = componentRegistry.create(componentName, props);
    setRenderedComponent(() => component);
  };

  const handleComponentSelect = (componentName: string) => {
    setSelectedComponent(componentName);
    const definition = componentRegistry.get(componentName);
    setComponentProps(definition?.defaultProps || {});
    renderComponent(componentName, definition?.defaultProps);
  };

  const handlePropChange = (key: string, value: any) => {
    const newProps = { ...componentProps, [key]: value };
    setComponentProps(newProps);
    renderComponent(selectedComponent, newProps);
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', minHeight: '400px' }}>
      <div style={{ flex: '0 0 300px' }}>
        <h3>Registry Controls</h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Select Component:</label>
          <select 
            value={selectedComponent} 
            onChange={(e) => handleComponentSelect(e.target.value)}
            style={{ width: '100%', marginTop: '0.25rem' }}
          >
            <option value="">Choose a component...</option>
            {registeredComponents.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {selectedComponent && (
          <div>
            <h4>Props</h4>
            {Object.entries(componentProps).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '0.5rem' }}>
                <label>{key}:</label>
                <input
                  type={typeof value === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={(e) => handlePropChange(key, 
                    typeof value === 'number' ? parseInt(e.target.value) || 0 : e.target.value
                  )}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                />
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          <h4>Registry Stats</h4>
          <p>Total Components: {registeredComponents.length}</p>
          <p>Selected: {selectedComponent || 'None'}</p>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h3>Rendered Component</h3>
        <div style={{ border: '1px dashed #ccc', padding: '1rem', minHeight: '200px' }}>
          {RenderedComponent ? (
            <React.Suspense fallback={<div>Loading component...</div>}>
              <RenderedComponent />
            </React.Suspense>
          ) : (
            <p>Select a component to render it here</p>
          )}
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof RegistryDemo> = {
  title: 'React Wrapper/Component Registry',
  component: RegistryDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive demonstration of the React Component Registry system. Register components and render them dynamically with different props.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: () => <RegistryDemo />,
};

export const SimpleComponentExample: Story = {
  render: () => {
    useEffect(() => {
      componentRegistry.register({
        name: 'StorySimpleComponent',
        component: SimpleComponent,
        defaultProps: { title: 'Story Example', color: 'green' }
      });
    }, []);

    const Component = componentRegistry.create('StorySimpleComponent');
    return Component ? <Component /> : <div>Component not found</div>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of a simple component registered and rendered through the registry.',
      },
    },
  },
};

export const WithCustomProps: Story = {
  render: () => {
    useEffect(() => {
      componentRegistry.register({
        name: 'StoryCustomPropsComponent',
        component: SimpleComponent,
        defaultProps: { title: 'Default Title', color: 'blue' }
      });
    }, []);

    const Component = componentRegistry.create('StoryCustomPropsComponent', {
      title: 'Custom Props Title',
      color: 'red'
    });
    
    return Component ? <Component /> : <div>Component not found</div>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing how custom props override default props.',
      },
    },
  },
};

export const AsyncComponentExample: Story = {
  render: () => {
    useEffect(() => {
      componentRegistry.register({
        name: 'StoryAsyncComponent',
        component: AsyncComponent,
        isAsync: true,
        config: { lazy: true },
        defaultProps: { message: 'Loaded from Story!' }
      });
    }, []);

    const Component = componentRegistry.create('StoryAsyncComponent');
    
    return (
      <React.Suspense fallback={<div>Loading async component...</div>}>
        {Component ? <Component /> : <div>Component not found</div>}
      </React.Suspense>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of an async component that loads lazily.',
      },
    },
  },
};