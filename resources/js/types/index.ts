/**
 * Public type definitions for React Wrapper
 */

// Re-export key interfaces
export type { IComponentDefinition } from '../interfaces/IComponentRegistry';
export type { IStateManagerState } from '../interfaces/IStateManager';

// Use simple any types for the main API to avoid private member exposure
export interface ReactWrapperAPI {
  readonly componentRegistry: any;
  readonly universalReactRenderer: any;
  readonly globalStateManager: any;
  readonly statePersistenceService: any;
  readonly devTools: any;
  readonly codeSplittingService: any;
  readonly componentVersioningService: any;
  readonly bootstrap: () => boolean;
}