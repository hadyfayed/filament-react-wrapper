# React Wrapper for Laravel/Filament

[![npm version](https://badge.fury.io/js/@hadyfayed/react-wrapper.svg)](https://badge.fury.io/js/@hadyfayed/react-wrapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Laravel](https://img.shields.io/badge/Laravel-10.0+-red.svg)](https://laravel.com)
[![Filament](https://img.shields.io/badge/Filament-3.0+-orange.svg)](https://filamentphp.com)

A comprehensive React integration system for Laravel and Filament applications, providing seamless component registration, state management, and real-time synchronization with built-in memory leak prevention and infinite loop protection.

## 🚀 Features

- **🔧 Universal Component System** - Register and render React components anywhere in your Laravel app
- **🎯 Advanced State Management** - Built-in state management with persistence and Livewire sync
- **⚡ Performance Optimized** - Lazy loading, memoization, efficient re-rendering, and memory leak prevention
- **🛡️ Type Safe** - Full TypeScript support with comprehensive type definitions
- **🔄 Real-time Sync** - Bidirectional data flow with Livewire components
- **📦 Zero Config** - Works out of the box with sensible defaults
- **🎨 Filament Ready** - Native integration with Filament admin panels
- **🧩 Extensible** - Plugin system with middleware support
- **🔒 Security First** - XSS protection, input validation, and secure prop handling
- **🚫 Loop Protection** - Built-in infinite loop detection and prevention
- **🧠 Memory Safe** - Automatic cleanup and bounded data structures

## 📦 Installation

### NPM Package

```bash
npm install @hadyfayed/react-wrapper
```

### Composer Package

```bash
composer require hadyfayed/react-wrapper
```

### Laravel Setup

1. **Publish the service provider:**

```bash
php artisan vendor:publish --provider="HadyFayed\ReactWrapper\ReactWrapperServiceProvider"
```

2. **Register the Filament plugin:**

```php
// app/Providers/Filament/AdminPanelProvider.php
use HadyFayed\ReactWrapper\FilamentReactWrapperPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            FilamentReactWrapperPlugin::make(),
        ]);
}
```

3. **Add to your `app.js`:**

```javascript
import '@hadyfayed/react-wrapper';
```

4. **Build your assets:**

```bash
npm run build
```

## 🎯 Quick Start

### 1. Register a React Component

```typescript
import { componentRegistry } from '@hadyfayed/react-wrapper';
import MyComponent from './components/MyComponent';

// Simple registration
componentRegistry.register({
  name: 'MyComponent',
  component: MyComponent,
  defaultProps: {
    message: 'Hello World!'
  }
});
```

### 2. Use in Blade Templates

```html
<!-- Basic usage -->
<div data-react-component="MyComponent"></div>

<!-- With props -->
<div 
  data-react-component="MyComponent"
  data-react-props='{"title": "Custom Title", "count": 5}'
></div>

<!-- With state synchronization -->
<div 
  data-react-component="MyComponent"
  data-react-state-path="user.preferences"
  data-react-props='{"userId": {{ $user->id }}}'
></div>
```

### 3. Use in Filament

```php
use HadyFayed\ReactWrapper\Components\ReactComponent;

class EditUser extends EditRecord
{
    protected function getHeaderActions(): array
    {
        return [
            ReactComponent::make('UserProfileEditor')
                ->props([
                    'userId' => $this->record->id,
                    'editable' => true
                ])
                ->statePath('userProfile')
        ];
    }
}
```

## 📚 Component Registration

### Basic Registration

```typescript
import { componentRegistry } from '@hadyfayed/react-wrapper';

componentRegistry.register({
  name: 'UserCard',
  component: UserCard,
  defaultProps: {
    showAvatar: true,
    size: 'medium'
  },
  metadata: {
    category: 'user',
    description: 'Displays user information in a card format',
    tags: ['user', 'display', 'card']
  }
});
```

### Advanced Registration with Lazy Loading

```typescript
componentRegistry.register({
  name: 'HeavyComponent',
  component: () => import('./components/HeavyComponent'),
  isAsync: true,
  config: {
    lazy: true,
    cache: true,
    preload: false
  },
  metadata: {
    category: 'charts',
    description: 'Advanced data visualization component'
  }
});
```

### Bulk Registration

```typescript
import { registerComponents } from '@hadyfayed/react-wrapper';

const components = [
  { name: 'Button', component: Button },
  { name: 'Modal', component: Modal },
  { name: 'Form', component: Form }
];

registerComponents(components);
```

## 🎯 State Management

### Using State Manager Provider

```typescript
import { StateManagerProvider, useStateManager } from '@hadyfayed/react-wrapper';

function App() {
  return (
    <StateManagerProvider
      initialState={{ user: { name: 'John' } }}
      onStateChange={(state) => console.log('State changed:', state)}
      syncPath="app.state"
    >
      <MyComponent />
    </StateManagerProvider>
  );
}

function MyComponent() {
  const { state, setState, getState } = useStateManager();
  
  const updateUser = () => {
    setState('user.name', 'Jane Doe');
  };
  
  return (
    <div>
      <p>User: {getState('user.name')}</p>
      <button onClick={updateUser}>Update Name</button>
    </div>
  );
}
```

### Using State Path Hook

```typescript
import { useStatePath } from '@hadyfayed/react-wrapper';

function UserProfile() {
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
}
```

### Global State Manager

```typescript
import { globalStateManager } from '@hadyfayed/react-wrapper';

// Set global state
globalStateManager.setState('app.theme', 'dark');

// Get global state
const theme = globalStateManager.getState('app.theme');

// Subscribe to changes
const unsubscribe = globalStateManager.subscribe('app.theme', (newTheme) => {
  console.log('Theme changed to:', newTheme);
});

// Clean up
unsubscribe();
```

## 💾 State Persistence

### Using Persisted State Hook

```typescript
import { usePersistedState } from '@hadyfayed/react-wrapper';

function ThemeSelector() {
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
}
```

### Manual Persistence Service

```typescript
import { statePersistenceService } from '@hadyfayed/react-wrapper';

// Register a persistence config
statePersistenceService.register({
  key: 'userPreferences',
  storage: 'localStorage',
  syncWithLivewire: true,
  livewirePath: 'user.preferences',
  debounceMs: 500,
  transformer: {
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data)
  }
});

// Save data
statePersistenceService.save('userPreferences', {
  theme: 'dark',
  language: 'en'
});

// Load data
const preferences = statePersistenceService.load('userPreferences');
```

## 🎨 Filament Integration

### Creating Filament Components

```php
<?php

namespace App\Filament\Components;

use HadyFayed\ReactWrapper\Components\ReactComponent;

class UserDashboard extends ReactComponent
{
    protected string $component = 'UserDashboard';
    
    public static function make(string $component = null): static
    {
        return new static($component ?? static::$component);
    }
    
    public function userId(int $userId): static
    {
        $this->props(['userId' => $userId]);
        return $this;
    }
    
    public function editable(bool $editable = true): static
    {
        $this->props(['editable' => $editable]);
        return $this;
    }
}
```

### Using in Filament Pages

```php
use App\Filament\Components\UserDashboard;

class Dashboard extends Page
{
    protected static string $view = 'filament.pages.dashboard';
    
    protected function getHeaderWidgets(): array
    {
        return [
            UserDashboard::make()
                ->userId(auth()->id())
                ->editable(true)
                ->statePath('dashboard.user')
        ];
    }
}
```

### Form Field Integration

```php
use HadyFayed\ReactWrapper\Forms\Components\ReactField;

class UserForm extends Form
{
    public function form(Form $form): Form
    {
        return $form->schema([
            ReactField::make('profile_editor')
                ->component('UserProfileEditor')
                ->props([
                    'allowImageUpload' => true,
                    'maxImageSize' => '2MB'
                ])
                ->statePath('profile')
                ->reactive()
                ->afterStateUpdated(function ($state) {
                    // Handle state updates
                    $this->user->update($state);
                })
        ]);
    }
}
```

## 🔧 Advanced Features

### Middleware System

```typescript
import { componentRegistry } from '@hadyfayed/react-wrapper';

// Global middleware
componentRegistry.addMiddleware((component, props, context) => {
  // Add analytics tracking
  return (componentProps) => {
    React.useEffect(() => {
      analytics.track('component_rendered', {
        component: context.metadata.name,
        props: Object.keys(componentProps)
      });
    }, []);
    
    return React.createElement(component, componentProps);
  };
});

// Component-specific middleware
componentRegistry.register({
  name: 'SecureComponent',
  component: SecureComponent,
  config: {
    middleware: [
      (component, props, context) => {
        // Add authentication check
        return (componentProps) => {
          if (!componentProps.user?.authenticated) {
            return React.createElement('div', null, 'Access Denied');
          }
          return React.createElement(component, componentProps);
        };
      }
    ]
  }
});
```

### Error Handling

All components are automatically wrapped with error boundaries that provide:

- Graceful error display
- Error reporting to console
- Retry functionality
- Custom error handlers

```typescript
componentRegistry.register({
  name: 'RiskyComponent',
  component: RiskyComponent,
  config: {
    onError: (error, componentName) => {
      // Custom error handling
      console.error(`Error in ${componentName}:`, error);
      // Report to error tracking service
      errorTracker.report(error, { component: componentName });
    }
  }
});
```

## 🚀 Performance & Memory Safety

### Memory Leak Prevention

The system includes comprehensive protection against memory leaks:

```typescript
// Automatic cleanup on component unmount
React.useEffect(() => {
  const unsubscribe = globalStateManager.subscribe('user.data', handleUserChange);
  
  return () => {
    unsubscribe(); // Automatic cleanup
  };
}, []);

// Bounded data structures prevent unlimited growth
// Maximum 1000 entries in persistence service with automatic cleanup
```

### Infinite Loop Protection

Built-in protection against infinite loops in state updates:

```typescript
// Circular notification detection
if (this._notifyingPaths.has(path)) {
  console.warn(`Circular notification detected for path: ${path}`);
  return; // Prevents infinite loops
}
```

### Performance Optimizations

- **Memoization** - Automatic memoization of components and state
- **Debouncing** - Built-in debouncing for state changes and notifications
- **Lazy Loading** - Code splitting for large components
- **Efficient Re-rendering** - Smart prop comparison and update batching

## 🔒 Security Features

### Input Validation

```typescript
// Validate props before rendering
componentRegistry.register({
  name: 'SecureComponent',
  component: SecureComponent,
  config: {
    middleware: [
      (component, props, context) => {
        return (componentProps) => {
          // Validate props
          const validatedProps = validateProps(componentProps, {
            userId: 'number',
            email: 'email',
            role: ['admin', 'user', 'guest']
          });
          
          return React.createElement(component, validatedProps);
        };
      }
    ]
  }
});
```

### XSS Prevention

```typescript
// Sanitize HTML content
import DOMPurify from 'dompurify';

const SafeComponent = ({ htmlContent }) => {
  const sanitizedHTML = DOMPurify.sanitize(htmlContent);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
};
```

## 🛠️ API Reference

### Component Registry

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
  on(event: string, callback: Function, priority?: number): void;
  off(event: string, callback: Function): void;
}
```

### State Manager

```typescript
interface IStateManager {
  setState(path: string, value: any): void;
  updateState(path: string, updater: (current: any) => any): void;
  getState(path: string): any;
  resetState(newState?: StateManagerState): void;
  batchUpdate(updates: Array<{ path: string; value: any }>): void;
  subscribe(path: string, callback: (value: any) => void): () => void;
}
```

### Hooks

```typescript
// State Manager Hook
const useStateManager = (): StateManagerContextType => { ... };

// State Path Hook
const useStatePath = <T = any>(
  path: string,
  defaultValue?: T
): [T, (value: T | ((prev: T) => T)) => void] => { ... };

// Persisted State Hook
const usePersistedState = <T>(
  key: string,
  defaultValue: T,
  config?: Partial<StatePersistenceConfig>
): [T, (value: T | ((prev: T) => T)) => void] => { ... };
```

## 🐛 Debugging & Troubleshooting

### Enable Debug Mode

```typescript
// Enable debug logging
window.ReactWrapperConfig = {
  debug: true,
  logLevel: 'verbose'
};
```

### Common Issues

#### Component Not Found

```typescript
// Check if component is registered
if (!componentRegistry.has('MyComponent')) {
  console.log('Available components:', componentRegistry.getComponentNames());
}

// Check component statistics
console.log('Registry stats:', componentRegistry.getStats());
```

#### State Not Syncing

```typescript
// Check Livewire connection
if (!window.workflowDataSync) {
  console.warn('Livewire sync not available');
}

// Monitor state changes
globalStateManager.subscribe('', (state) => {
  console.log('Global state changed:', state);
});
```

#### Memory Leaks

```typescript
// Monitor subscription counts
console.log('Active subscriptions:', globalStateManager.subscribers.size);

// Monitor active components
console.log('Active components:', universalReactRenderer.getActiveContainers());
```

## 📊 Testing

### Unit Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import { componentRegistry } from '@hadyfayed/react-wrapper';
import MyComponent from './MyComponent';

describe('Component Registry', () => {
  beforeEach(() => {
    componentRegistry.clear();
  });

  test('registers and creates component', () => {
    componentRegistry.register({
      name: 'TestComponent',
      component: MyComponent
    });

    expect(componentRegistry.has('TestComponent')).toBe(true);
    
    const Component = componentRegistry.create('TestComponent', { title: 'Test' });
    expect(Component).toBeDefined();
  });
});
```

### Integration Testing

```typescript
import { StateManagerProvider, useStatePath } from '@hadyfayed/react-wrapper';

const TestComponent = () => {
  const [value, setValue] = useStatePath('test.value', 'initial');
  return (
    <div>
      <span data-testid="value">{value}</span>
      <button onClick={() => setValue('updated')}>Update</button>
    </div>
  );
};

test('state management works', () => {
  render(
    <StateManagerProvider>
      <TestComponent />
    </StateManagerProvider>
  );
  
  expect(screen.getByTestId('value')).toHaveTextContent('initial');
  
  fireEvent.click(screen.getByText('Update'));
  expect(screen.getByTestId('value')).toHaveTextContent('updated');
});
```

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Laravel asset compilation
php artisan filament:assets
```

### Environment Configuration

```php
// config/react-wrapper.php
return [
    'debug' => env('REACT_WRAPPER_DEBUG', false),
    'cache_components' => env('REACT_WRAPPER_CACHE', true),
    'preload_components' => env('REACT_WRAPPER_PRELOAD', false),
    'max_state_size' => env('REACT_WRAPPER_MAX_STATE_SIZE', 1000),
    'memory_safety' => [
        'max_subscriptions_per_path' => 100,
        'cleanup_interval' => 300000, // 5 minutes
        'enable_loop_detection' => true,
    ],
];
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/hadyfayed/react-wrapper.git

# Install dependencies
npm install
composer install

# Run tests
npm test
php artisan test

# Start development server
npm run dev
php artisan serve
```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
npm run lint
npm run format
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the Laravel and React communities
- Inspired by modern component architecture patterns
- Special thanks to all contributors and maintainers

## 📞 Support

- 📚 [Documentation](https://docs.hadyfayed.com/react-wrapper)
- 💬 [Discussions](https://github.com/hadyfayed/react-wrapper/discussions)
- 🐛 [Issue Tracker](https://github.com/hadyfayed/react-wrapper/issues)
- 📧 [Email Support](mailto:support@hadyfayed.com)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://hadyfayed.com">Hady Fayed</a></p>
  <p>
    <a href="https://github.com/hadyfayed/react-wrapper/stargazers">⭐ Star us on GitHub</a> •
    <a href="https://twitter.com/hadyfayed">🐦 Follow on Twitter</a> •
    <a href="https://hadyfayed.com/blog">📝 Read our Blog</a>
  </p>
</div>