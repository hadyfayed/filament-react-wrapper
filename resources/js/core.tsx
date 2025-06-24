// Import components and services - using named imports for better tree shaking
import { componentRegistry, registerComponents } from './components/ReactComponentRegistry';
import { universalReactRenderer } from './components/UniversalReactRenderer';
import { 
    StateManagerProvider, 
    useStateManager, 
    useStatePath, 
    withStateManager,
    globalStateManager 
} from './components/StateManager';
import { 
    statePersistenceService, 
    usePersistedState 
} from './services/StatePersistenceService';

// Import the universal React integration system
// Import adapter directly since we're bundling everything together
import './components/adapters/FilamentReactAdapter';

// Export individual components for better tree shaking
// Registry
export { componentRegistry, registerComponents };

// Renderer
export { universalReactRenderer };

// State Management
export { 
    StateManagerProvider, 
    useStateManager, 
    useStatePath, 
    withStateManager,
    globalStateManager 
};

// Persistence
export { 
    statePersistenceService, 
    usePersistedState 
};

// Auto-initialize the React wrapper system
console.log('React Wrapper system loaded');

// Make core functionality available globally for debugging
if (typeof window !== 'undefined') {
    (window as any).ReactWrapper = {
        componentRegistry,
        universalReactRenderer,
        globalStateManager,
        statePersistenceService
    };
    
    // Also make componentRegistry available directly for Blade templates
    (window as any).ReactComponentRegistry = componentRegistry;
}