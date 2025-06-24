import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';

// Forward declaration of GlobalStateManager interface for use in Window interface
interface GlobalStateManagerInterface {
  setState(path: string, value: any): void;
  getState<T = any>(path: string): T | undefined;
  subscribe(path: string, callback: (value: any) => void): () => void;
  reset(): void;
}

// Extend Window interface for global properties
declare global {
  interface Window {
    workflowDataSync?: (path: string, data: any) => void;
    globalStateManager?: GlobalStateManagerInterface;
  }
}

// State management types
export interface StateManagerState {
  [key: string]: any;
}

export interface StateAction {
  type: 'SET_STATE' | 'UPDATE_STATE' | 'RESET_STATE' | 'BATCH_UPDATE';
  payload: any;
  path?: string;
}

export interface StateManagerContextType {
  state: StateManagerState;
  setState: (path: string, value: any) => void;
  updateState: (path: string, updater: (current: any) => any) => void;
  getState: (path: string) => any;
  resetState: () => void;
  batchUpdate: (updates: Array<{ path: string; value: any }>) => void;
  subscribe: (path: string, callback: (value: any) => void) => () => void;
}

// State reducer function
function stateReducer(state: StateManagerState, action: StateAction): StateManagerState {
  switch (action.type) {
    case 'SET_STATE': {
      if (!action.path) return state;
      return setNestedValue(state, action.path, action.payload);
    }
    case 'UPDATE_STATE': {
      if (!action.path) return state;
      const currentValue = getNestedValue(state, action.path);
      const newValue = typeof action.payload === 'function' ? action.payload(currentValue) : currentValue;
      return setNestedValue(state, action.path, newValue);
    }
    case 'BATCH_UPDATE': {
      if (!Array.isArray(action.payload) || action.payload.length === 0) return state;
      
      let newState = { ...state };
      action.payload.forEach(({ path, value }) => {
        if (path) {
          newState = setNestedValue(newState, path, value);
        }
      });
      return newState;
    }
    case 'RESET_STATE':
      return action.payload || {};
    default:
      return state;
  }
}

// Helper functions for nested state management
function getNestedValue<T = any>(obj: Record<string, any>, path: string): T | undefined {
  if (!path) return obj as T;
  if (!obj || typeof obj !== 'object') return undefined;
  
  return path.split('.').reduce((current, key) => 
    current && typeof current === 'object' ? current[key] : undefined, obj) as T;
}

function setNestedValue(obj: Record<string, any>, path: string, value: any): Record<string, any> {
  if (!path) return value as Record<string, any>;
  
  const keys = path.split('.');
  if (keys.length === 0) return obj;
  
  // Create a deep clone of the object to avoid mutations
  const result = { ...obj } as Record<string, any>;
  let current = result;

  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    if (key === undefined || key === '') continue;
    
    // Check if we need to initialize this level
    const shouldInitialize = 
      !(key in current) || 
      current[key] === null || 
      typeof current[key] !== 'object';

    // Either initialize or clone the existing object
    current[key] = shouldInitialize ? {} : { ...current[key] };
    current = current[key];
  }

  // Set the value at the final key
  const lastKey = keys[keys.length - 1];
  if (lastKey !== undefined && lastKey !== '') {
    current[lastKey] = value;
  }
  
  return result;
}

// Create context for state manager
export const StateManagerContext = createContext<StateManagerContextType | null>(null);

// Default context value for testing environments
StateManagerContext.displayName = 'StateManagerContext';

// State Manager Provider
export interface StateManagerProviderProps {
  children: ReactNode;
  initialState?: StateManagerState;
  onStateChange?: (state: StateManagerState) => void;
  syncPath?: string;
}

export const StateManagerProvider: React.FC<StateManagerProviderProps> = React.memo(({ children, initialState = {}, onStateChange, syncPath }) => {
  const [state, dispatch] = useReducer(stateReducer, initialState);
  const subscribersRef = React.useRef<Map<string, Set<(value: any) => void>>>(new Map());
  
  // Memoize state to prevent unnecessary re-renders
  const memoizedState = React.useMemo(() => state, [state]);

  // Notify external systems of state changes - FIXED WITH DEBOUNCING
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onStateChange && typeof onStateChange === 'function') {
        try {
          onStateChange(memoizedState);
        } catch (error) {
          console.error('Error in onStateChange callback:', error);
        }
      }
      
      if (syncPath && typeof window !== 'undefined' && window.workflowDataSync) {
        try {
          window.workflowDataSync(syncPath, memoizedState);
        } catch (error) {
          console.error('Error in workflowDataSync:', error);
        }
      }
    }, 100); // Debounce to prevent rapid fire updates

    return () => clearTimeout(timeoutId);
  }, [memoizedState, onStateChange, syncPath]);

  // Notify subscribers with memoized callback - FIXED WITH ERROR HANDLING
  const notifySubscribers = React.useCallback(() => {
    subscribersRef.current.forEach((callbacks, path) => {
      if (path && callbacks.size > 0) {
        try {
          const value = getNestedValue(memoizedState, path);
          callbacks.forEach(callback => {
            try {
              callback(value);
            } catch (error) {
              console.error(`Error in subscriber callback for path ${path}:`, error);
            }
          });
        } catch (error) {
          console.error(`Error processing subscribers for path ${path}:`, error);
        }
      }
    });
  }, [memoizedState]);
  
  // Use effect to trigger the memoized notification callback - FIXED WITH DEBOUNCING
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      notifySubscribers();
    }, 50); // Small debounce for subscriber notifications

    return () => clearTimeout(timeoutId);
  }, [notifySubscribers]);

  const setState = useCallback((path: string, value: any) => {
    dispatch({ type: 'SET_STATE', path, payload: value });
  }, []);

  const updateState = useCallback((path: string, updater: (current: any) => any) => {
    dispatch({ type: 'UPDATE_STATE', path, payload: updater });
  }, []);

  const getState = useCallback((path: string) => {
    return getNestedValue(memoizedState, path);
  }, [memoizedState]);

  const resetState = useCallback((newState?: StateManagerState) => {
    dispatch({ type: 'RESET_STATE', payload: newState || {} });
  }, []);

  const batchUpdate = useCallback((updates: Array<{ path: string; value: any }>) => {
    dispatch({ type: 'BATCH_UPDATE', payload: updates });
  }, []);

  const subscribe = useCallback((path: string, callback: (value: any) => void) => {
    if (!path || typeof callback !== 'function') {
      return () => {}; // Return no-op for invalid params
    }

    if (!subscribersRef.current.has(path)) {
      subscribersRef.current.set(path, new Set());
    }
    
    const subscribers = subscribersRef.current.get(path);
    if (subscribers) {
      subscribers.add(callback);
      
      // Immediately notify with current value
      try {
        const currentValue = getNestedValue(memoizedState, path);
        callback(currentValue);
      } catch (error) {
        console.error(`Error in immediate callback for path ${path}:`, error);
      }
    }

    // Return unsubscribe function
    return () => {
      const pathSubscribers = subscribersRef.current.get(path);
      if (pathSubscribers) {
        pathSubscribers.delete(callback);
        if (pathSubscribers.size === 0) {
          subscribersRef.current.delete(path);
        }
      }
    };
  }, [memoizedState]);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo((): StateManagerContextType => ({
    state: memoizedState,
    setState,
    updateState,
    getState,
    resetState,
    batchUpdate,
    subscribe
  }), [memoizedState, setState, updateState, getState, resetState, batchUpdate, subscribe]);

  return (
    <StateManagerContext.Provider value={contextValue}>
      {children}
    </StateManagerContext.Provider>
  );
});

// Hook to use state manager
export const useStateManager = (): StateManagerContextType => {
  const context = useContext(StateManagerContext);
  if (!context) {
    throw new Error('useStateManager must be used within a StateManagerProvider');
  }
  return context;
};

// Hook for specific state path - FIXED WITH PROPER SUBSCRIPTIONS
export const useStatePath = <T = any>(path: string, defaultValue?: T): [T, (value: T | ((prev: T) => T)) => void] => {
  const { getState, setState, subscribe } = useStateManager();
  
  // Initialize local state with value from state manager or default
  const [localState, setLocalState] = React.useState<T>(() => {
    const stateValue = getState(path);
    return stateValue !== undefined ? stateValue : defaultValue as T;
  });

  // Subscribe to changes in the state path with error handling
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = subscribe(path, (value: T) => {
      if (isMounted) {
        const newValue = value !== undefined ? value : defaultValue as T;
        setLocalState(newValue);
      }
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [path, subscribe, defaultValue]);

  // Create a memoized setter function
  const setter = useCallback((value: T | ((prev: T) => T)) => {
    try {
      if (typeof value === 'function') {
        const updater = value as (prev: T) => T;
        const currentValue = getState(path);
        const newValue = updater(currentValue !== undefined ? currentValue : defaultValue as T);
        setState(path, newValue);
      } else {
        setState(path, value);
      }
    } catch (error) {
      console.error(`Error setting state for path ${path}:`, error);
    }
  }, [path, setState, getState, defaultValue]);

  return [localState, setter];
};

// HOC for components that need state management
export function withStateManager<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    initialState?: StateManagerState;
    syncPath?: string;
    onStateChange?: (state: StateManagerState) => void;
  }
): React.FC<P> {
  // Use displayName from the wrapped component or fallback
  const displayName = Component.displayName || Component.name || 'Component';
  
  // Create the wrapped component
  const WrappedComponent: React.FC<P> = (props: P) => {
    return (
      <StateManagerProvider
        initialState={options?.initialState}
        syncPath={options?.syncPath}
        onStateChange={options?.onStateChange}
      >
        <Component {...props} />
      </StateManagerProvider>
    );
  };
  
  // Set displayName for better debugging
  WrappedComponent.displayName = `withStateManager(${displayName})`;
  
  return WrappedComponent;
}

// Global state manager for cross-component communication
class GlobalStateManager implements GlobalStateManagerInterface {
  private state: StateManagerState = {};
  private subscribers: Map<string, Set<(value: any) => void>> = new Map();

  /**
   * Sets a value at the specified path in the state
   * @param path Dot-notation path to set value at
   * @param value Value to set
   */
  setState(path: string, value: any): void {
    if (!path) return;
    
    const newState = setNestedValue(this.state, path, value);
    this.state = newState;
    this.notifySubscribers(path, value);
  }

  /**
   * Gets a value from the specified path in the state
   * @param path Dot-notation path to get value from
   * @returns The value at the specified path or undefined
   */
  getState<T = any>(path: string): T | undefined {
    return getNestedValue<T>(this.state, path);
  }

  /**
   * Subscribes to changes at the specified path
   * @param path Dot-notation path to subscribe to
   * @param callback Function to call when value changes
   * @returns Unsubscribe function
   */
  subscribe(path: string, callback: (value: any) => void): () => void {
    if (!path || typeof callback !== 'function') {
      return () => {}; // Return no-op if invalid params
    }
    
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }
    
    const subscribers = this.subscribers.get(path);
    if (subscribers) {
      subscribers.add(callback);
      
      // Immediately notify with current value
      const currentValue = this.getState(path);
      callback(currentValue);
    }

    // Return unsubscribe function
    return () => {
      const pathSubscribers = this.subscribers.get(path);
      if (pathSubscribers) {
        pathSubscribers.delete(callback);
        if (pathSubscribers.size === 0) {
          this.subscribers.delete(path);
        }
      }
    };
  }

  /**
   * Notifies subscribers of changes at a specific path and its parent paths
   * @param path Path that was changed
   * @param value New value at the path
   */
  private notifySubscribers(path: string, value: any): void {
    if (!path) return;
    
    // Notify exact path subscribers
    const exactSubscribers = this.subscribers.get(path);
    if (exactSubscribers) {
      exactSubscribers.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error(`Error in subscriber callback for path ${path}:`, error);
        }
      });
    }

    // Notify parent path subscribers
    const pathParts = path.split('.');
    for (let i = pathParts.length - 1; i > 0; i -= 1) {
      const parentPath = pathParts.slice(0, i).join('.');
      const parentSubscribers = this.subscribers.get(parentPath);
      if (parentSubscribers) {
        const parentValue = this.getState(parentPath);
        parentSubscribers.forEach(callback => {
          try {
            callback(parentValue);
          } catch (error) {
            console.error(`Error in subscriber callback for parent path ${parentPath}:`, error);
          }
        });
      }
    }
  }

  /**
   * Resets the state and clears all subscribers
   */
  reset(): void {
    this.state = {};
    this.subscribers.clear();
  }
}

export const globalStateManager = new GlobalStateManager();

// Make global state manager available on window for debugging
if (typeof window !== 'undefined') {
  window.globalStateManager = globalStateManager;
}