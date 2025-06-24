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
        // Register render hooks for React integration
        $panel->renderHook(
            'panels::body.end',
            fn (): string => view('react-wrapper::filament.scripts')->render()
        );

        // Assets are loaded via scripts.blade.php with proper module type
    }

    public function boot(Panel $panel): void
    {
        // Register React wrapper core assets through FilamentAsset
        FilamentAsset::register([
            Js::make('react-wrapper-core', $this->getAssetPath('core.tsx'))
                ->loadedOnRequest(),
            Js::make('react-wrapper-state-manager', $this->getAssetPath('components/StateManager.tsx'))
                ->loadedOnRequest(),
            Js::make('react-wrapper-registry', $this->getAssetPath('components/ReactComponentRegistry.tsx'))
                ->loadedOnRequest(),
            Js::make('react-wrapper-renderer', $this->getAssetPath('components/UniversalReactRenderer.tsx'))
                ->loadedOnRequest(),
        ], 'react-wrapper');
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

    protected function getViteAsset(string $entryPoint): string
    {
        // Check for Vite manifest in multiple possible locations
        $manifestPaths = [
            public_path('build/.vite/manifest.json'), // Laravel 12.x location
            public_path('build/manifest.json'),       // Laravel 11.x location
            public_path('build/assets/manifest.json'), // Alternative location
        ];
        
        foreach ($manifestPaths as $manifestPath) {
            if (file_exists($manifestPath)) {
                $manifest = json_decode(file_get_contents($manifestPath), true);
                
                if (isset($manifest[$entryPoint]['file'])) {
                    return asset('build/' . $manifest[$entryPoint]['file']);
                }
            }
        }
        
        // Development fallback - try Vite dev server
        if (app()->environment('local') && $this->isViteDevServerRunning()) {
            return $this->getViteDevServerUrl() . '/' . $entryPoint;
        }
        
        // Final fallback to source file
        return asset($entryPoint);
    }

    protected function isViteDevServerRunning(): bool
    {
        try {
            $context = stream_context_create([
                'http' => ['timeout' => 1]
            ]);
            return @file_get_contents('http://localhost:5173', false, $context) !== false;
        } catch (\Exception $e) {
            return false;
        }
    }

    protected function getViteDevServerUrl(): string
    {
        return config('react-wrapper.vite.dev_server_url', 'http://localhost:5173');
    }

    public static function make(): static
    {
        return app(static::class);
    }
}