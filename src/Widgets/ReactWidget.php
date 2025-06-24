<?php

namespace HadyFayed\ReactWrapper\Widgets;

use Filament\Widgets\Widget;
use Illuminate\Support\Str;

class ReactWidget extends Widget
{
    protected static string $view = 'react-wrapper::filament.widgets.react-widget';

    protected string $componentName = '';
    protected array $componentProps = [];
    protected string $containerId;
    protected int $height = 300;
    protected array|string|int $columnSpan = 'full';
    protected bool $lazy = true;

    public function __construct()
    {
        parent::__construct();
        $this->containerId = 'react-widget-' . Str::random(8);
    }

    public static function component(string $componentName): static
    {
        $widget = new static();
        $widget->componentName = $componentName;
        return $widget;
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

    public function getComponentName(): string
    {
        return $this->componentName;
    }

    public function getComponentProps(): array
    {
        return array_merge([
            'height' => $this->height,
            'widget' => true,
        ], $this->componentProps);
    }

    public function getContainerId(): string
    {
        return $this->containerId;
    }

    public function getHeight(): int
    {
        return $this->height;
    }

    protected function getViewData(): array
    {
        return array_merge(parent::getViewData(), [
            'componentName' => $this->getComponentName(),
            'componentProps' => $this->getComponentProps(),
            'containerId' => $this->getContainerId(),
            'height' => $this->getHeight(),
        ]);
    }
}