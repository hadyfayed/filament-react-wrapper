// Main export file for React Wrapper package
export { componentRegistry } from './components/ReactComponentRegistry';
export { universalReactRenderer } from './components/UniversalReactRenderer';
export { 
    StateManagerProvider, 
    useStateManager, 
    useStatePath, 
    withStateManager 
} from './components/StateManager';
export { FilamentReactAdapter } from './components/adapters/FilamentReactAdapter';

// Export services
export { StatePersistenceService } from './services/StatePersistenceService';

// Export core functionality (re-export from core)
export { componentRegistry as default, globalStateManager } from './core';