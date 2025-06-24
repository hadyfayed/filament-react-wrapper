// State persistence service for handling data sync between React and backend
export interface StatePersistenceConfig {
  key: string;
  storage?: 'localStorage' | 'sessionStorage' | 'none';
  syncWithLivewire?: boolean;
  livewirePath?: string;
  debounceMs?: number;
  transformer?: {
    serialize?: (data: any) => any;
    deserialize?: (data: any) => any;
  };
}

export class StatePersistenceService {
  private configs: Map<string, StatePersistenceConfig> = new Map();
  private debounceTimeouts: Map<string, number> = new Map();
  private lastValues: Map<string, any> = new Map();

  /**
   * Register a state path for persistence
   */
  register(config: StatePersistenceConfig): void {
    this.configs.set(config.key, {
      storage: 'localStorage',
      syncWithLivewire: false,
      debounceMs: 300,
      ...config,
    });

    // Load initial value from storage
    this.loadFromStorage(config.key);
  }

  /**
   * Save state value with persistence and sync
   */
  save(key: string, value: any): void {
    const config = this.configs.get(key);
    if (!config) {
      console.warn(`State persistence config not found for key: ${key}`);
      return;
    }

    // Check if value actually changed
    const lastValue = this.lastValues.get(key);
    if (this.deepEqual(lastValue, value)) {
      return; // No change, skip save
    }

    this.lastValues.set(key, this.deepClone(value));

    // Clear existing timeout
    const existingTimeout = this.debounceTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Debounce the save operation
    const timeout = setTimeout(() => {
      this.performSave(key, value, config);
      this.debounceTimeouts.delete(key);
    }, config.debounceMs);

    this.debounceTimeouts.set(key, timeout as unknown as number);
  }

  /**
   * Load state value from storage
   */
  load(key: string): any {
    const config = this.configs.get(key);
    if (!config) {
      return null;
    }

    return this.loadFromStorage(key);
  }

  /**
   * Clear all timeouts and perform immediate sync
   */
  flush(): void {
    // Execute all pending saves immediately
    this.debounceTimeouts.forEach((timeout, key) => {
      clearTimeout(timeout);
      const config = this.configs.get(key);
      const value = this.lastValues.get(key);
      if (config && value !== undefined) {
        this.performSave(key, value, config);
      }
    });
    this.debounceTimeouts.clear();
  }

  /**
   * Unregister a state path
   */
  unregister(key: string): void {
    const timeout = this.debounceTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.debounceTimeouts.delete(key);
    }
    this.configs.delete(key);
    this.lastValues.delete(key);
  }

  /**
   * Get all registered keys
   */
  getRegisteredKeys(): string[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Clear all stored data for a key
   */
  clear(key: string): void {
    const config = this.configs.get(key);
    if (!config) {
      return;
    }

    // Clear from storage
    if (config.storage !== 'none') {
      const storage = config.storage === 'localStorage' ? localStorage : sessionStorage;
      storage.removeItem(key);
    }

    // Clear from memory
    this.lastValues.delete(key);

    // Clear pending timeout
    const timeout = this.debounceTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.debounceTimeouts.delete(key);
    }
  }

  /**
   * Perform the actual save operation
   */
  private performSave(key: string, value: any, config: StatePersistenceConfig): void {
    try {
      // Transform data if transformer is provided
      const serializedValue = config.transformer?.serialize 
        ? config.transformer.serialize(value)
        : value;

      // Save to storage
      if (config.storage !== 'none') {
        this.saveToStorage(key, serializedValue, config.storage as 'localStorage' | 'sessionStorage');
      }

      // Sync with Livewire
      if (config.syncWithLivewire && config.livewirePath) {
        this.syncWithLivewire(config.livewirePath, serializedValue);
      }

      console.log(`State persisted for key: ${key}`, serializedValue);
    } catch (error) {
      console.error(`Error persisting state for key: ${key}`, error);
    }
  }

  /**
   * Save to browser storage
   */
  private saveToStorage(key: string, value: any, storageType: 'localStorage' | 'sessionStorage'): void {
    const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to ${storageType}:`, error);
    }
  }

  /**
   * Load from browser storage
   */
  private loadFromStorage(key: string): any {
    const config = this.configs.get(key);
    if (!config || config.storage === 'none') {
      return null;
    }

    const storage = config.storage === 'localStorage' ? localStorage : sessionStorage;
    try {
      const stored = storage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        const value = config.transformer?.deserialize 
          ? config.transformer.deserialize(parsed)
          : parsed;
        
        this.lastValues.set(key, this.deepClone(value));
        return value;
      }
    } catch (error) {
      console.error(`Error loading from ${config.storage}:`, error);
    }
    return null;
  }

  /**
   * Sync with Livewire component
   */
  private syncWithLivewire(livewirePath: string, value: any): void {
    if (window.workflowDataSync) {
      window.workflowDataSync(livewirePath, value);
    } else {
      console.warn('workflowDataSync not available for Livewire sync');
    }
  }

  /**
   * Deep equality check
   */
  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      for (const key of keysA) {
        if (!keysB.includes(key) || !this.deepEqual(a[key], b[key])) {
          return false;
        }
      }
      return true;
    }
    
    return false;
  }

  /**
   * Deep clone object
   */
  private deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
    
    const cloned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  }
}

// Global instance
export const statePersistenceService = new StatePersistenceService();

// Auto-flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    statePersistenceService.flush();
  });

  // Make available globally for debugging
  (window as any).statePersistenceService = statePersistenceService;
}

// React hook for using state persistence
import { useState, useEffect, useCallback, useMemo } from 'react';

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  config?: Partial<StatePersistenceConfig>
): [T, (value: T | ((prev: T) => T)) => void] {
  // Memoize the full config to prevent unnecessary re-renders
  const fullConfig = useMemo<StatePersistenceConfig>(() => ({
    key,
    storage: 'localStorage',
    syncWithLivewire: false,
    debounceMs: 300,
    ...config,
  }), [key, config]);

  // Register the key
  useEffect(() => {
    statePersistenceService.register(fullConfig);
    return () => statePersistenceService.unregister(key);
  }, [key, fullConfig]);

  // Load initial value with memoization
  const initialValue = useMemo(() => {
    const loaded = statePersistenceService.load(key);
    return loaded !== null ? loaded : defaultValue;
  }, [key, defaultValue]);
  
  // Use state with memoized initial value
  const [value, setValue] = useState<T>(initialValue);
  
  // Update state if initialValue changes (rare, but possible if defaultValue prop changes)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Memoized setter function to prevent unnecessary re-renders
  const setter = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prevValue => {
      const finalValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prevValue)
        : newValue;
      
      // Persist the value
      statePersistenceService.save(key, finalValue);
      
      return finalValue;
    });
  }, [key]);

  // Return memoized value and setter
  return [value, setter];
}

