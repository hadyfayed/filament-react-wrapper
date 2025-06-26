<?php

namespace HadyFayed\ReactWrapper\Widgets;

use Filament\Widgets\Widget;
use HadyFayed\ReactWrapper\Services\AssetManager;
use HadyFayed\ReactWrapper\Services\VariableShareService;
use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;
use Illuminate\Support\Str;
use Illuminate\Support\Js;
use Livewire\Attributes\On;
use Livewire\Attributes\Reactive;

class ReactWidget extends Widget
{
    protected static string $view = 'react-wrapper::filament.widgets.react-widget';
    
    protected int | string | array $columnSpan = 'full';
    
    protected static ?int $sort = null;
    
    protected static bool $isLazy = false;

    protected string $componentName = '';
    protected array $componentProps = [];
    protected string $containerId;
    protected int $height = 300;
    protected array|string|int $columnSpan = 'full';
    protected bool $lazy = true;
    protected bool $polling = false;
    protected int|string $pollingInterval = '5s';
    protected bool $reactive = true;
    protected array $dependencies = [];
    protected array $filters = [];
    protected string $theme = 'default';

    public function __construct()
    {
        parent::__construct();
        $this->containerId = 'react-widget-' . Str::random(8);
        $this->registerComponent();
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
    
    public function polling(bool|int|string $interval = true): static
    {
        $this->polling = $interval !== false;
        
        if (is_int($interval) || is_string($interval)) {
            $this->pollingInterval = $interval;
        }
        
        return $this;
    }
    
    public function reactive(bool $reactive = true): static
    {
        $this->reactive = $reactive;
        return $this;
    }
    
    public function dependencies(array $dependencies): static
    {
        $this->dependencies = $dependencies;
        return $this;
    }
    
    public function filters(array $filters): static
    {
        $this->filters = $filters;
        return $this;
    }
    
    public function theme(string $theme): static
    {
        $this->theme = $theme;
        return $this;
    }

    public function getComponentName(): string
    {
        return $this->componentName;
    }

    public function getComponentProps(): array
    {
        $baseProps = [
            'height' => $this->height,
            'widget' => true,
            'widgetId' => $this->getId(),
            'containerId' => $this->containerId,
            'columnSpan' => $this->columnSpan,
            'lazy' => $this->lazy,
            'polling' => $this->polling,
            'pollingInterval' => $this->pollingInterval,
            'reactive' => $this->reactive,
            'dependencies' => $this->dependencies,
            'filters' => $this->filters,
            'theme' => $this->theme,
            'data' => $this->getData(),
            'user' => auth()->user()?->only(['id', 'name', 'email']),
            'csrf_token' => csrf_token(),
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

    protected function getViewData(): array
    {
        return array_merge(parent::getViewData(), [
            'componentName' => $this->getComponentName(),
            'componentProps' => $this->getComponentProps(),
            'containerId' => $this->getContainerId(),
            'height' => $this->getHeight(),
            'assetData' => $this->getAssetData(),
            'script' => $this->generateWidgetScript(),
        ]);
    }
    
    public function getData(): array
    {
        // Override this method in your widget to provide data
        return [];
    }
    
    protected function registerComponent(): void
    {
        $assetManager = app(AssetManager::class);
        $registry = app(ReactComponentRegistry::class);
        
        if (!$registry->has($this->componentName)) {
            $registry->register($this->componentName, $this->componentName, [
                'lazy' => $this->lazy,
                'filament_widget' => true,
                'dependencies' => $this->dependencies,
            ]);
        }
        
        // Queue component for loading
        if ($this->lazy) {
            $assetManager->queueComponent($this->componentName);
        }
        
        // Share widget data
        $this->shareWidgetData();
    }
    
    protected function shareWidgetData(): void
    {
        $variableShare = app(VariableShareService::class);
        
        $widgetData = [
            'id' => $this->getId(),
            'height' => $this->height,
            'columnSpan' => $this->columnSpan,
            'polling' => $this->polling,
            'pollingInterval' => $this->pollingInterval,
            'data' => $this->getData(),
            'widget_component' => true,
        ];
        
        $variableShare->shareToComponent(
            $this->componentName, 
            'widget_' . $this->getId(), 
            $widgetData
        );
    }
    
    public function getAssetData(): array
    {
        return [
            'component' => $this->componentName,
            'lazy' => $this->lazy,
            'dependencies' => $this->dependencies,
        ];
    }
    
    public function generateWidgetScript(): string
    {
        $props = Js::from($this->getComponentProps());
        $assetData = Js::from($this->getAssetData());
        
        return "
            window.ReactWrapper = window.ReactWrapper || {};
            window.ReactWrapper.widgets = window.ReactWrapper.widgets || {};
            window.ReactWrapper.widgets['{$this->containerId}'] = {
                props: {$props},
                assets: {$assetData}
            };
            
            if (window.ReactWrapper.loadComponent) {
                window.ReactWrapper.loadComponent('{$this->componentName}').then(() => {
                    console.log('React widget component loaded: {$this->componentName}');
                });
            }
        ";
    }
    
    #[On('refresh-widget')]
    public function refresh(): void
    {
        // Force refresh widget data
        $this->shareWidgetData();
        
        // Emit update to frontend
        $this->dispatch('widget-refreshed', [
            'widgetId' => $this->getId(),
            'containerId' => $this->containerId,
            'data' => $this->getData(),
        ]);
    }
    
    #[Reactive]
    public function updated($property): void
    {
        if ($this->reactive) {
            $this->shareWidgetData();
        }
    }
    
    public static function canView(): bool
    {
        return true;
    }
}