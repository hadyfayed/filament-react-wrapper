<?php

namespace HadyFayed\ReactWrapper\Contracts;

interface ReactComponentInterface
{
    /**
     * Get the component name
     */
    public function getName(): string;

    /**
     * Get the component properties
     */
    public function getProps(): array;

    /**
     * Get the component configuration
     */
    public function getConfig(): array;

    /**
     * Render the component
     */
    public function render(): string;

    /**
     * Set component data
     */
    public function withData(array $data): static;

    /**
     * Set component props
     */
    public function withProps(array $props): static;
}