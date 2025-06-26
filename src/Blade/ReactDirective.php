<?php

namespace HadyFayed\ReactWrapper\Blade;

use Illuminate\Support\Facades\Blade;
use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;
use HadyFayed\ReactWrapper\Factories\ReactComponentFactory;

class ReactDirective
{
    protected ReactComponentRegistry $registry;
    protected ReactComponentFactory $factory;

    public function __construct(ReactComponentRegistry $registry, ReactComponentFactory $factory)
    {
        $this->registry = $registry;
        $this->factory = $factory;
    }

    public function register(): void
    {
        $this->registerReactDirective();
        $this->registerReactComponentDirective();
        $this->registerReactPropsDirective();
        $this->registerReactConfigDirective();
    }

    protected function registerReactDirective(): void
    {
        Blade::directive('react', function ($expression) {
            return "<?php echo app('react-wrapper.factory')->render({$expression}); ?>";
        });
    }

    protected function registerReactComponentDirective(): void
    {
        Blade::directive('reactComponent', function ($expression) {
            $args = $this->parseDirectiveArguments($expression);
            
            if (count($args) < 1) {
                throw new \InvalidArgumentException('reactComponent directive requires at least a component name');
            }
            
            $component = $args[0];
            $props = $args[1] ?? '[]';
            $config = $args[2] ?? '[]';
            
            return "<?php echo app('react-wrapper.factory')->render({$component}, {$props}, {$config}); ?>";
        });
    }

    protected function registerReactPropsDirective(): void
    {
        Blade::directive('reactProps', function ($expression) {
            return "<?php echo 'data-react-props=\"' . htmlspecialchars(json_encode({$expression}), ENT_QUOTES, 'UTF-8') . '\"'; ?>";
        });
    }

    protected function registerReactConfigDirective(): void
    {
        Blade::directive('reactConfig', function ($expression) {
            return "<?php echo 'data-react-config=\"' . htmlspecialchars(json_encode({$expression}), ENT_QUOTES, 'UTF-8') . '\"'; ?>";
        });
    }

    protected function parseDirectiveArguments(string $expression): array
    {
        // Remove outer parentheses if present
        $expression = trim($expression, '()');
        
        if (empty($expression)) {
            return [];
        }
        
        // Simple parser for comma-separated arguments
        // This handles basic cases, might need improvement for complex expressions
        $args = [];
        $currentArg = '';
        $depth = 0;
        $inString = false;
        $stringChar = null;
        
        for ($i = 0; $i < strlen($expression); $i++) {
            $char = $expression[$i];
            
            if (!$inString) {
                if ($char === '"' || $char === "'") {
                    $inString = true;
                    $stringChar = $char;
                } elseif ($char === '[' || $char === '(') {
                    $depth++;
                } elseif ($char === ']' || $char === ')') {
                    $depth--;
                } elseif ($char === ',' && $depth === 0) {
                    $args[] = trim($currentArg);
                    $currentArg = '';
                    continue;
                }
            } else {
                if ($char === $stringChar && ($i === 0 || $expression[$i - 1] !== '\\')) {
                    $inString = false;
                    $stringChar = null;
                }
            }
            
            $currentArg .= $char;
        }
        
        if (!empty($currentArg)) {
            $args[] = trim($currentArg);
        }
        
        return $args;
    }
}