<?php

namespace HadyFayed\ReactWrapper\Contracts;

interface ReactRegistryInterface
{
    /**
     * Register a React component
     */
    public function register(string $name, string $component, array $config = []): void;

    /**
     * Get a registered component
     */
    public function get(string $name): ?array;

    /**
     * Check if a component is registered
     */
    public function has(string $name): bool;

    /**
     * Get all registered components
     */
    public function all(): array;

    /**
     * Unregister a component
     */
    public function unregister(string $name): void;

    /**
     * Register multiple components at once
     */
    public function registerMany(array $components): void;
}