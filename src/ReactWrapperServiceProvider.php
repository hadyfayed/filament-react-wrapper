<?php

namespace HadyFayed\ReactWrapper;

use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;
use HadyFayed\ReactWrapper\Services\ExtensionManager;
use HadyFayed\ReactWrapper\Factories\ReactComponentFactory;
use HadyFayed\ReactWrapper\Contracts\ReactRegistryInterface;
use HadyFayed\ReactWrapper\FilamentReactWrapperPlugin;
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
        
        // Register event listeners
        $this->registerEventListeners();
    }

    public function boot()
    {
        // Publish configuration and assets
        $this->publishAssets();
        
        // Note: Views removed - using FilamentAsset for script loading

        // Register Blade components
        $this->registerBladeComponents();

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

        // Aliases for easier access
        $this->app->alias(ReactComponentRegistry::class, 'react-wrapper.registry');
        $this->app->alias(ExtensionManager::class, 'react-wrapper.extensions');
    }

    protected function registerFactories(): void
    {
        $this->app->singleton(ReactComponentFactory::class, function ($app) {
            return new ReactComponentFactory($app->make(ReactComponentRegistry::class));
        });

        $this->app->alias(ReactComponentFactory::class, 'react-wrapper.factory');
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
        if (config('react-wrapper.integrations.filament.enabled', true) && 
            class_exists(\Filament\FilamentServiceProvider::class)) {
            
            // Register the Filament plugin
            $this->app->singleton(FilamentReactWrapperPlugin::class);
            
            // Register Filament plugin if auto-register is enabled
            if (config('react-wrapper.integrations.filament.auto_register', true)) {
                Event::dispatch('react-wrapper.filament.integrating');
            }
        }
    }

    protected function discoverComponents(): void
    {
        $registry = $this->app->make(ReactComponentRegistry::class);
        $paths = config('react-wrapper.registry.auto_discovery.paths', []);
        
        foreach ($paths as $path) {
            // Auto-discovery logic would go here
            // For now, we'll just dispatch an event
            Event::dispatch('react-wrapper.components.discovering', [$path]);
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
}