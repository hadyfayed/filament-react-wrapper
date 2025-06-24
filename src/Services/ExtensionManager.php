<?php

namespace HadyFayed\ReactWrapper\Services;

use HadyFayed\ReactWrapper\Contracts\ReactExtensionInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Event;
use InvalidArgumentException;

class ExtensionManager
{
    protected Collection $extensions;
    protected Collection $middleware;
    protected bool $booted = false;

    public function __construct()
    {
        $this->extensions = collect();
        $this->middleware = collect();
    }

    /**
     * Register an extension
     */
    public function register(ReactExtensionInterface $extension): void
    {
        $name = $extension->getName();

        if ($this->extensions->has($name)) {
            throw new InvalidArgumentException("Extension [{$name}] is already registered.");
        }

        // Check dependencies
        $this->checkDependencies($extension);

        $this->extensions->put($name, $extension);

        // Register the extension
        $extension->register();

        Event::dispatch('react-wrapper.extension.registered', [$extension]);

        // Boot immediately if manager is already booted
        if ($this->booted) {
            $extension->boot();
            Event::dispatch('react-wrapper.extension.booted', [$extension]);
        }
    }

    /**
     * Boot all registered extensions
     */
    public function boot(): void
    {
        if ($this->booted) {
            return;
        }

        Event::dispatch('react-wrapper.extensions.booting');

        $this->extensions->each(function (ReactExtensionInterface $extension) {
            $extension->boot();
            Event::dispatch('react-wrapper.extension.booted', [$extension]);
        });

        $this->booted = true;
        Event::dispatch('react-wrapper.extensions.booted');
    }

    /**
     * Get an extension by name
     */
    public function get(string $name): ?ReactExtensionInterface
    {
        return $this->extensions->get($name);
    }

    /**
     * Check if an extension is registered
     */
    public function has(string $name): bool
    {
        return $this->extensions->has($name);
    }

    /**
     * Get all registered extensions
     */
    public function all(): Collection
    {
        return $this->extensions;
    }

    /**
     * Add middleware to the processing pipeline
     */
    public function addMiddleware(string $name, callable $middleware, int $priority = 10): void
    {
        $this->middleware->push([
            'name' => $name,
            'middleware' => $middleware,
            'priority' => $priority,
        ]);

        // Sort by priority
        $this->middleware = $this->middleware->sortBy('priority');
    }

    /**
     * Process data through middleware pipeline
     */
    public function processMiddleware(string $type, mixed $data): mixed
    {
        $middleware = $this->middleware->filter(function ($item) use ($type) {
            return str_contains($item['name'], $type) || $item['name'] === 'global';
        });

        foreach ($middleware as $item) {
            $data = call_user_func($item['middleware'], $data);
        }

        return $data;
    }

    /**
     * Check extension dependencies
     */
    protected function checkDependencies(ReactExtensionInterface $extension): void
    {
        foreach ($extension->getDependencies() as $dependency) {
            if (!$this->extensions->has($dependency)) {
                throw new InvalidArgumentException(
                    "Extension [{$extension->getName()}] requires [{$dependency}] which is not registered."
                );
            }
        }
    }
}