# Changelog

All notable changes to `react-wrapper` will be documented in this file.

## v2.0.0 - 2025-06-25

### Added

#### 🧪 **Comprehensive Testing Infrastructure**
- Complete test suite with Vitest and React Testing Library
- Component registry testing with mocking and integration tests
- State management testing with provider and hook testing
- Universal renderer testing with async component support
- State persistence service testing with storage mocking
- PHP/Filament integration testing
- Coverage reporting and CI integration

#### 🛠️ **Advanced Developer Experience**
- **Storybook Integration**: Interactive component documentation and playground
- **Dev Tools System**: Advanced debugging tools with:
  - Component lifecycle tracking and performance monitoring
  - State change history and memory leak detection
  - Browser dev panel with keyboard shortcuts (Ctrl+Shift+W)
  - Real-time performance metrics and component inspection
- **Interactive Stories**: Registry and state management demonstrations

#### ⚡ **Advanced Code Splitting**
- **Sophisticated Splitting Strategies**:
  - Route-based, feature-based, vendor-based splitting
  - Size-based and critical path optimization
  - Custom strategy registration system
- **Intelligent Prefetching**: Intersection observers and predictive loading
- **Bundle Analysis**: Performance recommendations and optimization
- **Queue Management**: Priority-based loading with concurrency control

#### 🔄 **Component Versioning System**
- **Full Lifecycle Management**: Version registration, deprecation, migration
- **Compatibility Checking**: Breaking change detection and warnings
- **Auto-Migration**: Prop transformation between versions
- **Dependency Management**: Version constraints and resolution
- **Changelog Integration**: Automated documentation generation

#### 🚀 **Enterprise Build & Deployment**
- **GitHub Actions CI/CD**:
  - Multi-version testing (Node 16/18/20, PHP 8.1/8.2/8.3, Laravel 10/11)
  - Security scanning with Trufflehog and dependency audits
  - Automated releases to NPM and Packagist
  - Storybook deployment to GitHub Pages
  - Performance testing with Lighthouse CI
- **Advanced Build System**:
  - Multi-target builds (ES, UMD, Laravel assets)
  - Build validation and optimization
  - Bundle analysis and size monitoring
  - Build reports with detailed metrics

### Enhanced

#### 📦 **Package Management**
- Updated to latest Storybook 8.x with improved performance
- Enhanced TypeScript configuration with strict mode
- Improved ESLint rules with Storybook support
- Better file organization and exports

### Breaking Changes

#### ⚠️ **Version 2.0 Breaking Changes**
- **New Service Exports**: `devTools`, `codeSplittingService`, `componentVersioningService` now available
- **Enhanced Global Window Object**: Additional services added to `window.ReactWrapper`
- **Updated Dependencies**: Minimum Node.js 16+, React 18+
- **New File Structure**: Additional directories for tests, stories, and scripts

## v1.1.2 - 2025-06-24

### Changed
- 🔧 **Package Management** - Removed version from composer.json for proper Git tag-based versioning
- 📦 **Packagist Compatibility** - Optimized for Packagist automatic version detection

### Enhanced
- 🏷️ **Release Process** - Improved Git tag-based versioning for both NPM and Packagist
- 📚 **Documentation** - Maintained comprehensive PHP/Laravel and TypeScript coverage

## v1.1.1 - 2025-06-24

### Added
- 📚 **Comprehensive PHP/Laravel Registration Documentation**
  - Service Provider component registration examples
  - Configuration-based registration via config files
  - Artisan commands for component management (`make:react-component`, `react:register`, etc.)
  - ReactWrapper facade usage examples
  - ReactField and ReactWidget detailed API documentation
  - Package integration examples for Laravel package authors
  - Dynamic registration in Filament resources
  - Event hooks and listeners documentation
  - Complete PHP API reference with interfaces

### Enhanced
- Component registration section now covers both JavaScript and PHP approaches
- Added real-world examples for package authors and dynamic registration
- Configuration options documentation with environment variables
- Artisan command reference with all available commands
- Event system integration examples

## v1.1.0 - 2025-06-24

### Added
- 🛡️ **Memory leak prevention** - Automatic cleanup and bounded data structures
- 🚫 **Infinite loop protection** - Built-in circular notification detection
- ⚡ **Performance optimizations** - Enhanced prop comparison and memoization
- 🧹 **Resource cleanup** - MutationObserver and timeout cleanup on unmount
- 📊 **Memory monitoring** - Built-in tracking for subscriptions and components

### Fixed
- Fixed infinite loops in state management useEffect hooks
- Fixed memory leaks in MutationObserver (FilamentReactAdapter)
- Fixed unbounded growth in StatePersistenceService maps
- Fixed circular state update notifications
- Fixed expensive JSON.stringify operations in prop comparison

### Changed
- Improved useEffect dependency management to prevent infinite re-renders
- Enhanced error handling in component middleware
- Optimized prop comparison with intelligent shallow/deep comparison
- Updated TypeScript definitions for better type safety

### Security
- Added circular notification detection to prevent infinite loops
- Implemented bounded data structures (max 1000 entries)
- Enhanced error isolation and recovery mechanisms

## v1.0.0 - 2025-06-23

### Added
- Initial release
- Universal React component integration system for Laravel/Filament
- Advanced state management with persistence and Livewire sync
- Component registry with lazy loading and middleware support
- FilamentReactAdapter with DOM mutation observation
- Universal renderer with error boundaries
- TypeScript support with comprehensive type definitions
- Security features with XSS protection and input validation
- Extensive documentation and examples