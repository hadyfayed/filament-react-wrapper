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
import { devTools } from "./services/DevTools";
import { codeSplittingService } from "./services/CodeSplittingService";
import { componentVersioningService } from "./services/ComponentVersioningService";
import type { ReactWrapperAPI } from "./types";

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

  // Advanced Services
  devTools,
  codeSplittingService,
  componentVersioningService,
};

// Export types
export * from "./types";

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
    devTools,
    codeSplittingService,
    componentVersioningService,
    bootstrap,
  };

  // Make componentRegistry available directly for Blade templates
  (window as any).ReactComponentRegistry = componentRegistry;

  // Auto-bootstrap
  bootstrap();
}

// Default export with proper typing to avoid exposing private members
const ReactWrapper: ReactWrapperAPI = {
  componentRegistry,
  universalReactRenderer,
  globalStateManager,
  statePersistenceService,
  devTools,
  codeSplittingService,
  componentVersioningService,
  bootstrap,
};

export default ReactWrapper;
