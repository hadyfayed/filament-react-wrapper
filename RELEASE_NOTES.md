# Release Notes

## Version 3.2.0 (2025-07-15) 🚀

### 🎯 Major Improvements

#### 🔗 Enhanced vite-plugin-filament-react Integration
- **Seamless Plugin Support**: Full compatibility with `vite-plugin-filament-react@^1.0.0`
- **Auto-Discovery**: Components automatically discovered and registered when plugin is used
- **Enhanced Dev Tools**: Component inspector, state debugger, and performance monitor
- **Optimized Builds**: Automatic code splitting and performance optimization
- **PHP Registry Generation**: Server-side component registry for improved integration

#### 📚 Documentation Overhaul
- **Updated README**: Enhanced with plugin integration examples and recommendations
- **Installation Guide**: Comprehensive guide with both basic and enhanced configurations
- **Best Practice Examples**: Real-world usage patterns and configuration options

### 🔧 Technical Improvements

#### Build System Modernization
- **Vite v7 Compatibility**: Full support for the latest Vite version
- **ESLint v9 Upgrade**: Modern linting with improved TypeScript support
- **Improved Build Structure**: Organized output in `dist/react-wrapper/` for better clarity
- **Enhanced Type Definitions**: Better browser API support and global type definitions

#### Code Quality Enhancements
- **Zero Critical Errors**: All ESLint errors resolved
- **Standardized Dependencies**: Consistent versions across the project
- **Enhanced Testing**: All tests passing with improved output validation
- **Better Type Safety**: Improved TypeScript compatibility and definitions

### 🆕 New Features

#### Developer Experience
- **Plugin Integration Guide**: Step-by-step instructions for enhanced setup
- **Configuration Examples**: Both basic and advanced Vite configurations
- **Pro Tips**: Inline documentation with best practice recommendations

#### Enhanced Compatibility
- **React Hooks Plugin v5.2.0**: Updated for ESLint v9 compatibility
- **Prettier v3.6.2**: Standardized code formatting across the project
- **Modern Browser APIs**: Support for IdleDeadline, PerformanceObserver, and more

### 📦 Package Updates

#### Dependencies
- **Vite**: Updated to v7.0.2 for improved performance
- **ESLint**: Upgraded to v9.30.1 with enhanced TypeScript rules
- **@vitejs/plugin-react**: Updated to v4.6.0 for better React support
- **TypeScript**: Enhanced type definitions and compiler options

#### Build Configuration
- **Output Organization**: Better structured build output
- **Bundle Optimization**: Improved chunk splitting and size optimization
- **Asset Management**: Enhanced asset loading and caching strategies

### 🔄 Breaking Changes

⚠️ **Build Output Structure**
- **Path Change**: Build output moved from `dist/` to `dist/react-wrapper/`
- **Type Definitions**: Now located at `dist/react-wrapper/types/index.d.ts`
- **Migration**: No action needed - package.json exports updated automatically

### 🐛 Bug Fixes

#### ESLint and TypeScript
- **Global Definitions**: Fixed `IdleDeadline` and `PerformanceObserver` not defined errors
- **React Hooks**: Resolved compatibility issues with ESLint v9
- **Build Validation**: Updated build script for new output structure

#### Development Tools
- **Linting Pipeline**: Fixed CI/CD pipeline issues
- **Test Environment**: Improved test stability and output
- **Type Checking**: Enhanced TypeScript validation

### 🎨 Enhanced Documentation

#### README Improvements
```markdown
💡 Pro Tip: Use with vite-plugin-filament-react for enhanced DX
```

#### Installation Guide Updates
- **Plugin Benefits**: Clear explanation of enhanced features
- **Configuration Options**: Both basic and advanced setups
- **Troubleshooting**: Common issues and solutions

### 🔗 Integration Benefits

#### With vite-plugin-filament-react
- **Auto-Discovery**: No manual component registration needed
- **Dev Tools**: Visual debugging and inspection tools
- **Performance**: Automatic optimization and lazy loading
- **PHP Bridge**: Server-side component registry generation

### 📊 Performance Improvements

- **Bundle Size**: Optimized output with better tree shaking
- **Load Time**: Improved asset loading with enhanced caching
- **Development**: Faster builds with modern tooling
- **Runtime**: Better memory management and performance monitoring

### 🚀 Migration Guide

#### From v3.1.x to v3.2.0

**Basic Update:**
```bash
npm update @hadyfayed/filament-react-wrapper
composer update hadyfayed/filament-react-wrapper
```

**Enhanced Setup (Recommended):**
```bash
# Install the companion plugin
npm install --save-dev vite-plugin-filament-react

# Update vite.config.js
import filamentReact from 'vite-plugin-filament-react';

export default defineConfig({
    plugins: [
        laravel({ /* ... */ }),
        react(),
        filamentReact({
            discovery: { packagePaths: ['resources/js'] },
            devTools: { componentInspector: true }
        }),
    ],
});
```

### 🎯 What's Next

- **Advanced Dev Tools**: Enhanced debugging and inspection capabilities
- **Performance Monitoring**: Real-time performance analysis
- **Component Generator**: CLI tools for rapid component creation
- **Testing Utilities**: Improved testing helpers and utilities

### 🙏 Contributors

This release focuses on enhanced developer experience and better integration with the modern Vite ecosystem while maintaining full backward compatibility.

### 📈 Statistics

- **0 Critical Errors**: All ESLint errors resolved
- **130 Warnings**: Non-critical type annotations (expected for a flexible library)
- **6/6 Tests Passing**: 100% test suite success rate
- **67.73 KB**: Optimized bundle size

---

## Previous Releases

### Version 3.1.1 - Stability and Performance
- Bug fixes and performance improvements
- Enhanced TypeScript definitions
- Improved Laravel integration

### Version 3.0.0 - Enterprise React Integration
- Complete rewrite for enterprise-grade performance
- 90%+ React-PHP function mapping
- Smart asset management with 60% smaller bundles
- No-plugin Filament integration
- Comprehensive documentation and AI agent guide

---

**Full Changelog**: https://github.com/hadyfayed/filament-react-wrapper/compare/v3.1.1...v3.2.0

**Package Links**:
- NPM: https://www.npmjs.com/package/@hadyfayed/filament-react-wrapper
- Packagist: https://packagist.org/packages/hadyfayed/filament-react-wrapper
- GitHub: https://github.com/hadyfayed/filament-react-wrapper