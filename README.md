# Filament React Wrapper

Universal React component integration system for Filament applications with TypeScript support.

## Installation

### Option 1: Using as Distributed Packages (Recommended)

```bash
composer require hadyfayed/filament-react-wrapper
npm install @hadyfayed/filament-react-wrapper
```

### Option 2: Using as Local Development Packages

```bash
# Copy package files to your resources directory
cp -r packages/react-wrapper/resources/js/* resources/js/react-wrapper/
```

## Quick Start

### 1. Publish Configuration (Optional)

```bash
php artisan vendor:publish --tag=react-wrapper-config
```

### 2. Register the Plugin

```php
// app/Providers/Filament/AdminPanelProvider.php
use HadyFayed\ReactWrapper\FilamentReactWrapperPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        // ... other configuration
        ->plugins([
            FilamentReactWrapperPlugin::make(),
        ]);
}
```

### 3. Create React Components

```tsx
// resources/js/components/MyComponent.tsx
import React from 'react';

interface Props {
    message: string;
}

export default function MyComponent({ message }: Props) {
    return <div>Hello, {message}!</div>;
}
```

### 4. Register Components

For distributed packages:
```tsx
// resources/js/bootstrap-react.tsx
import { componentRegistry } from '@hadyfayed/filament-react-wrapper/core';
import MyComponent from './components/MyComponent';

componentRegistry.register({
    name: 'MyComponent',
    component: MyComponent,
    defaultProps: { message: 'World' },
});
```

For local development:
```tsx
// resources/js/bootstrap-react.tsx
import { componentRegistry } from './react-wrapper/core';
import MyComponent from './components/MyComponent';

componentRegistry.register({
    name: 'MyComponent',
    component: MyComponent,
    defaultProps: { message: 'World' },
});
```

### 5. Use in Filament Forms

```php
use HadyFayed\ReactWrapper\Forms\Components\ReactField;

ReactField::make('my_component')
    ->component('MyComponent')
    ->props(['message' => 'Filament!'])
    ->height(200);
```

### Vite Configuration (Standard Laravel Approach)

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/js/bootstrap-react.tsx'
            ],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
});
```

## Basic Usage

### Blade Template

```blade
<x-react-wrapper::react-component 
    component="MyComponent"
    :props="['data' => $data]"
    state-path="myComponent.data"
/>
```

### Livewire Component

```php
use HadyFayed\ReactWrapper\ReactComponent;

class MyLivewireComponent extends Component
{
    public array $componentData = [];
    
    public function render()
    {
        return view('livewire.my-component', [
            'reactComponent' => new ReactComponent(
                component: 'MyComponent',
                props: ['initialData' => $this->componentData],
                statePath: 'componentData'
            )
        ]);
    }
}
```

### Filament Integration

```php
use Filament\Forms\Components\ViewComponent;

ViewComponent::make('my-react-component')
    ->view('react-wrapper::react-component')
    ->viewData([
        'component' => 'MyComponent',
        'props' => ['data' => $this->data],
        'statePath' => 'data'
    ])
```

## React Component Development

### Component Registration

For distributed packages:
```typescript
import { componentRegistry } from '@hadyfayed/filament-react-wrapper';

componentRegistry.register({
    name: 'MyComponent',
    component: MyComponent,
    defaultProps: {
        theme: 'light'
    }
});
```

For local development:
```typescript
import { componentRegistry } from './react-wrapper/core';

componentRegistry.register({
    name: 'MyComponent',
    component: MyComponent,
    defaultProps: {
        theme: 'light'
    }
});
```

### State Management

For distributed packages:
```typescript
import { useStatePath } from '@hadyfayed/filament-react-wrapper';

function MyComponent() {
    const [data, setData] = useStatePath('myData', {});
    
    return (
        <div>
            <input 
                value={data.name || ''} 
                onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
            />
        </div>
    );
}
```

For local development:
```typescript
import { useStatePath } from './react-wrapper/components/StateManager';

function MyComponent() {
    const [data, setData] = useStatePath('myData', {});
    
    return (
        <div>
            <input 
                value={data.name || ''} 
                onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
            />
        </div>
    );
}
```

### Persistence

For distributed packages:
```typescript
import { usePersistedState } from '@hadyfayed/filament-react-wrapper';

function MyComponent() {
    const [settings, setSettings] = usePersistedState('userSettings', {}, {
        storage: 'localStorage',
        syncWithLivewire: true,
        livewirePath: 'settings'
    });
    
    return <div>/* Your component */</div>;
}
```

For local development:
```typescript
import { usePersistedState } from './react-wrapper/services/StatePersistenceService';

function MyComponent() {
    const [settings, setSettings] = usePersistedState('userSettings', {}, {
        storage: 'localStorage',
        syncWithLivewire: true,
        livewirePath: 'settings'
    });
    
    return <div>/* Your component */</div>;
}
```

## Configuration

The package comes with sensible defaults, but you can customize everything in `config/react-wrapper.php`:

```php
return [
    'react_version' => '18',
    'dev_mode' => env('APP_DEBUG', false),
    'state_management' => [
        'persistence' => [
            'default_storage' => 'localStorage',
            'debounce_ms' => 300,
        ],
        'livewire_sync' => true,
    ],
    'error_handling' => [
        'show_error_overlay' => env('APP_DEBUG', false),
        'log_react_errors' => true,
        'error_boundary' => true,
    ],
];
```

## Security

The package includes several security features:

- **Prop Sanitization** - Automatic sanitization of component props
- **Size Limits** - Configurable limits on prop payload size  
- **Origin Restrictions** - Control allowed iframe origins
- **XSS Protection** - Built-in protection against script injection

## Development

### Package Development

When developing the packages locally, you can work directly with the source files:

```bash
# In the package directory
cd packages/react-wrapper
npm install
npm run build  # Build distributable package

# Copy to main app for testing
cd ../../
cp -r packages/react-wrapper/resources/js/* resources/js/react-wrapper/
```

### TypeScript Compilation

Each package has its own TypeScript configuration:

```bash
# Check types in package
cd packages/react-wrapper
npm run typecheck

# Build with type declarations
npm run build
```

### Main App Development

Work with the standard Laravel development workflow:

```bash
# Start development server
npm run dev

# Build for production
npm run build
```

### Testing

```bash
# Package tests
cd packages/react-wrapper
composer test

# Main app tests
cd ../../
php artisan test
```

### Distribution

Build distributable packages:

```bash
cd packages/react-wrapper
npm run build  # Creates dist/ folder for npm distribution
composer archive  # Creates distributable package

## License

MIT License. See [LICENSE](LICENSE) for details.