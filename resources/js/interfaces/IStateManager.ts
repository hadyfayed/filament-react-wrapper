/**
 * State Manager Interface - defines contract for state management
 * Following Interface Segregation Principle
 */

export interface IStateManagerState {
  [key: string]: any;
}

export interface IStateAction {
  type: "SET_STATE" | "UPDATE_STATE" | "RESET_STATE" | "BATCH_UPDATE";
  payload: any;
  path?: string;
}

export interface IStateManager {
  setState(path: string, value: any): void;
  updateState(path: string, updater: (current: any) => any): void;
  getState(path: string): any;
  resetState(newState?: IStateManagerState): void;
  batchUpdate(updates: Array<{ path: string; value: any }>): void;
  subscribe(path: string, callback: (value: any) => void): () => void;
}

export interface IStateSubscriber {
  path: string;
  callback: (value: any) => void;
  priority?: number;
}

export interface IStateValidator {
  validate(path: string, value: any): boolean;
  getValidationErrors(path: string, value: any): string[];
}

export interface IStatePersistence {
  save(key: string, state: IStateManagerState): Promise<void>;
  load(key: string): Promise<IStateManagerState | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
