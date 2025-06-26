<?php

namespace HadyFayed\ReactWrapper\Extensions;

use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;
use Illuminate\Support\Facades\Cache;

class CacheExtension extends BaseReactExtension
{
    protected string $name = 'cache';
    protected string $version = '2.0.1';

    public function register(): void
    {
        // Register cache middleware
        app(ReactComponentRegistry::class)->addHook(
            'component:registering',
            [$this, 'addCacheMiddleware'],
            20
        );
    }

    public function boot(): void
    {
        // Boot logic if needed
    }

    public function addCacheMiddleware($data): mixed
    {
        $definition = $data['definition'] ?? null;

        if (!$definition || !($definition['config']['cache'] ?? false)) {
            return $data;
        }

        // Add cache key generation logic here
        $cacheKey = $this->generateCacheKey($definition);

        // Store cache key in component config
        $data['definition']['config']['cacheKey'] = $cacheKey;

        return $data;
    }

    protected function generateCacheKey(array $definition): string
    {
        return 'react_component_' . md5(
            $definition['name'] .
            serialize($definition['defaultProps'] ?? []) .
            ($definition['config']['version'] ?? '1.0.0')
        );
    }
}
