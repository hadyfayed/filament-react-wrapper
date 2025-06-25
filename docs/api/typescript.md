# TypeScript API Reference

Complete TypeScript API documentation for React Wrapper.

## 📦 Main Exports

```typescript
import {
  // Core Services
  componentRegistry,
  universalReactRenderer,
  globalStateManager,
  statePersistenceService,
  
  // Advanced Services
  devTools,
  codeSplittingService,
  componentVersioningService,
  
  // React Hooks
  StateManagerProvider,
  useStateManager,
  useStatePath,
  usePersistedState,
  withStateManager,
  
  // Utility Functions
  registerComponents,
  bootstrap,
  
  // Types
  IComponentDefinition,
  IStateManagerState,
  ReactWrapperAPI
} from '@hadyfayed/filament-react-wrapper';
```

## 🎛️ Component Registry API

### Interface: `IComponentRegistry`

```typescript
interface IComponentRegistry {
  register(definition: IComponentDefinition): void;
  get(name: string): IComponentDefinition | undefined;
  create(name: string, props?: Record<string, any>): React.ComponentType<any> | null;
  has(name: string): boolean;
  unregister(name: string): boolean;
  clear(): void;
  getComponentNames(): string[];
  getStats(): ComponentStats;
  mount(componentName: string, containerId: string, props?: Record<string, any>): void;
  unmount(containerId: string): void;
  scanAndMount(container?: Element): void;
  on(event: string, callback: Function, priority?: number): void;
  off(event: string, callback: Function): void;
  addMiddleware(middleware: MiddlewareFunction): void;
}
```

### Interface: `IComponentDefinition`

```typescript
interface IComponentDefinition {
  name: string;
  component: React.ComponentType<any> | (() => Promise<{ default: React.ComponentType<any> }>);
  defaultProps?: Record<string, any>;
  isAsync?: boolean;
  config?: ComponentConfig;
  metadata?: ComponentMetadata;
  hooks?: ComponentHooks;
}
```

### Interface: `ComponentConfig`

```typescript
interface ComponentConfig {
  lazy?: boolean;
  cache?: boolean;
  preload?: boolean;
  middleware?: MiddlewareFunction[];
  onError?: (error: Error, componentName: string) => void;
  fallback?: React.ComponentType<any>;
}
```

### Interface: `ComponentMetadata`

```typescript
interface ComponentMetadata {
  category?: string;
  subcategory?: string;
  description?: string;
  tags?: string[];
  author?: string;
  version?: string;
  documentation?: string;
  examples?: string[];
  [key: string]: any;
}
```

### Type: `MiddlewareFunction`

```typescript
type MiddlewareFunction = (
  component: React.ComponentType<any>,
  props: Record<string, any>,
  context: MiddlewareContext
) => React.ComponentType<any>;

interface MiddlewareContext {
  metadata: ComponentMetadata;
  config: ComponentConfig;
}
```

### Methods

#### `register(definition: IComponentDefinition): void`

Registers a React component in the registry.

```typescript
componentRegistry.register({
  name: 'MyComponent',
  component: MyComponent,
  defaultProps: { theme: 'light' },
  metadata: { category: 'ui' }
});
```

#### `create(name: string, props?: Record<string, any>): React.ComponentType | null`

Creates a component instance with optional props.

```typescript
const Component = componentRegistry.create('MyComponent', { title: 'Hello' });
if (Component) {
  return <Component />;
}
```

#### `mount(componentName: string, containerId: string, props?: Record<string, any>): void`

Mounts a component to a DOM element.

```typescript
componentRegistry.mount('MyComponent', 'my-container', { title: 'Mounted' });
```

## 🔄 State Management API

### Interface: `IStateManager`

```typescript
interface IStateManager {
  setState(path: string, value: any): void;
  updateState(path: string, updater: (current: any) => any): void;
  getState(path: string): any;
  resetState(newState?: Record<string, any>): void;
  batchUpdate(updates: Array<{ path: string; value: any }>): void;
  subscribe(path: string, callback: (value: any) => void): () => void;
}
```

### Hook: `useStateManager()`

```typescript
interface StateManagerContextType {
  state: Record<string, any>;
  setState: (path: string, value: any) => void;
  getState: (path: string) => any;
  updateState: (path: string, updater: (current: any) => any) => void;
  resetState: (newState?: Record<string, any>) => void;
  subscribe: (path: string, callback: (value: any) => void) => () => void;
}

function useStateManager(): StateManagerContextType;
```

**Usage:**

```typescript
const StateComponent: React.FC = () => {
  const { state, setState, getState } = useStateManager();
  
  const handleUpdate = () => {
    setState('user.name', 'John Doe');
  };
  
  return (
    <div>
      <p>Current user: {getState('user.name')}</p>
      <button onClick={handleUpdate}>Update Name</button>
    </div>
  );
};
```

### Hook: `useStatePath<T>(path: string, defaultValue?: T)`

```typescript
function useStatePath<T = any>(
  path: string,
  defaultValue?: T
): [T, (value: T | ((prev: T) => T)) => void];
```

**Usage:**

```typescript
const UserProfile: React.FC = () => {
  const [user, setUser] = useStatePath('user', { name: '', email: '' });
  
  return (
    <form>
      <input
        value={user.name}
        onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
      />
      <input
        value={user.email}
        onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
      />
    </form>
  );
};
```

### Hook: `usePersistedState<T>(key: string, defaultValue: T, config?: StatePersistenceConfig)`

```typescript
interface StatePersistenceConfig {
  storage?: 'localStorage' | 'sessionStorage' | 'memory';
  syncWithLivewire?: boolean;
  livewirePath?: string;
  debounceMs?: number;
  transformer?: {
    serialize: (data: any) => string;
    deserialize: (data: string) => any;
  };
}

function usePersistedState<T>(
  key: string,
  defaultValue: T,
  config?: Partial<StatePersistenceConfig>
): [T, (value: T | ((prev: T) => T)) => void];
```

**Usage:**

```typescript
const ThemeSelector: React.FC = () => {
  const [theme, setTheme] = usePersistedState('theme', 'light', {
    storage: 'localStorage',
    syncWithLivewire: true,
    livewirePath: 'user.theme'
  });
  
  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
};
```

### Component: `StateManagerProvider`

```typescript
interface StateManagerProviderProps {
  children: React.ReactNode;
  initialState?: Record<string, any>;
  onStateChange?: (state: Record<string, any>) => void;
  syncPath?: string;
}

function StateManagerProvider(props: StateManagerProviderProps): JSX.Element;
```

**Usage:**

```typescript
function App() {
  return (
    <StateManagerProvider
      initialState={{ user: { name: 'Guest' } }}
      onStateChange={(state) => console.log('State changed:', state)}
      syncPath="app.state"
    >
      <MyApp />
    </StateManagerProvider>
  );
}
```

## 🛠️ Developer Tools API

### Interface: `DevToolsAPI`

```typescript
interface DevToolsAPI {
  enable(): void;
  disable(): void;
  clear(): void;
  trackComponentMount(name: string, props: Record<string, any>): void;
  trackComponentRender(name: string, props: Record<string, any>): void;
  trackComponentUnmount(name: string): void;
  trackComponentError(name: string, error: Error): void;
  trackComponentWarning(name: string, warning: string): void;
  trackStateChange(path: string, oldValue: any, newValue: any, source?: string): void;
  recordPerformanceMetric(metric: PerformanceMetrics): void;
  startPerformanceMeasure(name: string): void;
  endPerformanceMeasure(name: string): void;
  getComponentInfo(name?: string): ComponentInfo | ComponentInfo[] | undefined;
  getPerformanceMetrics(componentName?: string): PerformanceMetrics[];
  getStateHistory(path?: string): StateChange[];
  showDebugPanel(): void;
  logComponentInfo(): void;
  logStateInfo(): void;
  logPerformanceInfo(): void;
  subscribe(callback: (event: DevToolsEvent) => void): () => void;
  getMemoryUsage(): number | undefined;
}
```

### Types

```typescript
interface ComponentInfo {
  name: string;
  props: Record<string, any>;
  mountTime: number;
  renderCount: number;
  lastRenderTime: number;
  errors: Error[];
  warnings: string[];
}

interface PerformanceMetrics {
  componentName: string;
  mountTime: number;
  renderTime: number;
  propsChanges: number;
  memoryUsage?: number;
}

interface StateChange {
  path: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
  source: string;
}

interface DevToolsEvent {
  type: string;
  data: any;
}
```

**Usage:**

```typescript
// Enable debug mode
devTools.enable();

// Track component performance
devTools.startPerformanceMeasure('MyComponent');
// ... component rendering
devTools.endPerformanceMeasure('MyComponent');

// Subscribe to events
const unsubscribe = devTools.subscribe((event) => {
  console.log('DevTools event:', event);
});

// Show debug panel
devTools.showDebugPanel(); // or press Ctrl+Shift+W
```

## ⚡ Code Splitting API

### Interface: `CodeSplittingAPI`

```typescript
interface CodeSplittingAPI {
  registerStrategy(strategy: SplitStrategy): void;
  addPrefetchRule(rule: PrefetchRule): void;
  loadComponent(componentName: string, metadata?: any, forceStrategy?: string): Promise<any>;
  preloadComponents(components: string[], priority?: ChunkPriority): void;
  analyzeBundles(): BundleAnalysis;
  clearCache(): void;
  getChunkInfo(componentName?: string): ChunkInfo | ChunkInfo[] | null;
}
```

### Types

```typescript
interface SplitStrategy {
  name: string;
  condition: (componentName: string, metadata?: any) => boolean;
  chunkName: (componentName: string) => string;
  preload?: boolean;
  priority?: ChunkPriority;
}

interface PrefetchRule {
  trigger: string;
  prefetch: string[];
  delay?: number;
  condition?: () => boolean;
}

enum ChunkPriority {
  CRITICAL = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
  BACKGROUND = 5
}

interface ChunkInfo {
  id: string;
  name: string;
  size: number;
  loadTime: number;
  dependencies: string[];
  priority: ChunkPriority;
  lastAccessed: number;
  hitCount: number;
}

interface BundleAnalysis {
  totalChunks: number;
  totalSize: number;
  averageLoadTime: number;
  cacheHitRate: number;
  mostUsedChunks: ChunkInfo[];
  leastUsedChunks: ChunkInfo[];
  recommendations: BundleRecommendation[];
}
```

**Usage:**

```typescript
// Register custom splitting strategy
codeSplittingService.registerStrategy({
  name: 'admin-strategy',
  condition: (name, metadata) => metadata?.category === 'admin',
  chunkName: (name) => `admin-${name.toLowerCase()}`,
  priority: ChunkPriority.MEDIUM
});

// Add prefetch rule
codeSplittingService.addPrefetchRule({
  trigger: 'Dashboard',
  prefetch: ['UserProfile', 'Analytics'],
  delay: 1000
});

// Load component with strategy
const component = await codeSplittingService.loadComponent(
  'AdminPanel',
  { category: 'admin' }
);
```

## 🔄 Component Versioning API

### Interface: `ComponentVersioningAPI`

```typescript
interface ComponentVersioningAPI {
  registerVersion(componentName: string, version: string, component: any, metadata?: Partial<ComponentMetadata>): void;
  getVersion(componentName: string, version?: string): ComponentVersion | null;
  getAllVersions(componentName: string): ComponentVersion[];
  getLatestVersion(componentName: string): ComponentVersion | null;
  hasVersion(componentName: string, version?: string): boolean;
  registerAlias(componentName: string, alias: string, version: string): void;
  deprecateVersion(componentName: string, version: string, message?: string, migrationPath?: string): void;
  addMigration(componentName: string, fromVersion: string, toVersion: string, migrationFn: MigrationFunction): void;
  migrateProps(componentName: string, fromVersion: string, toVersion: string, props: Record<string, any>): Promise<MigrationResult>;
  checkCompatibility(componentName: string, fromVersion: string, toVersion: string): CompatibilityCheck;
  satisfiesConstraint(version: string, constraint: VersionConstraint): boolean;
  findBestVersion(componentName: string, constraint: VersionConstraint): string | null;
  addCompatibilityRule(componentName: string, rule: CompatibilityRule): void;
  getChangelog(componentName: string): ChangelogEntry[];
  getVersionStats(componentName?: string): any;
}
```

### Types

```typescript
interface ComponentVersion {
  version: string;
  component: any;
  metadata: ComponentMetadata;
  deprecated?: boolean;
  deprecationMessage?: string;
  migrationPath?: string;
  breakingChanges?: BreakingChange[];
  dependencies?: ComponentDependency[];
}

interface MigrationResult {
  success: boolean;
  fromVersion: string;
  toVersion: string;
  migratedProps: Record<string, any>;
  warnings: string[];
  errors: string[];
  manualStepsRequired: boolean;
}

interface CompatibilityCheck {
  compatible: boolean;
  issues: CompatibilityIssue[];
  recommendations: string[];
  autoMigrationAvailable: boolean;
}

interface VersionConstraint {
  min?: string;
  max?: string;
  exact?: string;
  exclude?: string[];
}

type MigrationFunction = (
  props: Record<string, any>,
  context: {
    componentName: string;
    fromVersion: string;
    toVersion: string;
  }
) => Promise<{
  props: Record<string, any>;
  warnings?: string[];
  manualStepsRequired?: boolean;
}>;
```

**Usage:**

```typescript
// Register version
componentVersioningService.registerVersion(
  'UserCard',
  '2.0.0',
  UserCardV2,
  {
    description: 'Enhanced user card with dark mode',
    changelog: [{
      version: '2.0.0',
      changes: ['Added dark mode support', 'Improved accessibility']
    }]
  }
);

// Add migration
componentVersioningService.addMigration(
  'UserCard',
  '1.0.0',
  '2.0.0',
  async (props, context) => {
    return {
      props: {
        ...props,
        theme: props.darkMode ? 'dark' : 'light' // Convert old prop
      },
      warnings: ['darkMode prop renamed to theme']
    };
  }
);

// Migrate props
const migrationResult = await componentVersioningService.migrateProps(
  'UserCard',
  '1.0.0',
  '2.0.0',
  { name: 'John', darkMode: true }
);
```

## 🎭 Universal Renderer API

### Interface: `UniversalRendererAPI`

```typescript
interface UniversalRendererAPI {
  mount(componentName: string, containerId: string, props?: Record<string, any>): void | Promise<void>;
  unmount(containerId: string): void;
  unmountAll(): void;
  scanAndMount(container?: Element): void;
  getActiveContainers(): string[];
  isMounted(containerId: string): boolean;
  batchMount(mounts: Array<{ component: string; container: string; props?: Record<string, any> }>): void;
}
```

**Usage:**

```typescript
// Mount single component
universalReactRenderer.mount('UserCard', 'user-container', {
  userId: 123,
  editable: true
});

// Batch mount multiple components
universalReactRenderer.batchMount([
  { component: 'Header', container: 'header' },
  { component: 'Sidebar', container: 'sidebar' },
  { component: 'Footer', container: 'footer' }
]);

// Auto-discover and mount
universalReactRenderer.scanAndMount();

// Check if mounted
if (universalReactRenderer.isMounted('user-container')) {
  console.log('Component is mounted');
}
```

## 🎯 Utility Functions

### `registerComponents(components: IComponentDefinition[]): void`

Bulk register multiple components.

```typescript
registerComponents([
  { name: 'Button', component: Button },
  { name: 'Modal', component: Modal },
  { name: 'Form', component: Form }
]);
```

### `bootstrap(): boolean`

Initialize React Wrapper system.

```typescript
const initialized = bootstrap();
console.log('React Wrapper initialized:', initialized);
```

### `withStateManager<P>(Component: React.ComponentType<P>): React.ComponentType<P>`

HOC to provide state manager to components.

```typescript
const EnhancedComponent = withStateManager(MyComponent);
```

## 🌐 Global Window API

When React Wrapper is loaded, it exposes a global API on the window object:

```typescript
declare global {
  interface Window {
    ReactWrapper: {
      componentRegistry: IComponentRegistry;
      universalReactRenderer: UniversalRendererAPI;
      globalStateManager: IStateManager;
      statePersistenceService: any;
      devTools: DevToolsAPI;
      codeSplittingService: CodeSplittingAPI;
      componentVersioningService: ComponentVersioningAPI;
      bootstrap: () => boolean;
    };
    ReactComponentRegistry: IComponentRegistry; // Shorthand
  }
}
```

**Usage:**

```javascript
// Access from browser console or vanilla JS
window.ReactWrapper.devTools.showDebugPanel();
window.ReactComponentRegistry.register({ name: 'Test', component: TestComponent });
```

---

**Complete TypeScript API for building type-safe React components! 🚀**