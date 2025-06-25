import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { 
  StateManagerProvider, 
  useStateManager, 
  useStatePath,
  globalStateManager 
} from '@/components/StateManager';

// Example components for state management demonstration
const BasicStateDemo = () => {
  const { state, setState, getState } = useStateManager();

  return (
    <div style={{ padding: '1rem', border: '2px solid blue', borderRadius: '8px' }}>
      <h3>Basic State Management</h3>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Current State:</strong>
        <pre style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => setState('user.name', 'John Doe')}>
          Set User Name
        </button>
        <button onClick={() => setState('user.email', 'john@example.com')}>
          Set User Email
        </button>
        <button onClick={() => setState('app.theme', state.app?.theme === 'dark' ? 'light' : 'dark')}>
          Toggle Theme
        </button>
        <button onClick={() => setState('counter', (getState('counter') || 0) + 1)}>
          Increment Counter
        </button>
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <p>User Name: {getState('user.name') || 'Not set'}</p>
        <p>User Email: {getState('user.email') || 'Not set'}</p>
        <p>Theme: {getState('app.theme') || 'Not set'}</p>
        <p>Counter: {getState('counter') || 0}</p>
      </div>
    </div>
  );
};

const StatePathDemo = () => {
  const [userInfo, setUserInfo] = useStatePath('user', { name: '', email: '', age: 0 });
  const [preferences, setPreferences] = useStatePath('preferences', { 
    theme: 'light', 
    notifications: true 
  });
  const [counter, setCounter] = useStatePath('counter', 0);

  return (
    <div style={{ padding: '1rem', border: '2px solid green', borderRadius: '8px' }}>
      <h3>useStatePath Hook Demo</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h4>User Information</h4>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>Name:</label>
            <input
              type="text"
              value={userInfo.name}
              onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
              style={{ width: '100%', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>Email:</label>
            <input
              type="email"
              value={userInfo.email}
              onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
              style={{ width: '100%', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>Age:</label>
            <input
              type="number"
              value={userInfo.age}
              onChange={(e) => setUserInfo(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
              style={{ width: '100%', marginTop: '0.25rem' }}
            />
          </div>
        </div>
        
        <div>
          <h4>Preferences</h4>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              <input
                type="radio"
                name="theme"
                value="light"
                checked={preferences.theme === 'light'}
                onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
              />
              Light Theme
            </label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={preferences.theme === 'dark'}
                onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
              />
              Dark Theme
            </label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
              />
              Enable Notifications
            </label>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4>Counter</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => setCounter(c => c - 1)}>-</button>
          <span style={{ minWidth: '2rem', textAlign: 'center' }}>{counter}</span>
          <button onClick={() => setCounter(c => c + 1)}>+</button>
          <button onClick={() => setCounter(0)}>Reset</button>
        </div>
      </div>

      <div>
        <h4>Current State Values</h4>
        <pre style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>
          {JSON.stringify({ userInfo, preferences, counter }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

const GlobalStateDemo = () => {
  const [globalState, setGlobalState] = useState(globalStateManager.getState(''));
  const [subscriptionPath, setSubscriptionPath] = useState('app.theme');
  const [subscriptionValue, setSubscriptionValue] = useState('');

  React.useEffect(() => {
    const unsubscribe = globalStateManager.subscribe('', (newState) => {
      setGlobalState(newState);
    });

    const pathUnsubscribe = globalStateManager.subscribe(subscriptionPath, (value) => {
      setSubscriptionValue(JSON.stringify(value));
    });

    return () => {
      unsubscribe();
      pathUnsubscribe();
    };
  }, [subscriptionPath]);

  const batchUpdate = () => {
    globalStateManager.batchUpdate([
      { path: 'user.name', value: 'Batch User' },
      { path: 'user.email', value: 'batch@example.com' },
      { path: 'app.version', value: '1.0.0' },
      { path: 'app.theme', value: 'dark' }
    ]);
  };

  return (
    <div style={{ padding: '1rem', border: '2px solid purple', borderRadius: '8px' }}>
      <h3>Global State Manager</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h4>Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => globalStateManager.setState('user.name', 'Global User')}>
              Set Global User Name
            </button>
            <button onClick={() => globalStateManager.setState('app.theme', 'dark')}>
              Set Dark Theme
            </button>
            <button onClick={() => globalStateManager.setState('counter', Math.floor(Math.random() * 100))}>
              Random Counter
            </button>
            <button onClick={batchUpdate}>
              Batch Update
            </button>
            <button onClick={() => globalStateManager.resetState({ app: { name: 'React Wrapper' } })}>
              Reset State
            </button>
          </div>
        </div>
        
        <div>
          <h4>Subscription</h4>
          <div>
            <label>Watch Path:</label>
            <input
              type="text"
              value={subscriptionPath}
              onChange={(e) => setSubscriptionPath(e.target.value)}
              placeholder="e.g., user.name, app.theme"
              style={{ width: '100%', marginTop: '0.25rem', marginBottom: '0.5rem' }}
            />
            <p><strong>Current Value:</strong> {subscriptionValue || 'undefined'}</p>
          </div>
        </div>
      </div>

      <div>
        <h4>Global State</h4>
        <pre style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', fontSize: '0.875rem', maxHeight: '200px', overflow: 'auto' }}>
          {JSON.stringify(globalState, null, 2)}
        </pre>
      </div>
    </div>
  );
};

const CompleteDemo = () => {
  return (
    <StateManagerProvider 
      initialState={{ 
        app: { name: 'React Wrapper Demo', theme: 'light' },
        user: { name: 'Demo User' }
      }}
      onStateChange={(state) => console.log('State changed:', state)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <BasicStateDemo />
        <StatePathDemo />
        <GlobalStateDemo />
      </div>
    </StateManagerProvider>
  );
};

const meta: Meta<typeof CompleteDemo> = {
  title: 'React Wrapper/State Manager',
  component: CompleteDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Comprehensive demonstration of the State Management system including basic state management, useStatePath hook, and global state manager.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Complete: Story = {
  render: () => <CompleteDemo />,
};

export const BasicStateManagement: Story = {
  render: () => (
    <StateManagerProvider initialState={{ user: { name: 'Initial User' } }}>
      <BasicStateDemo />
    </StateManagerProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic state management using the useStateManager hook.',
      },
    },
  },
};

export const StatePathHook: Story = {
  render: () => (
    <StateManagerProvider>
      <StatePathDemo />
    </StateManagerProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of the useStatePath hook for managing specific state paths.',
      },
    },
  },
};

export const GlobalState: Story = {
  render: () => <GlobalStateDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Global state manager for cross-component state sharing and subscriptions.',
      },
    },
  },
};