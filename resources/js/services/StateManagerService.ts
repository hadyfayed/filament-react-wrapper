/**
 * State Manager Service - implements IStateManager interface
 * Following Liskov Substitution Principle
 */

import {
  IStateManager,
  IStateManagerState,
  IStateValidator,
  IStatePersistence,
} from "../interfaces/IStateManager";

export abstract class BaseStateManager implements IStateManager {
  protected state: IStateManagerState = {};
  protected subscribers: Map<string, Set<(value: any) => void>> = new Map();

  abstract setState(path: string, value: any): void;
  abstract updateState(path: string, updater: (current: any) => any): void;
  abstract getState(path: string): any;
  abstract resetState(newState?: IStateManagerState): void;
  abstract batchUpdate(updates: Array<{ path: string; value: any }>): void;

  subscribe(path: string, callback: (value: any) => void): () => void {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }

    const subscribers = this.subscribers.get(path)!;
    subscribers.add(callback);

    // Immediately notify with current value
    try {
      const currentValue = this.getNestedValue(this.state, path);
      callback(currentValue);
    } catch (error) {
      console.error(`Error in immediate callback for path ${path}:`, error);
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

  protected getNestedValue<T = any>(
    obj: Record<string, any>,
    path: string,
  ): T | undefined {
    if (!path) return obj as T;
    if (!obj || typeof obj !== "object") return undefined;

    return path
      .split(".")
      .reduce(
        (current, key) =>
          current && typeof current === "object" ? current[key] : undefined,
        obj,
      ) as T;
  }

  protected setNestedValue(
    obj: Record<string, any>,
    path: string,
    value: any,
  ): Record<string, any> {
    if (!path) return value as Record<string, any>;

    const keys = path.split(".");
    if (keys.length === 0) return obj;

    const result = { ...obj } as Record<string, any>;
    let current = result;

    for (let i = 0; i < keys.length - 1; i += 1) {
      const key = keys[i];
      if (key === undefined || key === "") continue;

      const shouldInitialize =
        !(key in current) ||
        current[key] === null ||
        typeof current[key] !== "object";

      current[key] = shouldInitialize ? {} : { ...current[key] };
      current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey !== undefined && lastKey !== "") {
      current[lastKey] = value;
    }

    return result;
  }

  protected notifySubscribers(path: string, value: any): void {
    // Notify exact path subscribers
    const exactSubscribers = this.subscribers.get(path);
    if (exactSubscribers) {
      exactSubscribers.forEach((callback) => {
        try {
          callback(value);
        } catch (error) {
          console.error(
            `Error in subscriber callback for path ${path}:`,
            error,
          );
        }
      });
    }

    // Notify parent path subscribers
    const pathParts = path.split(".");
    for (let i = pathParts.length - 1; i > 0; i -= 1) {
      const parentPath = pathParts.slice(0, i).join(".");
      const parentSubscribers = this.subscribers.get(parentPath);
      if (parentSubscribers) {
        const parentValue = this.getNestedValue(this.state, parentPath);
        parentSubscribers.forEach((callback) => {
          try {
            callback(parentValue);
          } catch (error) {
            console.error(
              `Error in subscriber callback for parent path ${parentPath}:`,
              error,
            );
          }
        });
      }
    }
  }
}

export class StandardStateManager extends BaseStateManager {
  setState(path: string, value: any): void {
    if (!path) return;

    this.state = this.setNestedValue(this.state, path, value);
    this.notifySubscribers(path, value);
  }

  updateState(path: string, updater: (current: any) => any): void {
    if (!path || typeof updater !== "function") return;

    const currentValue = this.getNestedValue(this.state, path);
    const newValue = updater(currentValue);
    this.setState(path, newValue);
  }

  getState(path: string): any {
    return this.getNestedValue(this.state, path);
  }

  resetState(newState: IStateManagerState = {}): void {
    this.state = { ...newState };

    // Notify all subscribers of reset
    this.subscribers.forEach((callbacks, path) => {
      const value = this.getNestedValue(this.state, path);
      callbacks.forEach((callback) => {
        try {
          callback(value);
        } catch (error) {
          console.error(`Error in reset callback for path ${path}:`, error);
        }
      });
    });
  }

  batchUpdate(updates: Array<{ path: string; value: any }>): void {
    if (!Array.isArray(updates) || updates.length === 0) return;

    let newState = { ...this.state };
    const notificationPaths = new Set<string>();

    updates.forEach(({ path, value }) => {
      if (path) {
        newState = this.setNestedValue(newState, path, value);
        notificationPaths.add(path);
      }
    });

    this.state = newState;

    // Notify all affected paths
    notificationPaths.forEach((path) => {
      const value = this.getNestedValue(this.state, path);
      this.notifySubscribers(path, value);
    });
  }
}

export class ValidatedStateManager extends StandardStateManager {
  constructor(private validator?: IStateValidator) {
    super();
  }

  setState(path: string, value: any): void {
    if (this.validator && !this.validator.validate(path, value)) {
      const errors = this.validator.getValidationErrors(path, value);
      console.error(`Validation failed for path ${path}:`, errors);
      return;
    }

    super.setState(path, value);
  }

  updateState(path: string, updater: (current: any) => any): void {
    const currentValue = this.getNestedValue(this.state, path);
    const newValue = updater(currentValue);

    if (this.validator && !this.validator.validate(path, newValue)) {
      const errors = this.validator.getValidationErrors(path, newValue);
      console.error(`Validation failed for path ${path}:`, errors);
      return;
    }

    super.setState(path, newValue);
  }
}

export class PersistentStateManager extends StandardStateManager {
  constructor(
    private persistence: IStatePersistence,
    private persistenceKey: string = "app-state",
  ) {
    super();
    this.loadFromPersistence();
  }

  async setState(path: string, value: any): Promise<void> {
    super.setState(path, value);
    await this.saveToPersistence();
  }

  async resetState(newState: IStateManagerState = {}): Promise<void> {
    super.resetState(newState);
    await this.saveToPersistence();
  }

  async batchUpdate(
    updates: Array<{ path: string; value: any }>,
  ): Promise<void> {
    super.batchUpdate(updates);
    await this.saveToPersistence();
  }

  private async loadFromPersistence(): Promise<void> {
    try {
      const persistedState = await this.persistence.load(this.persistenceKey);
      if (persistedState) {
        this.state = persistedState;
      }
    } catch (error) {
      console.error("Error loading persisted state:", error);
    }
  }

  private async saveToPersistence(): Promise<void> {
    try {
      await this.persistence.save(this.persistenceKey, this.state);
    } catch (error) {
      console.error("Error saving state to persistence:", error);
    }
  }

  async clearPersistence(): Promise<void> {
    try {
      await this.persistence.remove(this.persistenceKey);
    } catch (error) {
      console.error("Error clearing persisted state:", error);
    }
  }
}
