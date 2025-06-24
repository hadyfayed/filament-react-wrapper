<?php

namespace HadyFayed\ReactWrapper\Forms\Components;

use Filament\Forms\Components\Field;
use Illuminate\Support\Str;

class ReactField extends Field
{
    protected string $view = 'react-wrapper::filament.fields.react-field';

    protected string $componentName = '';
    protected array $componentProps = [];
    protected string $containerId;
    protected int $height = 400;
    protected bool $resizable = false;
    protected bool $fullscreen = false;
    protected array $toolbar = [];

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->containerId = 'react-field-' . Str::random(8);
        
        // Temporarily removed state hydration closures to isolate closure issue
        // Will add back after resolving the closure problem
    }

    public function component(string $componentName): static
    {
        $this->componentName = $componentName;
        return $this;
    }

    public function props(array $props): static
    {
        $this->componentProps = array_merge($this->componentProps, $props);
        return $this;
    }

    public function height(int $height): static
    {
        $this->height = $height;
        return $this;
    }

    public function resizable(bool $resizable = true): static
    {
        $this->resizable = $resizable;
        return $this;
    }

    public function fullscreen(bool $fullscreen = true): static
    {
        $this->fullscreen = $fullscreen;
        return $this;
    }

    public function toolbar(array $toolbar): static
    {
        $this->toolbar = $toolbar;
        return $this;
    }

    public function getComponentName(): string
    {
        return $this->componentName;
    }

    public function getComponentProps(): array
    {
        $currentData = $this->getState();
        
        $baseProps = [
            'initialData' => $currentData ?? [],
            'height' => $this->height,
            'resizable' => $this->resizable,
            'fullscreen' => $this->fullscreen,
            'toolbar' => $this->toolbar,
        ];
        
        return array_merge($this->componentProps, $baseProps);
    }

    public function getContainerId(): string
    {
        return $this->containerId;
    }

    public function getHeight(): int
    {
        return $this->height;
    }

    public function isResizable(): bool
    {
        return $this->resizable;
    }

    public function hasFullscreen(): bool
    {
        return $this->fullscreen;
    }

    public function getToolbar(): array
    {
        return $this->toolbar;
    }
}