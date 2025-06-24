<?php

namespace HadyFayed\ReactWrapper;

use Filament\Contracts\Plugin;
use Filament\Panel;
use Filament\Support\Assets\Js;
use Filament\Support\Assets\Css;
use Filament\Support\Facades\FilamentAsset;

class FilamentReactWrapperPlugin implements Plugin
{
    public function getId(): string
    {
        return 'react-wrapper';
    }

    public function register(Panel $panel): void
    {
        // Assets are managed through FilamentAsset in boot() method
        // No manual script inclusion needed
    }

    public function boot(Panel $panel): void
    {
        // Register React dependencies
        FilamentAsset::register([
            Js::make('react', 'https://unpkg.com/react@18/umd/react.production.min.js')
                ->loadedOnRequest(),
            Js::make('react-dom', 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js')
                ->loadedOnRequest(),
        ], 'react-dependencies');

        // Register React Wrapper assets
        if ($this->hasPrebuiltAssets()) {
            // Use prebuilt assets (production)
            FilamentAsset::register([
                Js::make('react-wrapper', asset('vendor/react-wrapper/js/react-wrapper.js'))
                    ->loadedOnRequest(),
            ], 'react-wrapper');
        } else {
            // Use development assets (requires Vite)
            FilamentAsset::register([
                Js::make('react-wrapper-dev', $this->getAssetPath('index.tsx'))
                    ->module()
                    ->loadedOnRequest(),
            ], 'react-wrapper');
        }

        // Register initialization script
        $panel->renderHook(
            'panels::body.end',
            fn (): string => '<script>
                document.addEventListener("DOMContentLoaded", function() {
                    if (window.ReactWrapper?.bootstrap) {
                        window.ReactWrapper.bootstrap();
                        console.log("React Wrapper initialized for Filament");
                    }
                });
            </script>'
        );
    }

    protected function getAssetPath(string $file): string
    {
        // Check if assets are published first
        $publishedPath = resource_path('js/react-wrapper/' . $file);
        if (file_exists($publishedPath)) {
            return $publishedPath;
        }

        // Fall back to package path
        return __DIR__ . '/../resources/js/' . $file;
    }

    protected function hasPublishedBootstrap(): bool
    {
        return file_exists(resource_path('js/bootstrap-react.tsx'));
    }

    protected function hasPrebuiltAssets(): bool
    {
        return file_exists(public_path('vendor/react-wrapper/js/react-wrapper.js'));
    }

    protected function isDevelopmentMode(): bool
    {
        return app()->environment('local') && !$this->hasPrebuiltAssets();
    }

    public function getVersion(): string
    {
        $composerPath = __DIR__.'/../composer.json';
        if (file_exists($composerPath)) {
            $composer = json_decode(file_get_contents($composerPath), true);
            return $composer['version'] ?? '1.0.0';
        }
        return '1.0.0';
    }

    public static function make(): static
    {
        return app(static::class);
    }
}