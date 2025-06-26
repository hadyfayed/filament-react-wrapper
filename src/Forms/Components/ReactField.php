<?php

namespace HadyFayed\ReactWrapper\Forms\Components;

use Filament\Forms\Components\Field;
use HadyFayed\ReactWrapper\Services\AssetManager;
use HadyFayed\ReactWrapper\Services\VariableShareService;
use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;
use Illuminate\Support\Str;
use Illuminate\Support\Js;

class ReactField extends Field
{
    protected string $view = 'react-wrapper::filament.fields.react-field';
    
    public static function make(string $name): static
    {
        $static = parent::make($name);
        return $static;
    }

    protected string $componentName = '';
    protected array $componentProps = [];
    protected string $containerId;
    protected int $height = 400;
    protected bool $resizable = false;
    protected bool $fullscreen = false;
    protected array $toolbar = [];
    protected bool $lazy = true;
    protected bool $reactive = true;
    protected array $validationRules = [];
    protected array $dependencies = [];

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->containerId = 'react-field-' . Str::random(8);
        
        // Register component with asset manager for lazy loading
        $this->registerComponent();
        
        // Set up state management
        $this->afterStateHydrated(function (ReactField $component, $state) {
            // Share field-specific data
            $this->shareFieldData($state);
        });
        
        $this->afterStateUpdated(function (ReactField $component, $state) {
            // Handle real-time updates
            if ($this->reactive) {
                $this->shareFieldData($state);
            }
        });
        
        // Validation integration
        $this->rule(function () {
            return $this->getValidationRules();
        });
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
    
    public function lazy(bool $lazy = true): static
    {
        $this->lazy = $lazy;
        return $this;
    }
    
    public function reactive(bool $reactive = true): static
    {
        $this->reactive = $reactive;
        return $this;
    }
    
    public function validationRules(array $rules): static
    {
        $this->validationRules = $rules;
        return $this;
    }
    
    public function dependencies(array $dependencies): static
    {
        $this->dependencies = $dependencies;
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
            'fieldName' => $this->getName(),
            'fieldId' => $this->getId(),
            'containerId' => $this->containerId,
            'height' => $this->height,
            'resizable' => $this->resizable,
            'fullscreen' => $this->fullscreen,
            'toolbar' => $this->toolbar,
            'lazy' => $this->lazy,
            'reactive' => $this->reactive,
            'validation' => $this->getValidationRules(),
            'errors' => $this->getValidationErrors(),
            'required' => $this->isRequired(),
            'disabled' => $this->isDisabled(),
            'hidden' => $this->isHidden(),
            'dependencies' => $this->dependencies,
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
    
    protected function registerComponent(): void
    {
        $assetManager = app(AssetManager::class);
        $registry = app(ReactComponentRegistry::class);
        
        if (!$registry->has($this->componentName)) {
            $registry->register($this->componentName, $this->componentName, [
                'lazy' => $this->lazy,
                'filament_field' => true,
                'dependencies' => $this->dependencies,
            ]);
        }
        
        // Queue component for loading
        if ($this->lazy) {
            $assetManager->queueComponent($this->componentName);
        }
    }
    
    protected function shareFieldData($state): void
    {
        $variableShare = app(VariableShareService::class);
        
        $fieldData = [
            'state' => $state,
            'name' => $this->getName(),
            'id' => $this->getId(),
            'label' => $this->getLabel(),
            'placeholder' => $this->getPlaceholder(),
            'help_text' => $this->getHelperText(),
            'hint' => $this->getHint(),
            'form_component' => true,
        ];
        
        $variableShare->shareToComponent(
            $this->componentName, 
            'field_' . $this->getName(), 
            $fieldData
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
    
    public function generateFieldScript(): string
    {
        $props = Js::from($this->getComponentProps());
        $assetData = Js::from($this->getAssetData());
        
        return "
            window.ReactWrapper = window.ReactWrapper || {};
            window.ReactWrapper.fields = window.ReactWrapper.fields || {};
            window.ReactWrapper.fields['{$this->containerId}'] = {
                props: {$props},
                assets: {$assetData}
            };
            
            if (window.ReactWrapper.loadComponent) {
                window.ReactWrapper.loadComponent('{$this->componentName}').then(() => {
                    console.log('React field component loaded: {$this->componentName}');
                });
            }
        ";
    }
}