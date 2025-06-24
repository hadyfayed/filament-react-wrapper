<?php

namespace HadyFayed\ReactWrapper\Services;

use HadyFayed\ReactWrapper\Contracts\ReactRegistryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Event;

class ReactComponentRegistry implements ReactRegistryInterface
{
    protected Collection $components;
    protected Collection $extensions;
    protected array $hooks = [];

    public function __construct()
    {
        $this->components = collect();
        $this->extensions = collect();
    }

    public function register(string $name, string $component, array $config = []): void
    {
        // Fire before registration event
        Event::dispatch('react-wrapper.component.registering', [$name, $component, $config]);

        $this->components->put($name, [
            'component' => $component,
            'config' => array_merge([
                'props' => [],
                'defaultProps' => [],
                'wrappers' => [],
                'middleware' => [],
                'cache' => false,
                'lazy' => false,
            ], $config),
            'registered_at' => now(),
        ]);

        // Fire after registration event
        Event::dispatch('react-wrapper.component.registered', [$name, $component, $config]);
    }

    public function get(string $name): ?array
    {
        return $this->components->get($name);
    }

    public function has(string $name): bool
    {
        return $this->components->has($name);
    }

    public function all(): array
    {
        return $this->components->all();
    }

    public function count(): int
    {
        return $this->components->count();
    }

    public function unregister(string $name): void
    {
        Event::dispatch('react-wrapper.component.unregistering', [$name]);
        
        $this->components->forget($name);
        
        Event::dispatch('react-wrapper.component.unregistered', [$name]);
    }

    public function registerMany(array $components): void
    {
        foreach ($components as $name => $config) {
            if (is_numeric($name) && is_string($config)) {
                $this->register($config, $config);
            } else {
                $this->register($name, $config['component'] ?? $name, $config['config'] ?? []);
            }
        }
    }

    /**
     * Add a hook for component processing
     */
    public function addHook(string $event, callable $callback, int $priority = 10): void
    {
        if (!isset($this->hooks[$event])) {
            $this->hooks[$event] = collect();
        }

        $this->hooks[$event]->push([
            'callback' => $callback,
            'priority' => $priority,
        ]);

        // Sort by priority
        $this->hooks[$event] = $this->hooks[$event]->sortBy('priority');
    }

    /**
     * Execute hooks for an event
     */
    public function executeHooks(string $event, mixed $data = null): mixed
    {
        if (!isset($this->hooks[$event])) {
            return $data;
        }

        foreach ($this->hooks[$event] as $hook) {
            $data = call_user_func($hook['callback'], $data);
        }

        return $data;
    }

    /**
     * Register a component extension
     */
    public function registerExtension(string $name, array $config): void
    {
        $this->extensions->put($name, $config);
        Event::dispatch('react-wrapper.extension.registered', [$name, $config]);
    }

    /**
     * Get all extensions
     */
    public function getExtensions(): Collection
    {
        return $this->extensions;
    }
}