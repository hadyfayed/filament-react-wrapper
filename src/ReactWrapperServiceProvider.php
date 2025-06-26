<?php

namespace HadyFayed\ReactWrapper;

use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;
use HadyFayed\ReactWrapper\Services\ExtensionManager;
use HadyFayed\ReactWrapper\Services\AssetManager;
use HadyFayed\ReactWrapper\Services\VariableShareService;
use HadyFayed\ReactWrapper\Factories\ReactComponentFactory;
use HadyFayed\ReactWrapper\Contracts\ReactRegistryInterface;
use HadyFayed\ReactWrapper\Integrations\FilamentIntegration;
use HadyFayed\ReactWrapper\Mapping\ReactPhpFunctionMap;
use HadyFayed\ReactWrapper\Middleware\ReactWrapperMiddleware;
use HadyFayed\ReactWrapper\Blade\ReactDirective;
use HadyFayed\ReactWrapper\Console\IntegrationReportCommand;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;

class ReactWrapperServiceProvider extends ServiceProvider
{
    public function register()
    {
        // Merge configuration
        $this->mergeConfigFrom(__DIR__.'/../config/react-wrapper.php', 'react-wrapper');

        // Register core services
        $this->registerCoreServices();
        
        // Register factories
        $this->registerFactories();
        
        // Register middleware
        $this->registerMiddleware();
        
        // Register Blade directives
        $this->registerBladeDirectives();
        
        // Register event listeners
        $this->registerEventListeners();
    }

    public function boot()
    {
        // Publish configuration and assets
        $this->publishAssets();
        
        // Note: Views removed - using FilamentAsset for script loading

        // Register Blade components and directives
        $this->registerBladeComponents();
        $this->app->make(ReactDirective::class)->register();

        // Boot extensions if enabled
        if (config('react-wrapper.extensions.auto_boot', true)) {
            $this->app->make(ExtensionManager::class)->boot();
        }

        // Register Filament integration
        $this->registerFilamentIntegration();

        // Discover and register components
        if (config('react-wrapper.registry.auto_discovery.enabled', true)) {
            $this->discoverComponents();
        }

        // Initialize variable sharing
        $this->initializeVariableSharing();

        // Register console commands
        $this->registerCommands();

        // Register information for Laravel's "About" command
        $this->registerAboutCommand();
    }

    protected function registerCoreServices(): void
    {
        // Register component registry
        $this->app->singleton(ReactRegistryInterface::class, ReactComponentRegistry::class);
        $this->app->singleton(ReactComponentRegistry::class);

        // Register extension manager
        $this->app->singleton(ExtensionManager::class);

        // Register asset manager
        $this->app->singleton(AssetManager::class);

        // Register variable share service
        $this->app->singleton(VariableShareService::class);

        // Register integrations
        $this->app->singleton(FilamentIntegration::class);

        // Register function mapping
        $this->app->singleton(ReactPhpFunctionMap::class);

        // Aliases for easier access
        $this->app->alias(ReactComponentRegistry::class, 'react-wrapper.registry');
        $this->app->alias(ExtensionManager::class, 'react-wrapper.extensions');
        $this->app->alias(AssetManager::class, 'react-wrapper.assets');
        $this->app->alias(VariableShareService::class, 'react-wrapper.variables');
        $this->app->alias(FilamentIntegration::class, 'react-wrapper.filament');
        $this->app->alias(ReactPhpFunctionMap::class, 'react-wrapper.mapping');
    }

    protected function registerFactories(): void
    {
        $this->app->singleton(ReactComponentFactory::class, function ($app) {
            return new ReactComponentFactory($app->make(ReactComponentRegistry::class));
        });

        $this->app->alias(ReactComponentFactory::class, 'react-wrapper.factory');
    }

    protected function registerMiddleware(): void
    {
        $this->app->singleton(ReactWrapperMiddleware::class);
        $this->app->alias(ReactWrapperMiddleware::class, 'react-wrapper.middleware');
    }

    protected function registerBladeDirectives(): void
    {
        $this->app->singleton(ReactDirective::class);
        $this->app->alias(ReactDirective::class, 'react-wrapper.directives');
    }

    protected function registerEventListeners(): void
    {
        // Component lifecycle events
        Event::listen('react-wrapper.component.registering', function ($name, $component, $config) {
            logger()->info("Registering React component: {$name}");
        });

        Event::listen('react-wrapper.component.registered', function ($name, $component, $config) {
            logger()->debug("React component registered: {$name}");
        });

        // Extension lifecycle events
        Event::listen('react-wrapper.extension.registered', function ($extension) {
            logger()->info("React extension registered: {$extension->getName()}");
        });
    }

    protected function publishAssets(): void
    {
        // Publish configuration
        $this->publishes([
            __DIR__.'/../config/react-wrapper.php' => config_path('react-wrapper.php'),
        ], 'react-wrapper-config');

        // Publish JavaScript assets
        $this->publishes([
            __DIR__.'/../resources/js' => resource_path('js/react-wrapper'),
        ], 'react-wrapper-assets');

        // Publish main file for Vite integration
        $this->publishes([
            __DIR__.'/../resources/js/index.tsx' => resource_path('js/bootstrap-react.tsx'),
        ], 'react-wrapper-bootstrap');

        // Note: Views removed - asset loading handled by FilamentAsset

        // Publish prebuilt assets for production use (no build step required)
        if (is_dir(__DIR__.'/../dist/laravel')) {
            $this->publishes([
                __DIR__.'/../dist/laravel' => public_path('vendor/react-wrapper'),
            ], 'react-wrapper-prebuilt');
        }

        // Publish all assets at once
        $this->publishes([
            __DIR__.'/../config/react-wrapper.php' => config_path('react-wrapper.php'),
            __DIR__.'/../resources/js' => resource_path('js/react-wrapper'),
            __DIR__.'/../resources/js/index.tsx' => resource_path('js/bootstrap-react.tsx'),
        ], 'react-wrapper');
    }

    protected function registerBladeComponents(): void
    {
        // Register Filament-specific components only
        // Blade::component('react-wrapper::react-field', ReactField::class);
        // Note: Filament fields are auto-discovered, no need to register as Blade components
    }

    protected function registerFilamentIntegration(): void
    {
        if (config('react-wrapper.integrations.filament.enabled', true)) {
            // Initialize Filament integration without plugin
            $filamentIntegration = $this->app->make(FilamentIntegration::class);
            $filamentIntegration->initialize();
            
            Event::dispatch('react-wrapper.filament.integrated');
        }
    }

    protected function discoverComponents(): void
    {
        $registry = $this->app->make(ReactComponentRegistry::class);
        $paths = config('react-wrapper.registry.auto_discovery.paths', []);
        $patterns = config('react-wrapper.registry.auto_discovery.patterns', ['*.tsx', '*.jsx']);
        
        foreach ($paths as $basePath) {
            $fullPath = base_path($basePath);
            if (!is_dir($fullPath)) {
                continue;
            }
            
            Event::dispatch('react-wrapper.components.discovering', [$fullPath]);
            
            foreach ($patterns as $pattern) {
                $files = glob($fullPath . '/**/' . $pattern, GLOB_BRACE);
                
                foreach ($files as $file) {
                    $this->autoRegisterComponent($registry, $file, $basePath);
                }
            }
            
            Event::dispatch('react-wrapper.components.discovered', [$fullPath, count($files ?? [])]);
        }
    }

    /**
     * Register information for Laravel's "About" command.
     */
    protected function registerAboutCommand(): void
    {
        if (class_exists(\Illuminate\Foundation\Console\AboutCommand::class)) {
            \Illuminate\Foundation\Console\AboutCommand::add('React Wrapper', fn () => [
                'Version' => $this->getPackageVersion(),
                'Components Registered' => $this->app->make(ReactComponentRegistry::class)->count(),
                'Bootstrap Published' => file_exists(resource_path('js/bootstrap-react.tsx')) ? 'Yes' : 'No',
                'Prebuilt Assets' => file_exists(public_path('vendor/react-wrapper/js/react-wrapper.js')) ? 'Yes' : 'No',
                'Filament Integration' => config('react-wrapper.integrations.filament.enabled', true) ? 'Enabled' : 'Disabled',
                'Auto Discovery' => config('react-wrapper.registry.auto_discovery.enabled', true) ? 'Enabled' : 'Disabled',
                'Vite Dev Server' => $this->app->make(AssetManager::class)->isViteDevServerRunning() ? 'Running' : 'Not Running',
                'Cache Enabled' => config('react-wrapper.registry.cache.enabled', true) ? 'Yes' : 'No',
                'Integration Stats' => $this->app->make(ReactPhpFunctionMap::class)->getAverageIntegrationPercentage() . '%',
                'Filament Integration' => $this->app->make(FilamentIntegration::class)->isFilamentAvailable() ? 'Available' : 'Not Available',
            ]);
        }
    }

    protected function getPackageVersion(): string
    {
        $composerPath = __DIR__.'/../composer.json';
        if (file_exists($composerPath)) {
            $composer = json_decode(file_get_contents($composerPath), true);
            return $composer['version'] ?? '1.0.0';
        }
        return '1.0.0';
    }
    
    protected function autoRegisterComponent(ReactComponentRegistry $registry, string $file, string $basePath): void
    {
        $relativePath = str_replace(base_path($basePath) . '/', '', $file);
        $componentName = $this->extractComponentName($relativePath);
        
        if ($componentName && !$registry->has($componentName)) {
            $registry->register($componentName, $componentName, [
                'file_path' => $file,
                'auto_discovered' => true,
                'discovery_time' => now(),
            ]);
            
            logger()->debug("Auto-discovered React component: {$componentName}", [
                'file' => $file,
                'relative_path' => $relativePath
            ]);
        }
    }
    
    protected function extractComponentName(string $filePath): ?string
    {
        // Extract component name from file path
        // Example: components/Button/index.tsx -> Button
        // Example: components/Button.tsx -> Button
        
        $pathInfo = pathinfo($filePath);
        $fileName = $pathInfo['filename'];
        
        // Skip index files, use directory name instead
        if ($fileName === 'index') {
            $dirName = basename(dirname($filePath));
            return ucfirst($dirName);
        }
        
        // Skip non-component files
        if (in_array(strtolower($fileName), ['types', 'utils', 'helpers', 'constants'])) {
            return null;
        }
        
        return ucfirst($fileName);
    }

    protected function registerCommands(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                IntegrationReportCommand::class,
            ]);
        }
    }

    protected function initializeVariableSharing(): void
    {
        $variableShare = $this->app->make(VariableShareService::class);
        
        // Share common Laravel data
        $variableShare->shareCommonData();
        
        // Share Livewire data if available
        $variableShare->shareLivewireData();
        
        // Register auto-discovery of components for asset management
        $assetManager = $this->app->make(AssetManager::class);
        $registry = $this->app->make(ReactComponentRegistry::class);
        
        foreach ($registry->all() as $name => $config) {
            $assetManager->registerComponentAsset($name, [
                'js' => $config['config']['file_path'] ?? "resources/js/components/{$name}.tsx",
                'lazy' => $config['config']['lazy'] ?? config('react-wrapper.defaults.lazy', false),
                'preload' => $config['config']['preload'] ?? false,
            ]);
        }
    }
}