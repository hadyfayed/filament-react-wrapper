<?php

namespace HadyFayed\ReactWrapper\Factories;

use HadyFayed\ReactWrapper\Contracts\ReactComponentInterface;
use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;
use Illuminate\Support\Facades\App;
use InvalidArgumentException;

class ReactComponentFactory
{
    protected ReactComponentRegistry $registry;

    public function __construct(ReactComponentRegistry $registry)
    {
        $this->registry = $registry;
    }

    /**
     * Create a React component instance
     */
    public function create(string $name, array $props = [], array $options = []): ReactComponentInterface
    {
        if (!$this->registry->has($name)) {
            throw new InvalidArgumentException("React component [{$name}] is not registered.");
        }

        $config = $this->registry->get($name);
        $componentClass = $config['component'];

        // Merge props with default props
        $props = array_merge($config['config']['defaultProps'] ?? [], $props);

        // Create component instance
        if (class_exists($componentClass)) {
            $component = App::make($componentClass);
        } else {
            throw new InvalidArgumentException("Component class [{$componentClass}] does not exist.");
        }

        // Configure the component
        if ($component instanceof ReactComponentInterface) {
            $component
                ->withProps($props)
                ->withData($options);
        }

        return $component;
    }

    /**
     * Create multiple components
     */
    public function createMany(array $components): array
    {
        $instances = [];

        foreach ($components as $name => $config) {
            if (is_numeric($name)) {
                $name = $config;
                $config = [];
            }

            $props = $config['props'] ?? [];
            $options = $config['options'] ?? [];

            $instances[$name] = $this->create($name, $props, $options);
        }

        return $instances;
    }

    /**
     * Create a component with lazy loading
     */
    public function createLazy(string $name, array $props = [], array $options = []): ReactComponentInterface
    {
        $options['lazy'] = true;
        return $this->create($name, $props, $options);
    }

    /**
     * Create a component with caching
     */
    public function createCached(string $name, array $props = [], array $options = [], ?string $cacheKey = null): ReactComponentInterface
    {
        $cacheKey = $cacheKey ?? md5($name . serialize($props) . serialize($options));
        
        $options['cache'] = true;
        $options['cacheKey'] = $cacheKey;
        
        return $this->create($name, $props, $options);
    }
}