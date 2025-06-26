# React Wrapper Package - AI Agent Guide

## Package Overview

The React Wrapper package provides seamless integration between Laravel/Filament and React components with enterprise-level features including lazy loading, state management, and automatic asset optimization.

## Key Architecture Components

### Core Services
- **ReactComponentRegistry**: Manages component registration and discovery
- **AssetManager**: Handles lazy loading, Vite integration, and asset optimization
- **VariableShareService**: Secure data sharing between PHP and React
- **FilamentIntegration**: Direct Filament integration without plugin dependency

### Main Components
- **ReactField**: Filament form field component for React integration
- **ReactWidget**: Filament dashboard widget component

## Quick Integration Examples

### 1. Basic Form Field Integration
```php
use HadyFayed\ReactWrapper\Forms\Components\ReactField;

ReactField::make('content')
    ->component('RichTextEditor')
    ->height(400)
    ->props(['toolbar' => ['bold', 'italic']])
    ->reactive()
    ->validationRules(['required', 'string']);
```

### 2. Dashboard Widget Integration
```php
use HadyFayed\ReactWrapper\Widgets\ReactWidget;

class AnalyticsWidget extends ReactWidget
{
    protected string $componentName = 'AnalyticsChart';
    
    public function getData(): array
    {
        return ['metrics' => $this->calculateMetrics()];
    }
}
```

### 3. Blade Directive Usage
```blade
@react('MyComponent', ['data' => $data], ['lazy' => true])

@reactComponent('UserProfile', $user->toArray())
```

## Component Registration Patterns

### Automatic Discovery
Components in `resources/js/components/` are auto-discovered:
```
resources/js/components/
├── Button.tsx          → 'Button'
├── UserProfile.tsx     → 'UserProfile'
└── forms/
    └── DatePicker.tsx  → 'DatePicker'
```

### Manual Registration
```php
app('react-wrapper.registry')->register('CustomComponent', 'CustomComponent', [
    'lazy' => true,
    'preload' => false,
    'dependencies' => ['moment'],
]);
```

## State Management Patterns

### Variable Sharing (PHP → React)
```php
// Global variables
app('react-wrapper.variables')->shareGlobal('user', auth()->user());

// Component-specific
app('react-wrapper.variables')->shareToComponent('UserDashboard', 'settings', $settings);
```

### Reactive Updates (React → PHP)
```php
ReactField::make('data')
    ->reactive() // Enables real-time updates
    ->afterStateUpdated(fn($state) => $this->processData($state));
```

## Asset Management

### Lazy Loading Configuration
```php
// In component registration
$assetManager->registerComponentAsset('HeavyChart', [
    'js' => 'resources/js/components/HeavyChart.tsx',
    'dependencies' => ['d3', 'chart.js'],
    'lazy' => true,
    'preload' => false,
]);
```

### Performance Optimization
- Components load on intersection (when visible)
- Automatic dependency resolution
- Vite dev server integration
- Production asset bundling

## React-PHP Function Mapping (90.2% Average Integration)

### High Integration Functions (90-100%)
- **Props**: 98% - Use dependency injection and method parameters
- **Authentication**: 97% - Laravel Auth facade integration
- **Form Handling**: 96% - Form Request classes and validation
- **useState**: 95% - Session and cache integration
- **Data Fetching**: 94% - HTTP Client and Eloquent queries

### Implementation Examples
```php
// useState equivalent
session(['react_state' => $data]);

// useEffect equivalent  
Event::listen('model.updated', fn() => dispatch(new ProcessData));

// Form handling
public function store(CreateUserRequest $request) {
    // Automatic validation from React form
}
```

## Error Handling

### Component Error Boundaries
```php
ReactField::make('editor')
    ->component('Editor')
    ->afterStateUpdated(function ($state) {
        try {
            $this->validateContent($state);
        } catch (ValidationException $e) {
            $this->addError('editor', $e->getMessage());
        }
    });
```

### Asset Loading Errors
```javascript
// Automatic error handling in templates
container.addEventListener('react-error', function(event) {
    console.error('Component failed to load:', event.detail);
    // Graceful fallback UI shown automatically
});
```

## Development Commands

### Integration Analysis
```bash
# Generate integration report
php artisan react-wrapper:integration-report --format=table

# Export to markdown
php artisan react-wrapper:integration-report --format=markdown --output=report.md

# Filter by integration percentage
php artisan react-wrapper:integration-report --min-percentage=90
```

### Laravel About Command
```bash
php artisan about
# Shows React Wrapper stats in Laravel's about command
```

## Common Patterns for AI Agents

### 1. Creating Form Fields
```php
// Always use ReactField for forms
ReactField::make('field_name')
    ->component('ReactComponentName')
    ->props($dataArray)
    ->reactive()
    ->validationRules($rules);
```

### 2. Creating Widgets
```php
// Extend ReactWidget for dashboards
class MyWidget extends ReactWidget
{
    protected string $componentName = 'WidgetComponent';
    
    public function getData(): array
    {
        return ['key' => 'value'];
    }
}
```

### 3. Data Sharing Best Practices
```php
// Use variable service for complex data
app('react-wrapper.variables')->shareToComponent(
    'ComponentName',
    'dataKey', 
    $processedData
);
```

### 4. Asset Management
```php
// Register components with proper configuration
app('react-wrapper.assets')->registerComponentAsset('ComponentName', [
    'js' => 'path/to/component.tsx',
    'lazy' => true,
    'dependencies' => ['library1', 'library2'],
]);
```

## Troubleshooting Guide

### Component Not Loading
1. Check component is registered in registry
2. Verify asset path exists
3. Check browser console for JS errors
4. Ensure Vite dev server is running (development)

### State Not Syncing
1. Ensure `reactive()` is called on field
2. Check variable sharing is configured
3. Verify CSRF token is included
4. Check Livewire integration

### Asset Loading Issues
1. Check Vite manifest exists (production)
2. Verify asset paths in configuration
3. Check lazy loading configuration
4. Review browser network requests

## Best Practices for AI Agents

1. **Always use the provided components** - ReactField for forms, ReactWidget for widgets
2. **Enable reactive features** - Use `->reactive()` for real-time updates  
3. **Configure lazy loading** - Use `->lazy()` for performance optimization
4. **Handle validation** - Use `->validationRules()` for form validation
5. **Share data properly** - Use VariableShareService for complex data
6. **Check integration reports** - Use the command to verify React-PHP integration
7. **Follow naming conventions** - Component names should match file names
8. **Use dependency management** - Specify component dependencies correctly

## Integration Statistics

- **Total Functions Mapped**: 18
- **Average Integration**: 90.2%
- **Highly Integrated (90-100%)**: 9 functions
- **Moderately Integrated (70-89%)**: 9 functions
- **Core React Hooks**: Fully supported with Laravel equivalents

This package provides near-complete React functionality within Laravel/Filament with minimal setup and maximum performance.