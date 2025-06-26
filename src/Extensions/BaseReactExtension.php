<?php

namespace HadyFayed\ReactWrapper\Extensions;

use HadyFayed\ReactWrapper\Contracts\ReactExtensionInterface;

abstract class BaseReactExtension implements ReactExtensionInterface
{
    protected string $name;
    protected string $version = '2.0.1';
    protected array $dependencies = [];

    public function getName(): string
    {
        return $this->name ?? static::class;
    }

    public function getVersion(): string
    {
        return $this->version;
    }

    public function getDependencies(): array
    {
        return $this->dependencies;
    }

    /**
     * Boot the extension
     */
    public function boot(): void
    {
        // Default implementation - override in concrete extensions
    }

    /**
     * Register the extension
     */
    public function register(): void
    {
        // Default implementation - override in concrete extensions
    }
}
