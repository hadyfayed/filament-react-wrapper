# Upgrade Guide - React Wrapper v2.0.0

## 🎉 Welcome to React Wrapper v2.0.0!

This major release brings enterprise-grade features, comprehensive testing, advanced development tools, and sophisticated code optimization strategies.

## 📋 Quick Upgrade Checklist

### 1. Update Dependencies
```bash
npm install @hadyfayed/filament-react-wrapper@^2.0.0
composer require hadyfayed/filament-react-wrapper@^2.0.0
```

### 2. New Features Available
```typescript
import { 
  // Existing exports
  componentRegistry,
  universalReactRenderer,
  globalStateManager,
  statePersistenceService,
  
  // NEW in v2.0.0 🎉
  devTools,
  codeSplittingService,
  componentVersioningService 
} from '@hadyfayed/filament-react-wrapper';
```

### 3. Development Workflow Enhancements
```bash
# Interactive component development
npm run storybook

# Comprehensive testing
npm run test:coverage

# Advanced build options
npm run build:all
npm run build:umd
npm run build:storybook

# Code quality
npm run lint
npm run typecheck
```

## 🚀 New Features Overview

### 🧪 Testing Infrastructure
- **Vitest + React Testing Library** - Complete test coverage
- **Component Testing** - Registry, state management, renderer testing
- **Integration Testing** - PHP/Filament integration tests
- **Coverage Reporting** - Detailed coverage metrics and CI integration

### 🛠️ Developer Experience
- **Storybook 8.x** - Interactive component playground and documentation
- **Advanced DevTools** - Real-time debugging with:
  - Component lifecycle tracking
  - Performance monitoring
  - Memory leak detection
  - Keyboard shortcuts (`Ctrl+Shift+W` for debug panel)

### ⚡ Code Splitting & Performance
- **Smart Splitting Strategies**:
  ```typescript
  // Route-based splitting
  codeSplittingService.registerStrategy({
    name: 'route-based',
    condition: (name, metadata) => metadata?.category === 'page',
    chunkName: (name) => `route-${name.toLowerCase()}`,
    priority: ChunkPriority.HIGH
  });
  
  // Prefetch rules
  codeSplittingService.addPrefetchRule({
    trigger: 'Dashboard',
    prefetch: ['UserProfile', 'Analytics'],
    delay: 1000
  });
  ```

### 🔄 Component Versioning
- **Version Management**:
  ```typescript
  componentVersioningService.registerVersion(
    'UserCard', 
    '2.0.0', 
    UserCardV2, 
    {
      description: 'Enhanced user card with new features',
      changelog: [{
        version: '2.0.0',
        changes: ['Added dark mode support', 'Improved accessibility']
      }]
    }
  );
  
  // Auto-migration between versions
  const migrationResult = await componentVersioningService.migrateProps(
    'UserCard', '1.0.0', '2.0.0', oldProps
  );
  ```

### 🚀 Enterprise CI/CD
- **GitHub Actions** - Automated testing across Node 16/18/20 and PHP 8.1/8.2/8.3
- **Security Scanning** - Dependency audits and secret detection
- **Auto-Deployment** - NPM, Packagist, and Storybook publishing
- **Performance Testing** - Lighthouse CI integration

## 🔧 Configuration Updates

### ESLint Configuration
New `.eslintrc.json` with Storybook support:
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:storybook/recommended"
  ]
}
```

### Package.json Scripts
Updated build system with advanced options:
```json
{
  "scripts": {
    "build": "node scripts/build.js --target=es",
    "build:all": "node scripts/build.js --target=all",
    "storybook": "storybook dev -p 6006",
    "test:coverage": "vitest run --coverage"
  }
}
```

## 🎯 Development Workflow

### 1. Component Development
```bash
# Start Storybook for interactive development
npm run storybook

# Your components are available at http://localhost:6006
```

### 2. Testing
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### 3. Debugging
```typescript
// Enable debug mode
devTools.enable();

// Or use keyboard shortcut: Ctrl+Shift+W
// View component info
devTools.logComponentInfo();

// Track performance
devTools.logPerformanceInfo();
```

### 4. Code Splitting
```typescript
// Register advanced splitting strategies
codeSplittingService.registerStrategy({
  name: 'feature-based',
  condition: (name) => name.includes('Admin'),
  chunkName: (name) => `admin-${name}`,
  priority: ChunkPriority.MEDIUM
});

// Load with smart caching
const component = await codeSplittingService.loadComponent(
  'AdminDashboard',
  { category: 'admin' }
);
```

## 🎨 Storybook Integration

Create stories for your components:

```typescript
// stories/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Example/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    primary: true,
    label: 'Button',
  },
};
```

## 🔄 Migration from v1.x

### Breaking Changes
1. **New Service Exports** - Additional services now available
2. **Updated Dependencies** - Node 16+ and React 18+ required
3. **Enhanced Window Object** - More services in `window.ReactWrapper`

### No Action Required
- Existing component registrations continue to work
- State management API remains compatible
- Filament integration unchanged

## 🚨 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear caches and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild everything
npm run build:all
```

#### Type Errors
```bash
# Update TypeScript and regenerate types
npm run typecheck
```

#### Test Failures
```bash
# Run tests with verbose output
npm run test -- --verbose
```

## 📚 Resources

- **Storybook**: Interactive component documentation
- **GitHub Actions**: Automated CI/CD pipeline
- **Tests**: Comprehensive test coverage
- **DevTools**: Advanced debugging capabilities

## 🤝 Support

- 📚 [Documentation](https://docs.hadyfayed.com/react-wrapper)
- 💬 [GitHub Discussions](https://github.com/hadyfayed/react-wrapper/discussions)
- 🐛 [Issue Tracker](https://github.com/hadyfayed/react-wrapper/issues)
- 📧 [Email Support](mailto:support@hadyfayed.com)

---

**Congratulations! You're now ready to use React Wrapper v2.0.0 with all its enterprise features! 🎉**