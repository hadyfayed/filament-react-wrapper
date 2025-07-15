# PHP/Laravel API Reference

Complete reference for all PHP classes, interfaces, and Laravel integration points in the React Wrapper package.

## Table of Contents

- [Services](#services)
  - [ReactComponentRegistry](#reactcomponentregistry)
  - [AssetManager](#assetmanager)
  - [VariableShareService](#variableshareservice)
  - [FilamentIntegration](#filamentintegration)
- [Form Components](#form-components)
  - [ReactField](#reactfield)
- [Widgets](#widgets)
  - [ReactWidget](#reactwidget)
- [Factories](#factories)
  - [ReactComponentFactory](#reactcomponentfactory)
- [Configuration](#configuration)
- [Artisan Commands](#artisan-commands)
- [Events](#events)
- [Middleware](#middleware)

---

## Services

### ReactComponentRegistry

The core service for managing React component registration and retrieval.

#### Methods

##### `register(string $name, string $component, array $config = []): void`

Register a React component with the registry.

```php
use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;

$registry = app(ReactComponentRegistry::class);

$registry->register('UserCard', 'UserCard', [
    'default_props' => ['showAvatar' => true],
    'lazy' => true,
    'dependencies' => ['UserService'],
    'filament_specific' => false
]);
```

**Parameters:**
- `$name` (string): Unique component name
- `$component` (string): Component class or identifier
- `$config` (array): Component configuration options

**Configuration Options:**
- `default_props` (array): Default props for the component
- `lazy` (bool): Whether to lazy load the component
- `dependencies` (array): Component dependencies
- `filament_specific` (bool): Mark as Filament-specific component
- `preload` (bool): Preload component assets
- `version` (string): Component version

##### `get(string $name): ?array`

Retrieve component configuration by name.

```php
$component = $registry->get('UserCard');
if ($component) {
    $config = $component['config'];
    $className = $component['class'];
}
```

##### `has(string $name): bool`

Check if a component is registered.

```php
if ($registry->has('UserCard')) {
    // Component exists
}
```

##### `all(): array`

Get all registered components.

```php
$allComponents = $registry->all();
foreach ($allComponents as $name => $config) {
    // Process each component
}
```

##### `unregister(string $name): void`

Remove a component from the registry.

```php
$registry->unregister('UserCard');
```

##### `count(): int`

Get total number of registered components.

```php
$totalComponents = $registry->count();
```

---

### AssetManager

Manages component assets, lazy loading, and build integration.

#### Methods

##### `registerComponentAsset(string $component, array $config): void`

Register assets for a component.

```php
use HadyFayed\ReactWrapper\Services\AssetManager;

$assetManager = app(AssetManager::class);

$assetManager->registerComponentAsset('UserCard', [
    'js' => 'resources/js/components/UserCard.tsx',
    'css' => 'resources/css/components/UserCard.css',
    'dependencies' => ['react', 'react-dom'],
    'lazy' => true,
    'preload' => false
]);
```

##### `queueComponent(string $component): void`

Queue a component for loading.

```php
$assetManager->queueComponent('UserCard');
```

##### `getPendingAssets(): array`

Get all pending assets to be loaded.

```php
$pendingAssets = $assetManager->getPendingAssets();
```

##### `generateLazyLoadScript(array $components): string`

Generate JavaScript for lazy loading components.

```php
$script = $assetManager->generateLazyLoadScript(['UserCard', 'DataTable']);
```

##### `generatePreloadTags(array $components): array`

Generate HTML preload tags for components.

```php
$preloadTags = $assetManager->generatePreloadTags(['UserCard']);
```

##### `isViteDevServerRunning(): bool`

Check if Vite development server is running.

```php
if ($assetManager->isViteDevServerRunning()) {
    // Development mode
}
```

---

### VariableShareService

Service for sharing data between PHP backend and React frontend.

#### Methods

##### `shareGlobal(string $key, mixed $value): void`

Share a variable globally to all React components.

```php
use HadyFayed\ReactWrapper\Services\VariableShareService;

$variableShare = app(VariableShareService::class);

$variableShare->shareGlobal('app_config', [
    'app_name' => config('app.name'),
    'timezone' => config('app.timezone'),
    'locale' => app()->getLocale()
]);
```

##### `shareToComponent(string $component, string $key, mixed $value): void`

Share a variable to a specific component.

```php
$variableShare->shareToComponent('UserCard', 'user_data', [
    'id' => $user->id,
    'name' => $user->name,
    'avatar' => $user->avatar_url
]);
```

##### `shareCommonData(): void`

Automatically share common Laravel data.

```php
// Shares: auth user, CSRF token, app config, flash messages
$variableShare->shareCommonData();
```

##### `shareLivewireData(): void`

Share Livewire component data.

```php
$variableShare->shareLivewireData();
```

##### `generateJavaScriptInjection(string $component = null): string`

Generate JavaScript injection code.

```php
// For all components
$script = $variableShare->generateJavaScriptInjection();

// For specific component
$script = $variableShare->generateJavaScriptInjection('UserCard');
```

##### `generateDataAttributes(string $component): string`

Generate HTML data attributes for component data.

```php
$attributes = $variableShare->generateDataAttributes('UserCard');
// Returns: data-react-shared='{"key":"value"}'
```

---

### FilamentIntegration

Service for Filament panel integration.

#### Methods

##### `initialize(): void`

Initialize Filament integration.

```php
use HadyFayed\ReactWrapper\Integrations\FilamentIntegration;

$filamentIntegration = app(FilamentIntegration::class);
$filamentIntegration->initialize();
```

##### `isFilamentAvailable(): bool`

Check if Filament is available.

```php
if ($filamentIntegration->isFilamentAvailable()) {
    // Filament is available
}
```

##### `getCurrentPanel(): ?\Filament\Panel`

Get the current Filament panel.

```php
$panel = $filamentIntegration->getCurrentPanel();
if ($panel) {
    $panelId = $panel->getId();
}
```

##### `getIntegrationStats(): array`

Get integration statistics.

```php
$stats = $filamentIntegration->getIntegrationStats();
// Returns: available, initialized, panel, components_registered, assets_pending
```

---

## Form Components

### ReactField

Filament form field component for embedding React components.

#### Usage

```php
use HadyFayed\ReactWrapper\Forms\Components\ReactField;

ReactField::make('editor')
    ->component('CodeEditor')
    ->props([
        'language' => 'php',
        'theme' => 'dark'
    ])
    ->height(400)
    ->resizable()
    ->reactive()
    ->validationRules(['required', 'min:10']);
```

#### Methods

##### `component(string $componentName): static`

Set the React component to render.

```php
ReactField::make('content')->component('RichTextEditor');
```

##### `props(array $props): static`

Set component props.

```php
ReactField::make('editor')->props([
    'language' => 'javascript',
    'readOnly' => false
]);
```

##### `height(int $height): static`

Set component height in pixels.

```php
ReactField::make('editor')->height(600);
```

##### `resizable(bool $resizable = true): static`

Make the field resizable.

```php
ReactField::make('editor')->resizable();
```

##### `fullscreen(bool $fullscreen = true): static`

Enable fullscreen mode.

```php
ReactField::make('editor')->fullscreen();
```

##### `reactive(bool $reactive = true): static`

Enable reactive updates.

```php
ReactField::make('editor')->reactive();
```

##### `lazy(bool $lazy = true): static`

Enable lazy loading.

```php
ReactField::make('editor')->lazy(false); // Disable lazy loading
```

##### `validationRules(array $rules): static`

Set validation rules.

```php
ReactField::make('content')->validationRules([
    'required',
    'min:10',
    'max:1000'
]);
```

##### `dependencies(array $dependencies): static`

Set component dependencies.

```php
ReactField::make('chart')->dependencies(['chart.js', 'd3']);
```

---

## Widgets

### ReactWidget

Filament widget for embedding React components in dashboards.

#### Usage

```php
use HadyFayed\ReactWrapper\Widgets\ReactWidget;

class UserStatsWidget extends ReactWidget
{
    public static function component(string $componentName): static
    {
        return parent::component('UserStatsChart');
    }
    
    public function getData(): array
    {
        return [
            'total_users' => User::count(),
            'active_users' => User::whereNotNull('last_seen_at')->count()
        ];
    }
}
```

#### Methods

##### `component(string $componentName): static`

Set the React component for the widget.

```php
$widget = ReactWidget::component('DashboardChart');
```

##### `props(array $props): static`

Set widget props.

```php
$widget->props(['chartType' => 'line', 'animated' => true]);
```

##### `height(int $height): static`

Set widget height.

```php
$widget->height(400);
```

##### `polling(bool|int|string $interval = true): static`

Enable polling for real-time updates.

```php
$widget->polling('5s'); // Poll every 5 seconds
$widget->polling(30);   // Poll every 30 seconds
$widget->polling(true); // Use default interval
```

##### `reactive(bool $reactive = true): static`

Enable reactive updates.

```php
$widget->reactive();
```

##### `theme(string $theme): static`

Set widget theme.

```php
$widget->theme('dark');
```

---

## Factories

### ReactComponentFactory

Factory for creating React component instances.

#### Usage

```php
use HadyFayed\ReactWrapper\Factories\ReactComponentFactory;

$factory = app(ReactComponentFactory::class);
$component = $factory->create('UserCard', ['userId' => 123]);
```

#### Methods

##### `create(string $name, array $props = []): mixed`

Create a component instance.

```php
$userCard = $factory->create('UserCard', [
    'userId' => $user->id,
    'showActions' => true
]);
```

---

## Configuration

### Configuration File Structure

The package configuration is defined in `config/react-wrapper.php`:

```php
return [
    'integrations' => [
        'filament' => [
            'enabled' => true,
        ],
        'livewire' => [
            'enabled' => true,
        ],
    ],
    
    'registry' => [
        'auto_discovery' => [
            'enabled' => true,
            'paths' => ['resources/js/components'],
            'patterns' => ['*.tsx', '*.jsx'],
        ],
        'cache' => [
            'enabled' => true,
            'ttl' => 3600,
        ],
    ],
    
    'assets' => [
        'vite' => [
            'dev_server' => 'http://localhost:5173',
            'build_path' => 'dist',
        ],
        'lazy_loading' => [
            'enabled' => true,
            'chunk_size' => 50,
        ],
    ],
    
    'state_management' => [
        'persistence' => [
            'default_storage' => 'localStorage',
            'debounce_ms' => 300,
        ],
        'livewire_sync' => true,
    ],
    
    'security' => [
        'sanitize_props' => true,
        'allowed_html_tags' => ['b', 'i', 'em', 'strong'],
        'filter_sensitive_keys' => [
            'password', 'token', 'secret', 'key', 'api_key'
        ],
    ],
];
```

---

## Artisan Commands

### `react-wrapper:integration-report`

Generate a comprehensive integration report.

```bash
php artisan react-wrapper:integration-report
```

**Output includes:**
- Package version and status
- Component registry statistics
- Asset management status
- Integration health checks
- Performance metrics
- Configuration validation

**Options:**
- `--format=json` - Output in JSON format
- `--verbose` - Include detailed component information

**Example:**
```bash
php artisan react-wrapper:integration-report --format=json
```

---

## Events

The package dispatches several events during operation:

### Component Lifecycle Events

#### `react-wrapper.component.registering`

Fired before a component is registered.

```php
Event::listen('react-wrapper.component.registering', function ($name, $component, $config) {
    logger()->info("Registering React component: {$name}");
});
```

#### `react-wrapper.component.registered`

Fired after a component is successfully registered.

```php
Event::listen('react-wrapper.component.registered', function ($name, $component, $config) {
    logger()->debug("React component registered: {$name}");
});
```

### Extension Events

#### `react-wrapper.extension.registered`

Fired when an extension is registered.

```php
Event::listen('react-wrapper.extension.registered', function ($extension) {
    logger()->info("React extension registered: {$extension->getName()}");
});
```

### Integration Events

#### `react-wrapper.filament.initialized`

Fired when Filament integration is initialized.

```php
Event::listen('react-wrapper.filament.initialized', function () {
    // Integration ready
});
```

#### `react-wrapper.filament.integrated`

Fired when Filament integration is complete.

```php
Event::listen('react-wrapper.filament.integrated', function () {
    // Filament fully integrated
});
```

---

## Middleware

### ReactWrapperMiddleware

Middleware for handling React Wrapper specific requests.

#### Registration

The middleware is automatically registered by the service provider. To use it manually:

```php
// In routes/web.php
Route::middleware(['react-wrapper'])->group(function () {
    // Your routes here
});
```

#### Features

- Asset injection for React components
- State synchronization handling
- Error boundary setup
- Performance monitoring

---

## Service Provider

### ReactWrapperServiceProvider

The main service provider that bootstraps the package.

#### Key Methods

##### `register()`

Registers all core services:
- `ReactComponentRegistry`
- `AssetManager`
- `VariableShareService`
- `FilamentIntegration`
- `ReactComponentFactory`

##### `boot()`

Initializes the package:
- Publishes assets and configuration
- Registers Blade components
- Boots extensions
- Initializes Filament integration
- Discovers components
- Registers console commands

#### Service Aliases

The following service aliases are available:

```php
app('react-wrapper.registry')    // ReactComponentRegistry
app('react-wrapper.assets')      // AssetManager
app('react-wrapper.variables')   // VariableShareService
app('react-wrapper.filament')    // FilamentIntegration
app('react-wrapper.factory')     // ReactComponentFactory
```

---

## Laravel About Command Integration

The package integrates with Laravel's `about` command to provide system information:

```bash
php artisan about
```

**React Wrapper section includes:**
- Package version
- Components registered count
- Bootstrap published status
- Prebuilt assets availability
- Filament integration status
- Auto discovery status
- Vite dev server status
- Cache enabled status
- Integration statistics

---

## Error Handling

### Exception Classes

#### `ComponentNotFoundException`

Thrown when trying to access a non-existent component.

```php
use HadyFayed\ReactWrapper\Exceptions\ComponentNotFoundException;

try {
    $registry->get('NonExistentComponent');
} catch (ComponentNotFoundException $e) {
    // Handle missing component
}
```

#### `InvalidConfigurationException`

Thrown when configuration is invalid.

```php
use HadyFayed\ReactWrapper\Exceptions\InvalidConfigurationException;

try {
    $registry->register('', 'Component', []); // Empty name
} catch (InvalidConfigurationException $e) {
    // Handle invalid configuration
}
```

---

## Performance Considerations

### Memory Management

The package includes several memory management features:

1. **Bounded Data Structures**: Automatic cleanup to prevent memory leaks
2. **Subscription Management**: Automatic cleanup of event listeners
3. **Component Lazy Loading**: On-demand component loading
4. **Asset Optimization**: Automatic asset bundling and minification

### Caching

- **Component Registry Caching**: Cached component configurations
- **Asset Manifest Caching**: Cached asset manifests for production
- **State Persistence**: Configurable state caching strategies

### Monitoring

Use the integration report command to monitor performance:

```bash
php artisan react-wrapper:integration-report --verbose
```

---

This completes the PHP/Laravel API reference for the React Wrapper package. For frontend TypeScript APIs, see [TypeScript API Reference](typescript.md).