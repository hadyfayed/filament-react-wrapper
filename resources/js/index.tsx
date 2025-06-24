// React Wrapper - Complete system in a single file
import {
  componentRegistry,
  registerComponents,
} from "./components/ReactComponentRegistry";
import { universalReactRenderer } from "./components/UniversalReactRenderer";
import {
  StateManagerProvider,
  useStateManager,
  useStatePath,
  withStateManager,
  globalStateManager,
} from "./components/StateManager";
import {
  statePersistenceService,
  usePersistedState,
} from "./services/StatePersistenceService";

// Import the Filament adapter to ensure it's loaded
import "./components/adapters/FilamentReactAdapter";

// Export all functionality
export {
  // Registry
  componentRegistry,
  registerComponents,

  // Renderer
  universalReactRenderer,

  // State Management
  StateManagerProvider,
  useStateManager,
  useStatePath,
  withStateManager,
  globalStateManager,

  // Persistence
  statePersistenceService,
  usePersistedState,
};

// Bootstrap function for initialization
export function bootstrap() {
  console.log("React Wrapper initialized for Filament integration");
  return true;
}

// Make functionality globally available
if (typeof window !== "undefined") {
  (window as any).ReactWrapper = {
    componentRegistry,
    universalReactRenderer,
    globalStateManager,
    statePersistenceService,
    bootstrap,
  };

  // Make componentRegistry available directly for Blade templates
  (window as any).ReactComponentRegistry = componentRegistry;

  // Auto-bootstrap
  bootstrap();
}

// Default export
export default {
  componentRegistry,
  universalReactRenderer,
  globalStateManager,
  statePersistenceService,
  bootstrap,
};
