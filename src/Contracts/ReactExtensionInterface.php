<?php

namespace HadyFayed\ReactWrapper\Contracts;

interface ReactExtensionInterface
{
    /**
     * Register the extension
     */
    public function register(): void;

    /**
     * Boot the extension
     */
    public function boot(): void;

    /**
     * Get extension name
     */
    public function getName(): string;

    /**
     * Get extension version
     */
    public function getVersion(): string;

    /**
     * Get extension dependencies
     */
    public function getDependencies(): array;
}