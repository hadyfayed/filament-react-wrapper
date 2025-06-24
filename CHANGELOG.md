# Changelog

All notable changes to `react-wrapper` will be documented in this file.

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