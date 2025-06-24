<?php

namespace HadyFayed\ReactWrapper;

use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;
use HadyFayed\ReactWrapper\Services\ExtensionManager;
use HadyFayed\ReactWrapper\Factories\ReactComponentFactory;
use HadyFayed\ReactWrapper\Contracts\ReactRegistryInterface;
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
        
        // Load views
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'react-wrapper');

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

        // Publish bootstrap file for Vite integration
        $this->publishes([
            __DIR__.'/../resources/js/bootstrap.tsx' => resource_path('js/bootstrap-react.tsx'),
        ], 'react-wrapper-bootstrap');

        // Publish views
        $this->publishes([
            __DIR__.'/../resources/views' => resource_path('views/react-wrapper'),
        ], 'react-wrapper-views');

        // Publish all assets at once
        $this->publishes([
            __DIR__.'/../config/react-wrapper.php' => config_path('react-wrapper.php'),
            __DIR__.'/../resources/js' => resource_path('js/react-wrapper'),
            __DIR__.'/../resources/views' => resource_path('views/react-wrapper'),
            __DIR__.'/../resources/js/bootstrap.tsx' => resource_path('js/bootstrap-react.tsx'),
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
            
            // Register Filament plugin if auto-register is enabled
            if (config('react-wrapper.integrations.filament.auto_register', true)) {
                // Plugin registration will be handled by auto-discovery
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
                'Version' => '1.0.0',
                'Components Registered' => $this->app->make(ReactComponentRegistry::class)->count(),
                'Bootstrap Published' => file_exists(resource_path('js/bootstrap-react.tsx')) ? 'Yes' : 'No',
                'Filament Integration' => config('react-wrapper.integrations.filament.enabled', true) ? 'Enabled' : 'Disabled',
                'Auto Discovery' => config('react-wrapper.registry.auto_discovery.enabled', true) ? 'Enabled' : 'Disabled',
            ]);
        }
    }
}