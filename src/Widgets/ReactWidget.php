<?php

namespace HadyFayed\ReactWrapper\Widgets;

use Filament\Widgets\Widget;
use HadyFayed\ReactWrapper\Components\BaseReactComponent;
use Illuminate\Support\Str;
use Livewire\Attributes\On;
use Livewire\Attributes\Reactive;

class ReactWidget extends Widget
{
    public function render(): \Illuminate\Support\HtmlString
    {
        $viewData = $this->getViewData();
        return new \Illuminate\Support\HtmlString($this->generateWidgetHTML($viewData));
    }

    protected function generateWidgetHTML(array $viewData): string
    {
        $script = $viewData['script'];
        $containerId = $viewData['containerId'];
        $height = $viewData['height'];

        return "
            <div id=\"{$containerId}\" style=\"height: {$height}px; width: 100%;\"></div>
            <script>
                {$script}
            </script>
        ";
    }

    protected int | string | array $columnSpan = 'full';

    protected static ?int $sort = null;

    protected static bool $isLazy = false;

    protected BaseReactComponent $reactComponent;
    protected array|string|int $columnSpan = 'full';
    protected bool $polling = false;
    protected int|string $pollingInterval = '5s';
    protected array $filters = [];
    protected string $theme = 'default';

    public function __construct()
    {
        parent::__construct();
        
        $this->reactComponent = new class extends BaseReactComponent {
            protected function getContainerPrefix(): string { return 'react-widget'; }
            protected function getComponentType(): string { return 'widget'; }
            protected function getSpecificProps(): array { return []; }
        };
        
        $this->reactComponent->initialize();
    }

    public static function component(string $componentName): static
    {
        $widget = new static();
        $widget->reactComponent->component($componentName);
        return $widget;
    }

    public function props(array $props): static
    {
        $this->reactComponent->props($props);
        return $this;
    }

    public function height(int $height): static
    {
        $this->reactComponent->height($height);
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
        $this->reactComponent->reactive($reactive);
        return $this;
    }

    public function dependencies(array $dependencies): static
    {
        $this->reactComponent->dependencies($dependencies);
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
        return $this->reactComponent->getComponentName();
    }

    public function getComponentProps(): array
    {
        // Get base props from react component
        $baseProps = $this->reactComponent->getComponentProps();
        
        // Add widget-specific props
        $widgetProps = [
            'widget' => true,
            'widgetId' => $this->getId(),
            'columnSpan' => $this->columnSpan,
            'polling' => $this->polling,
            'pollingInterval' => $this->pollingInterval,
            'filters' => $this->filters,
            'theme' => $this->theme,
            'data' => $this->getData(),
            'user' => auth()->user()?->only(['id', 'name', 'email']),
        ];

        return array_merge($baseProps, $widgetProps);
    }

    public function getContainerId(): string
    {
        return $this->reactComponent->getContainerId();
    }

    public function getHeight(): int
    {
        return $this->reactComponent->getHeight();
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

    protected function shareWidgetData(): void
    {
        $widgetData = [
            'id' => $this->getId(),
            'columnSpan' => $this->columnSpan,
            'polling' => $this->polling,
            'pollingInterval' => $this->pollingInterval,
            'data' => $this->getData(),
        ];

        $this->reactComponent->shareComponentData($widgetData);
    }

    public function getAssetData(): array
    {
        return $this->reactComponent->getAssetData();
    }

    public function generateWidgetScript(): string
    {
        return $this->reactComponent->generateScript();
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
        $this->shareWidgetData();
    }

    public static function canView(): bool
    {
        return true;
    }
}
