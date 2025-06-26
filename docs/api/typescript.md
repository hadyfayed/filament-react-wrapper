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
  getStats(): {
    totalComponents: number;
    categoryCounts: Record<string, number>;
    tagCounts: Record<string, number>;
  };
  mount(componentName: string, containerId: string, props?: Record<string, any>): void;
  unmount(containerId: string): void;
}
```

### Interface: `IComponentDefinition`

```typescript
interface IComponentDefinition {
  name: string;
  component: React.ComponentType<any> | (() => Promise<{ default: React.ComponentType<any> }>);
  isAsync?: boolean;
  defaultProps?: Record<string, any>;
  propTypes?: Record<string, any>;
  config?: IComponentConfig;
  metadata?: IComponentMetadata;
}
```

### Interface: `IComponentConfig`

```typescript
interface IComponentConfig {
  lazy?: boolean;
  cache?: boolean;
  ssr?: boolean;
  preload?: boolean;
  wrapper?: string | React.ComponentType<any>;
  middleware?: Array<IComponentMiddleware>;
  dependencies?: string[];
  version?: string;
}
```

### Interface: `IComponentMetadata`

```typescript
interface IComponentMetadata {
  description?: string;
  category?: string;
  tags?: string[];
  author?: string;
  docs?: string;
  examples?: Array<{
    name: string;
    props: Record<string, any>;
    description?: string;
  }>;
}
```

### Type: `IComponentMiddleware`

```typescript
type IComponentMiddleware = (
  component: React.ComponentType<any>,
  props: Record<string, any>,
  context: IComponentContext,
) => React.ComponentType<any> | Promise<React.ComponentType<any>>;

interface IComponentContext {
  registry: IComponentRegistry;
  hooks: IHookManager;
  config: IComponentConfig;
  metadata: IComponentMetadata;
}

interface IHookManager {
  addHook(event: string, callback: Function, priority?: number): void;
  removeHook(event: string, callback: Function): void;
  executeHooks(event: string, data?: any): any;
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

### Interface: `IDevTools`

```typescript
interface IDevTools {
  enable(): void;
  disable(): void;
  isEnabled(): boolean;
  log(message: string, data?: unknown): void;
}
```

**Usage:**

```typescript
// Enable debug mode
devTools.enable();

// Check if enabled
if (devTools.isEnabled()) {
  devTools.log('Component rendered', { componentName: 'MyComponent' });
}

// Disable debug mode
devTools.disable();
```

## ⚡ Code Splitting API

### Interface: `ICodeSplittingService`

```typescript
interface ICodeSplittingService {
  loadComponent(name: string): Promise<React.ComponentType<Record<string, unknown>>>;
  preloadComponent(name: string): Promise<void>;
  isLoaded(name: string): boolean;
}
```

**Usage:**

```typescript
// Load component dynamically
const component = await codeSplittingService.loadComponent('AdminPanel');

// Preload component for faster access
await codeSplittingService.preloadComponent('UserProfile');

// Check if component is loaded
if (codeSplittingService.isLoaded('Dashboard')) {
  console.log('Dashboard is ready');
}
```

## 🔄 Component Versioning API

### Interface: `IVersioningService`

```typescript
interface IVersioningService {
  getVersion(componentName: string): string | undefined;
  setVersion(componentName: string, version: string): void;
  isCompatible(componentName: string, requiredVersion: string): boolean;
}
```

**Usage:**

```typescript
// Set component version
componentVersioningService.setVersion('UserCard', '2.1.0');

// Get component version
const version = componentVersioningService.getVersion('UserCard');
console.log('UserCard version:', version);

// Check compatibility
const isCompatible = componentVersioningService.isCompatible('UserCard', '2.0.0');
if (!isCompatible) {
  console.warn('UserCard version incompatible with required version');
}
```

## 🎭 Universal Renderer API

### Interface: `IUniversalRenderer`

```typescript
interface IUniversalRenderer {
  render(options: {
    component: string;
    props?: Record<string, unknown>;
    statePath?: string;
    containerId: string;
    onDataChange?: (data: unknown) => void;
    onError?: (error: Error) => void;
  }): void;
  unmount(containerId: string): void;
  isRendered(containerId: string): boolean;
}
```

**Usage:**

```typescript
// Render single component
universalReactRenderer.render({
  component: 'UserCard',
  containerId: 'user-container',
  props: {
    userId: 123,
    editable: true
  },
  statePath: 'user.profile',
  onDataChange: (data) => console.log('Data changed:', data),
  onError: (error) => console.error('Render error:', error)
});

// Check if rendered
if (universalReactRenderer.isRendered('user-container')) {
  console.log('Component is rendered');
}

// Unmount component
universalReactRenderer.unmount('user-container');
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

## 🐘 PHP/Laravel API

### ReactComponentRegistry Service

```php
<?php

namespace HadyFayed\ReactWrapper\Services;

interface ReactRegistryInterface
{
    public function register(string $name, string $component, array $config = []): void;
    public function get(string $name): ?array;
    public function has(string $name): bool;
    public function all(): array;
    public function count(): int;
    public function unregister(string $name): void;
    public function registerMany(array $components): void;
    public function addHook(string $event, callable $callback, int $priority = 10): void;
    public function executeHooks(string $event, mixed $data = null): mixed;
    public function registerExtension(string $name, array $config): void;
}
```

**Usage:**

```php
<?php

use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;

$registry = app(ReactComponentRegistry::class);

// Register a component
$registry->register('UserCard', 'UserCard', [
    'lazy' => true,
    'cache' => true,
    'props' => ['showAvatar' => true],
    'defaultProps' => ['theme' => 'light']
]);

// Register multiple components
$registry->registerMany([
    'ProductCard' => [
        'component' => 'ProductCard',
        'config' => ['lazy' => false]
    ],
    'OrderSummary' => [
        'component' => 'OrderSummary',
        'config' => ['cache' => true]
    ]
]);

// Check if component exists
if ($registry->has('UserCard')) {
    $component = $registry->get('UserCard');
}

// Get all registered components
$allComponents = $registry->all();
$componentCount = $registry->count();
```

### ReactField Form Component

```php
<?php

use HadyFayed\ReactWrapper\Forms\Components\ReactField;

// Basic usage
ReactField::make('user_profile')
    ->component('UserProfileEditor')
    ->props(['allowImageUpload' => true])
    ->height(400)
    ->reactive()
    ->lazy();

// Advanced configuration
ReactField::make('workflow_canvas')
    ->component('WorkflowCanvas')
    ->props([
        'nodes' => $this->getNodes(),
        'connections' => $this->getConnections()
    ])
    ->height(600)
    ->resizable()
    ->fullscreen()
    ->toolbar(['save', 'export', 'import'])
    ->dependencies(['WorkflowNode', 'WorkflowConnection'])
    ->validationRules(['required', 'array'])
    ->reactive(false) // Disable real-time updates for performance
    ->afterStateUpdated(function ($state) {
        // Handle state changes
        $this->saveWorkflow($state);
    });
```

### ReactWidget

```php
<?php

use HadyFayed\ReactWrapper\Widgets\ReactWidget;

class AnalyticsWidget extends ReactWidget
{
    protected string $componentName = 'AnalyticsChart';
    
    public function component(string $componentName): static
    {
        return static::make()->component($componentName);
    }
    
    public function getData(): array
    {
        return [
            'metrics' => $this->getMetrics(),
            'timeRange' => $this->getTimeRange(),
            'filters' => $this->getFilters()
        ];
    }
    
    protected function getMetrics(): array
    {
        // Return your metrics data
        return [
            'visitors' => 12543,
            'pageViews' => 45678,
            'bounceRate' => 0.34
        ];
    }
}

// Usage
AnalyticsWidget::make()
    ->component('DashboardChart')
    ->props(['type' => 'line'])
    ->height(400)
    ->polling(30) // Poll every 30 seconds
    ->reactive()
    ->theme('dark')
    ->filters(['dateRange', 'userType']);
```

### AssetManager Service

```php
<?php

use HadyFayed\ReactWrapper\Services\AssetManager;

$assetManager = app(AssetManager::class);

// Check if Vite dev server is running
if ($assetManager->isViteDevServerRunning()) {
    // Development mode
    $scriptUrl = $assetManager->getAssetUrl('resources/js/app.tsx');
} else {
    // Production mode
    $manifest = $assetManager->getViteManifest();
}

// Register component assets
$assetManager->registerComponentAsset('UserCard', [
    'js' => 'resources/js/components/UserCard.tsx',
    'css' => 'resources/css/components/user-card.css',
    'dependencies' => ['Button', 'Avatar'],
    'lazy' => true,
    'preload' => false
]);

// Generate lazy loading script
$components = ['UserCard', 'ProductList', 'OrderForm'];
$lazyLoadScript = $assetManager->generateLazyLoadScript($components);

// Preload critical components
$preloadTags = $assetManager->generatePreloadTags(['Header', 'Navigation']);
```

### VariableShareService

```php
<?php

use HadyFayed\ReactWrapper\Services\VariableShareService;

$variableShare = app(VariableShareService::class);

// Share data to all components
$variableShare->share('user', auth()->user());
$variableShare->share('config', config('app'));

// Share data to specific component
$variableShare->shareToComponent('UserCard', 'profile', [
    'avatar' => $user->avatar,
    'preferences' => $user->preferences
]);

// Share Livewire data
$variableShare->shareLivewireData();

// Get shared data
$userData = $variableShare->get('user');
$allShared = $variableShare->all();
```

### Service Provider Configuration

```php
<?php

// config/react-wrapper.php
return [
    'debug' => env('REACT_WRAPPER_DEBUG', false),
    'cache_components' => env('REACT_WRAPPER_CACHE', true),
    'preload_components' => env('REACT_WRAPPER_PRELOAD', false),
    
    'vite' => [
        'dev_server_url' => env('VITE_DEV_SERVER_URL', 'http://localhost:5173'),
        'manifest_paths' => [
            'build/.vite/manifest.json',
            'build/manifest.json',
        ],
        'auto_detect_dev_server' => true,
    ],
    
    'assets' => [
        'base_url' => '/build',
        'preload' => [
            'components' => true,
            'critical_css' => true,
        ],
    ],
    
    'registry' => [
        'auto_discovery' => [
            'enabled' => true,
            'paths' => [
                'resources/js/components',
                'resources/js/widgets'
            ],
            'patterns' => ['*.tsx', '*.jsx']
        ],
        'cache' => [
            'enabled' => true,
            'ttl' => 3600,
        ],
    ],
    
    'integrations' => [
        'filament' => [
            'enabled' => true,
            'auto_register_fields' => true,
            'auto_register_widgets' => true,
        ],
        'livewire' => [
            'enabled' => true,
            'sync_state' => true,
        ],
    ],
];
```

### Artisan Commands

```bash
# Create a new React component with registration
php artisan make:react-component UserDashboard --register

# Register an existing component
php artisan react:register ProductCard --path=resources/js/components/ProductCard.tsx

# Scan and register components from directory
php artisan react:scan resources/js/components --register

# List all registered components
php artisan react:list

# Show integration report
php artisan react-wrapper:integration-report

# Clear component registry cache
php artisan react:clear

# Generate component registration file
php artisan react:export --output=bootstrap-components.php
```

### Event Listeners

```php
<?php

use Illuminate\Support\Facades\Event;
use HadyFayed\ReactWrapper\Events\ComponentRegistered;

// Listen for component registration
Event::listen('react-wrapper.component.registered', function ($name, $component, $config) {
    logger()->info("Component registered: {$name}");
});

// Listen for Filament integration
Event::listen('react-wrapper.filament.integrated', function () {
    logger()->info('Filament integration completed');
});

// Listen for component discovery
Event::listen('react-wrapper.components.discovered', function ($path, $count) {
    logger()->info("Discovered {$count} components in {$path}");
});
```

---

**Complete TypeScript and PHP API for building type-safe React components! 🚀**