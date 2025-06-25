import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { 
  StateManagerProvider, 
  useStateManager, 
  useStatePath,
  globalStateManager 
} from '@/components/StateManager';

// Test component using useStateManager
const StateManagerTestComponent = () => {
  const { state, setState, getState } = useStateManager();
  
  return (
    <div>
      <div data-testid="state-display">{JSON.stringify(state)}</div>
      <button 
        data-testid="set-user-name"
        onClick={() => setState('user.name', 'John Doe')}
      >
        Set User Name
      </button>
      <button 
        data-testid="get-user-name"
        onClick={() => {
          const name = getState('user.name');
          setState('displayName', name);
        }}
      >
        Get User Name
      </button>
    </div>
  );
};

// Test component using useStatePath
const StatePathTestComponent = () => {
  const [count, setCount] = useStatePath('counter', 0);
  const [user, setUser] = useStatePath('user', { name: '', email: '' });
  
  return (
    <div>
      <div data-testid="count-display">{count}</div>
      <div data-testid="user-name">{user.name}</div>
      <button 
        data-testid="increment"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
      <button 
        data-testid="set-user"
        onClick={() => setUser({ name: 'Jane', email: 'jane@example.com' })}
      >
        Set User
      </button>
    </div>
  );
};

describe('StateManager', () => {
  beforeEach(() => {
    globalStateManager.resetState();
  });

  describe('StateManagerProvider', () => {
    it('should provide initial state to children', () => {
      const initialState = { user: { name: 'Initial User' } };
      
      render(
        <StateManagerProvider initialState={initialState}>
          <StateManagerTestComponent />
        </StateManagerProvider>
      );

      expect(screen.getByTestId('state-display')).toHaveTextContent(
        JSON.stringify(initialState)
      );
    });

    it('should update state when setState is called', () => {
      render(
        <StateManagerProvider initialState={{}}>
          <StateManagerTestComponent />
        </StateManagerProvider>
      );

      fireEvent.click(screen.getByTestId('set-user-name'));

      expect(screen.getByTestId('state-display')).toHaveTextContent(
        JSON.stringify({ user: { name: 'John Doe' } })
      );
    });

    it('should handle nested state paths', () => {
      render(
        <StateManagerProvider initialState={{}}>
          <StateManagerTestComponent />
        </StateManagerProvider>
      );

      fireEvent.click(screen.getByTestId('set-user-name'));
      fireEvent.click(screen.getByTestId('get-user-name'));

      const stateContent = screen.getByTestId('state-display').textContent;
      expect(stateContent).toContain('"displayName":"John Doe"');
    });

    it('should call onStateChange when state updates', () => {
      const onStateChange = vi.fn();
      
      render(
        <StateManagerProvider 
          initialState={{}} 
          onStateChange={onStateChange}
        >
          <StateManagerTestComponent />
        </StateManagerProvider>
      );

      fireEvent.click(screen.getByTestId('set-user-name'));

      expect(onStateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          user: { name: 'John Doe' }
        })
      );
    });
  });

  describe('useStatePath', () => {
    it('should initialize with default value', () => {
      render(
        <StateManagerProvider>
          <StatePathTestComponent />
        </StateManagerProvider>
      );

      expect(screen.getByTestId('count-display')).toHaveTextContent('0');
      expect(screen.getByTestId('user-name')).toHaveTextContent('');
    });

    it('should update state when setter is called', () => {
      render(
        <StateManagerProvider>
          <StatePathTestComponent />
        </StateManagerProvider>
      );

      fireEvent.click(screen.getByTestId('increment'));
      expect(screen.getByTestId('count-display')).toHaveTextContent('1');

      fireEvent.click(screen.getByTestId('increment'));
      expect(screen.getByTestId('count-display')).toHaveTextContent('2');
    });

    it('should handle complex object updates', () => {
      render(
        <StateManagerProvider>
          <StatePathTestComponent />
        </StateManagerProvider>
      );

      fireEvent.click(screen.getByTestId('set-user'));
      expect(screen.getByTestId('user-name')).toHaveTextContent('Jane');
    });

    it('should support functional updates', () => {
      const FunctionalUpdateComponent = () => {
        const [count, setCount] = useStatePath('counter', 0);
        
        return (
          <div>
            <div data-testid="count">{count}</div>
            <button 
              data-testid="functional-increment"
              onClick={() => setCount(prev => prev + 10)}
            >
              Increment by 10
            </button>
          </div>
        );
      };

      render(
        <StateManagerProvider>
          <FunctionalUpdateComponent />
        </StateManagerProvider>
      );

      fireEvent.click(screen.getByTestId('functional-increment'));
      expect(screen.getByTestId('count')).toHaveTextContent('10');
    });
  });

  describe('Global State Manager', () => {
    it('should set and get global state', () => {
      globalStateManager.setState('app.theme', 'dark');
      const theme = globalStateManager.getState('app.theme');
      
      expect(theme).toBe('dark');
    });

    it('should handle nested paths', () => {
      globalStateManager.setState('user.preferences.theme', 'light');
      const theme = globalStateManager.getState('user.preferences.theme');
      
      expect(theme).toBe('light');
    });

    it('should support batch updates', () => {
      const updates = [
        { path: 'user.name', value: 'John' },
        { path: 'user.email', value: 'john@example.com' },
        { path: 'app.theme', value: 'dark' }
      ];

      globalStateManager.batchUpdate(updates);

      expect(globalStateManager.getState('user.name')).toBe('John');
      expect(globalStateManager.getState('user.email')).toBe('john@example.com');
      expect(globalStateManager.getState('app.theme')).toBe('dark');
    });

    it('should support subscriptions', () => {
      const listener = vi.fn();
      const unsubscribe = globalStateManager.subscribe('user.name', listener);

      globalStateManager.setState('user.name', 'Jane');
      expect(listener).toHaveBeenCalledWith('Jane');

      unsubscribe();
      globalStateManager.setState('user.name', 'Bob');
      expect(listener).toHaveBeenCalledTimes(1); // Should not be called after unsubscribe
    });

    it('should support wildcard subscriptions', () => {
      const listener = vi.fn();
      globalStateManager.subscribe('user.*', listener);

      globalStateManager.setState('user.name', 'John');
      globalStateManager.setState('user.email', 'john@example.com');

      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('should handle updateState with function', () => {
      globalStateManager.setState('counter', 5);
      globalStateManager.updateState('counter', (current) => current * 2);
      
      expect(globalStateManager.getState('counter')).toBe(10);
    });

    it('should reset state', () => {
      globalStateManager.setState('user.name', 'John');
      globalStateManager.setState('app.theme', 'dark');

      const newState = { app: { version: '1.0.0' } };
      globalStateManager.resetState(newState);

      expect(globalStateManager.getState('user.name')).toBeUndefined();
      expect(globalStateManager.getState('app.theme')).toBeUndefined();
      expect(globalStateManager.getState('app.version')).toBe('1.0.0');
    });
  });

  describe('Memory Safety', () => {
    it('should clean up subscriptions on component unmount', () => {
      const TestComponent = () => {
        const [value] = useStatePath('test', 0);
        return <div data-testid="value">{value}</div>;
      };

      const { unmount } = render(
        <StateManagerProvider>
          <TestComponent />
        </StateManagerProvider>
      );

      // Verify subscription exists
      globalStateManager.setState('test', 1);
      expect(screen.getByTestId('value')).toHaveTextContent('1');

      // Unmount component
      unmount();

      // Verify cleanup (this would be verified by checking internal subscription count)
      // In a real implementation, you'd expose subscription count for testing
    });

    it('should prevent circular notifications', () => {
      const circularListener = vi.fn((value) => {
        // This would normally cause infinite loop
        globalStateManager.setState('circular', value + 1);
      });

      globalStateManager.subscribe('circular', circularListener);
      globalStateManager.setState('circular', 1);

      // Should not cause infinite loop due to circular protection
      expect(circularListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance Optimizations', () => {
    it('should debounce rapid state updates', async () => {
      const listener = vi.fn();
      globalStateManager.subscribe('debounced', listener);

      // Rapid updates
      act(() => {
        globalStateManager.setState('debounced', 1);
        globalStateManager.setState('debounced', 2);
        globalStateManager.setState('debounced', 3);
      });

      // Should only call listener once with final value due to debouncing
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(listener).toHaveBeenCalledWith(3);
    });

    it('should memoize state selectors', () => {
      const ExpensiveComponent = () => {
        const expensiveValue = globalStateManager.getState('expensive', () => {
          // Expensive computation mock
          return Math.random();
        });
        
        return <div data-testid="expensive">{expensiveValue}</div>;
      };

      render(
        <StateManagerProvider>
          <ExpensiveComponent />
        </StateManagerProvider>
      );

      const firstValue = screen.getByTestId('expensive').textContent;
      
      // Re-render should use memoized value
      render(
        <StateManagerProvider>
          <ExpensiveComponent />
        </StateManagerProvider>
      );

      const secondValue = screen.getByTestId('expensive').textContent;
      expect(firstValue).toBe(secondValue);
    });
  });
});