// State persistence service for handling data sync between React and backend
export interface StatePersistenceConfig {
  key: string;
  storage?: "localStorage" | "sessionStorage" | "none";
  syncWithLivewire?: boolean;
  livewirePath?: string;
  debounceMs?: number;
  transformer?: {
    serialize?: (data: unknown) => unknown;
    deserialize?: (data: unknown) => unknown;
  };
}

export class StatePersistenceService {
  private configs: Map<string, StatePersistenceConfig> = new Map();
  private debounceTimeouts: Map<string, number> = new Map();
  private lastValues: Map<string, unknown> = new Map();
  private maxMapSize = 1000; // Prevent unbounded growth

  /**
   * Register a state path for persistence
   */
  register(config: StatePersistenceConfig): void {
    // Prevent unbounded growth by cleaning up old entries
    if (this.configs.size >= this.maxMapSize) {
      this.cleanupOldEntries();
    }

    this.configs.set(config.key, {
      storage: "localStorage",
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
  async save(key: string, value: unknown): Promise<void> {
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
    const timeout = setTimeout(async () => {
      await this.performSave(key, value, config);
      this.debounceTimeouts.delete(key);
    }, config.debounceMs);

    this.debounceTimeouts.set(key, timeout as unknown as number);
  }

  /**
   * Load state value from storage
   */
  async load(key: string): Promise<unknown> {
    const config = this.configs.get(key);
    if (!config) {
      return null;
    }

    return Promise.resolve(this.loadFromStorage(key));
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
   * Remove stored data for a key (alias for clear)
   */
  async remove(key: string): Promise<void> {
    this.clearSync(key);
  }

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    // Clear all configs
    this.configs.clear();
    this.lastValues.clear();
    
    // Clear all timeouts
    this.debounceTimeouts.forEach(timeout => clearTimeout(timeout));
    this.debounceTimeouts.clear();
    
    // Clear localStorage and sessionStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  }

  /**
   * Clear stored data for a specific key
   */
  private clearSync(key: string): void {
    const config = this.configs.get(key);
    if (!config) {
      return;
    }

    // Clear from storage
    if (config.storage !== "none") {
      const storage =
        config.storage === "localStorage" ? localStorage : sessionStorage;
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
  private async performSave(
    key: string,
    value: unknown,
    config: StatePersistenceConfig,
  ): Promise<void> {
    try {
      // Transform data if transformer is provided
      const serializedValue = config.transformer?.serialize
        ? config.transformer.serialize(value)
        : value;

      // Save to storage
      if (config.storage !== "none") {
        this.saveToStorage(
          key,
          serializedValue,
          config.storage as "localStorage" | "sessionStorage",
        );
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
  private saveToStorage(
    key: string,
    value: unknown,
    storageType: "localStorage" | "sessionStorage",
  ): void {
    const storage =
      storageType === "localStorage" ? localStorage : sessionStorage;
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to ${storageType}:`, error);
    }
  }

  /**
   * Load from browser storage
   */
  private loadFromStorage(key: string): unknown {
    const config = this.configs.get(key);
    if (!config || config.storage === "none") {
      return null;
    }

    const storage =
      config.storage === "localStorage" ? localStorage : sessionStorage;
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
  private syncWithLivewire(livewirePath: string, value: unknown): void {
    if (window.workflowDataSync) {
      window.workflowDataSync(livewirePath, value);
    } else {
      console.warn("workflowDataSync not available for Livewire sync");
    }
  }

  /**
   * Deep equality check
   */
  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== typeof b) return false;

    if (typeof a === "object") {
      if (Array.isArray(a) !== Array.isArray(b)) return false;

      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) return false;

      for (const key of keysA) {
        if (!keysB.includes(key) || !this.deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
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
  private deepClone(obj: unknown): unknown {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return obj.map((item) => this.deepClone(item));

    const cloned: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone((obj as Record<string, unknown>)[key]);
      }
    }
    return cloned;
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  private cleanupOldEntries(): void {
    // Clean up entries without active timeouts first
    const keysToRemove: string[] = [];
    
    this.configs.forEach((_config, key) => {
      if (!this.debounceTimeouts.has(key)) {
        keysToRemove.push(key);
      }
    });

    // Remove up to 100 old entries
    keysToRemove.slice(0, 100).forEach(key => {
      this.configs.delete(key);
      this.lastValues.delete(key);
    });

    // If still too many, remove oldest 100 entries
    if (this.configs.size >= this.maxMapSize) {
      const allKeys = Array.from(this.configs.keys());
      allKeys.slice(0, 100).forEach(key => {
        this.unregister(key);
      });
    }
  }
}

// Global instance
export const statePersistenceService = new StatePersistenceService();

// Auto-flush on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    statePersistenceService.flush();
  });

  // Make available globally for debugging
  (window as unknown as Record<string, unknown>).statePersistenceService = statePersistenceService;
}

// React hook for using state persistence
import { useState, useEffect, useCallback, useMemo } from "react";

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  config?: Partial<StatePersistenceConfig>,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Memoize the full config to prevent unnecessary re-renders
  const fullConfig = useMemo<StatePersistenceConfig>(
    () => ({
      key,
      storage: "localStorage",
      syncWithLivewire: false,
      debounceMs: 300,
      ...config,
    }),
    [key, config],
  );

  // Register the key
  useEffect(() => {
    statePersistenceService.register(fullConfig);
    return () => statePersistenceService.unregister(key);
  }, [key, fullConfig]);

  // Load initial value with memoization
  const initialValue = useMemo(() => {
    // Since load is now async, we'll start with defaultValue and update in useEffect
    return defaultValue ?? ({} as T);
  }, [defaultValue]);

  // Use state with memoized initial value
  const [value, setValue] = useState<T>(() => initialValue);

  // Load persisted value on mount
  useEffect(() => {
    let mounted = true;
    
    const loadPersistedValue = async () => {
      try {
        const loaded = await statePersistenceService.load(key);
        if (mounted && loaded !== null) {
          setValue(loaded as T);
        }
      } catch (error) {
        console.error('Error loading persisted state:', error);
      }
    };
    
    loadPersistedValue();
    
    return () => {
      mounted = false;
    };
  }, [key]);

  // Memoized setter function to prevent unnecessary re-renders
  const setter = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prevValue) => {
        const finalValue =
          typeof newValue === "function"
            ? (newValue as (prev: T) => T)(prevValue)
            : newValue;

        // Persist the value (fire and forget)
        statePersistenceService.save(key, finalValue).catch(error => {
          console.error('Error persisting state:', error);
        });

        return finalValue;
      });
    },
    [key],
  );

  // Return memoized value and setter
  return [value, setter];
}
