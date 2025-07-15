<?php

namespace HadyFayed\ReactWrapper\Forms\Components;

use Filament\Forms\Components\Field;
use HadyFayed\ReactWrapper\Components\BaseReactComponent;
use Illuminate\Support\Str;

class ReactField extends Field
{
    public function render(): \Illuminate\Contracts\View\View
    {
        $html = $this->generateFieldHTML();
        
        // Create a simple view that returns the HTML directly
        return new class($html) implements \Illuminate\Contracts\View\View {
            private string $html;
            
            public function __construct(string $html) {
                $this->html = $html;
            }
            
            public function render(): string {
                return $this->html;
            }
            
            public function with($key, $value = null) {
                return $this;
            }
            
            public function __toString(): string {
                return $this->html;
            }
            
            public function name() {
                return 'react-field-view';
            }
            
            public function getData() {
                return [];
            }
        };
    }

    protected function generateFieldHTML(): string
    {
        $script = $this->generateFieldScript();

        return "
            <div id=\"{$this->containerId}\" style=\"height: {$this->height}px; width: 100%;\"></div>
            <script>
                {$script}
            </script>
        ";
    }

    public static function make(string $name): static
    {
        $static = parent::make($name);
        return $static;
    }

    protected BaseReactComponent $reactComponent;
    protected bool $resizable = false;
    protected bool $fullscreen = false;
    protected array $toolbar = [];
    protected array $validationRules = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->reactComponent = new class extends BaseReactComponent {
            protected function getContainerPrefix(): string { return 'react-field'; }
            protected function getComponentType(): string { return 'field'; }
            protected function getSpecificProps(): array { return []; }
        };
        
        $this->reactComponent->initialize();

        // Set up state management
        $this->afterStateHydrated(function (ReactField $component, $state) {
            $this->reactComponent->shareComponentData($state);
        });

        $this->afterStateUpdated(function (ReactField $component, $state) {
            $this->reactComponent->shareComponentData($state);
        });

        // Validation integration
        $this->rule(function () {
            return $this->getValidationRules();
        });
    }

    public function component(string $componentName): static
    {
        $this->reactComponent->component($componentName);
        return $this;
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

    public function lazy(bool $lazy = true): static
    {
        $this->reactComponent->lazy($lazy);
        return $this;
    }

    public function reactive(bool $reactive = true): static
    {
        $this->reactComponent->reactive($reactive);
        return $this;
    }

    public function validationRules(array $rules): static
    {
        $this->validationRules = $rules;
        return $this;
    }

    public function dependencies(array $dependencies): static
    {
        $this->reactComponent->dependencies($dependencies);
        return $this;
    }

    public function getComponentName(): string
    {
        return $this->reactComponent->getComponentName();
    }

    public function getComponentProps(): array
    {
        $currentData = $this->getState();
        
        // Get base props from react component
        $baseProps = $this->reactComponent->getComponentProps();
        
        // Add field-specific props
        $fieldProps = [
            'initialData' => $currentData ?? [],
            'fieldName' => $this->getName(),
            'fieldId' => $this->getId(),
            'resizable' => $this->resizable,
            'fullscreen' => $this->fullscreen,
            'toolbar' => $this->toolbar,
            'validation' => $this->getValidationRules(),
            'errors' => $this->getValidationErrors(),
            'required' => $this->isRequired(),
            'disabled' => $this->isDisabled(),
            'hidden' => $this->isHidden(),
        ];

        return array_merge($baseProps, $fieldProps);
    }

    public function getContainerId(): string
    {
        return $this->reactComponent->getContainerId();
    }

    public function getHeight(): int
    {
        return $this->reactComponent->getHeight();
    }


    public function getValidationRules(): array
    {
        $rules = $this->validationRules;

        // Add built-in Filament rules
        if ($this->isRequired()) {
            $rules[] = 'required';
        }

        return $rules;
    }

    public function getValidationErrors(): array
    {
        $errors = [];

        if ($this->getContainer() && method_exists($this->getContainer(), 'getErrors')) {
            $fieldErrors = $this->getContainer()->getErrors($this->getName());
            if ($fieldErrors) {
                $errors = $fieldErrors->toArray();
            }
        }

        return $errors;
    }



    public function getAssetData(): array
    {
        return $this->reactComponent->getAssetData();
    }

    public function generateFieldScript(): string
    {
        return $this->reactComponent->generateScript();
    }
}
