<?php

namespace HadyFayed\ReactWrapper\Mapping;

class ReactPhpFunctionMap
{
    /**
     * React to PHP function mapping with integration percentages
     */
    protected array $functionMap = [
        // State Management - 95% integration
        'useState' => [
            'php_equivalent' => 'session(), cache(), request()->session()',
            'integration_percentage' => 95,
            'description' => 'State management via Laravel session/cache',
            'examples' => [
                'react' => 'const [user, setUser] = useState(null);',
                'php' => 'session(["user" => $user]); session("user");'
            ],
            'integration_methods' => [
                'VariableShareService::shareGlobal("state", $data)'
            ]
        ],

        // Effect Hook - 90% integration  
        'useEffect' => [
            'php_equivalent' => 'Event::listen(), Observer, Job dispatch',
            'integration_percentage' => 90,
            'description' => 'Side effects via Laravel events and jobs',
            'examples' => [
                'react' => 'useEffect(() => { fetchData(); }, [dependency]);',
                'php' => 'Event::listen("ModelUpdated", fn() => dispatch(new ProcessData));'
            ],
            'integration_methods' => [
                'Event::dispatch("react.effect", $data)'
            ]
        ],

        // Context - 85% integration
        'useContext' => [
            'php_equivalent' => 'app()->make(), resolve(), config()',
            'integration_percentage' => 85,
            'description' => 'Global state via Laravel service container',
            'examples' => [
                'react' => 'const theme = useContext(ThemeContext);',
                'php' => '$theme = app("theme.manager")->getCurrentTheme();'
            ],
            'integration_methods' => [
                'VariableShareService::shareGlobal("context", $data)'
            ]
        ],

        // Reducer - 80% integration
        'useReducer' => [
            'php_equivalent' => 'Command pattern, Action classes',
            'integration_percentage' => 80,
            'description' => 'Complex state updates via Laravel actions',
            'examples' => [
                'react' => 'const [state, dispatch] = useReducer(reducer, initialState);',
                'php' => 'app(UpdateUserAction::class)->execute($user, $payload);'
            ],
            'integration_methods' => [
                'Action classes with execute() method',
                'Command pattern implementation'
            ]
        ],

        // Callback - 88% integration
        'useCallback' => [
            'php_equivalent' => 'Cache::remember(), memoization',
            'integration_percentage' => 88,
            'description' => 'Function memoization via Laravel cache',
            'examples' => [
                'react' => 'const memoizedFn = useCallback(() => {...}, [deps]);',
                'php' => 'Cache::remember("callback_result", 3600, fn() => expensiveOperation());'
            ],
            'integration_methods' => [
                'Cache::remember() for expensive operations'
            ]
        ],

        // Memo - 85% integration
        'useMemo' => [
            'php_equivalent' => 'Cache::remember(), computed properties',
            'integration_percentage' => 85,
            'description' => 'Value memoization via caching',
            'examples' => [
                'react' => 'const expensiveValue = useMemo(() => calculate(), [input]);',
                'php' => 'Cache::remember("computed_value", 3600, fn() => $this->calculate());'
            ],
            'integration_methods' => [
                'Cache::remember() for computed values'
            ]
        ],

        // Ref - 75% integration
        'useRef' => [
            'php_equivalent' => 'Session references, model binding',
            'integration_percentage' => 75,
            'description' => 'Reference management via session/cache',
            'examples' => [
                'react' => 'const inputRef = useRef(null);',
                'php' => 'session(["form_refs" => ["input_id" => $inputElement]]);'
            ],
            'integration_methods' => [
                'Session-based DOM reference tracking'
            ]
        ],

        // Component Lifecycle - 92% integration
        'componentDidMount' => [
            'php_equivalent' => 'Boot methods, Service Provider boot()',
            'integration_percentage' => 92,
            'description' => 'Initialization via Laravel boot cycle',
            'examples' => [
                'react' => 'componentDidMount() { this.initializeComponent(); }',
                'php' => 'public function boot() { $this->initializeService(); }'
            ],
            'integration_methods' => [
                'Service Provider boot() methods'
            ]
        ],

        // Props - 98% integration
        'props' => [
            'php_equivalent' => 'Method parameters, dependency injection',
            'integration_percentage' => 98,
            'description' => 'Data passing via method parameters and DI',
            'examples' => [
                'react' => 'function Component({ user, posts }) { ... }',
                'php' => 'public function show(User $user, PostRepository $posts) { ... }'
            ],
            'integration_methods' => [
                'VariableShareService::shareToComponent($name, $props)'
            ]
        ],

        // Event Handling - 93% integration
        'onClick/onChange' => [
            'php_equivalent' => 'Route handlers, Event listeners',
            'integration_percentage' => 93,
            'description' => 'Event handling via routes and Laravel events',
            'examples' => [
                'react' => 'onClick={() => handleClick()}',
                'php' => 'Route::post("/handle-click", [Controller::class, "handleClick"]);'
            ],
            'integration_methods' => [
                'Route::post() for form submissions'
            ]
        ],

        // Form Handling - 96% integration
        'form submission' => [
            'php_equivalent' => 'Request validation, Form Requests',
            'integration_percentage' => 96,
            'description' => 'Form processing via Laravel validation',
            'examples' => [
                'react' => 'onSubmit={(data) => submitForm(data)}',
                'php' => 'public function store(CreateUserRequest $request) { ... }'
            ],
            'integration_methods' => [
                'Form Request classes for validation'
            ]
        ],

        // Data Fetching - 94% integration
        'fetch/axios' => [
            'php_equivalent' => 'HTTP Client, Eloquent queries',
            'integration_percentage' => 94,
            'description' => 'Data fetching via Laravel HTTP and Eloquent',
            'examples' => [
                'react' => 'fetch("/api/users").then(res => res.json())',
                'php' => 'Http::get("external-api")->json(); User::all();'
            ],
            'integration_methods' => [
                'API Resource classes for JSON responses'
            ]
        ],

        // Routing - 89% integration
        'React Router' => [
            'php_equivalent' => 'Laravel Router, Route model binding',
            'integration_percentage' => 89,
            'description' => 'Navigation via Laravel routes',
            'examples' => [
                'react' => '<Route path="/users/:id" component={UserDetail} />',
                'php' => 'Route::get("/users/{user}", [UserController::class, "show"]);'
            ],
            'integration_methods' => [
                'Route model binding for automatic injection'
            ]
        ],

        // Authentication - 97% integration
        'auth context' => [
            'php_equivalent' => 'Auth facade, Guards, Policies',
            'integration_percentage' => 97,
            'description' => 'Authentication via Laravel Auth system',
            'examples' => [
                'react' => 'const { user, login, logout } = useAuth();',
                'php' => 'Auth::user(); Auth::login($user); Auth::logout();'
            ],
            'integration_methods' => [
                'Auth::user() shared globally'
            ]
        ],

        // Error Handling - 91% integration
        'Error Boundaries' => [
            'php_equivalent' => 'Exception handlers, try-catch',
            'integration_percentage' => 91,
            'description' => 'Error handling via Laravel exception system',
            'examples' => [
                'react' => 'componentDidCatch(error, errorInfo) { ... }',
                'php' => 'try { ... } catch (Exception $e) { report($e); }'
            ],
            'integration_methods' => [
                'App\\Exceptions\\Handler for global errors'
            ]
        ],

        // Performance - 87% integration
        'React.lazy/Suspense' => [
            'php_equivalent' => 'Lazy collections, Queue jobs',
            'integration_percentage' => 87,
            'description' => 'Lazy loading via Laravel lazy collections and queues',
            'examples' => [
                'react' => 'const LazyComponent = React.lazy(() => import("./Component"));',
                'php' => 'LazyCollection::make($generator)->chunk(100)->each(...);'
            ],
            'integration_methods' => [
                'AssetManager::queueComponent() for lazy loading'
            ]
        ],

        // Testing - 88% integration
        'Jest/React Testing' => [
            'php_equivalent' => 'PHPUnit, Feature tests',
            'integration_percentage' => 88,
            'description' => 'Testing via PHPUnit and Laravel testing',
            'examples' => [
                'react' => 'test("renders component", () => { render(<Component />); });',
                'php' => '$this->get("/component")->assertStatus(200)->assertSee("content");'
            ],
            'integration_methods' => [
                'Feature tests for full integration testing'
            ]
        ]
    ];

    /**
     * Get all function mappings
     */
    public function getAllMappings(): array
    {
        return $this->functionMap;
    }

    /**
     * Get mapping for specific React function
     */
    public function getMapping(string $reactFunction): ?array
    {
        return $this->functionMap[$reactFunction] ?? null;
    }

    /**
     * Get mappings by integration percentage range
     */
    public function getMappingsByPercentage(int $minPercentage = 0, int $maxPercentage = 100): array
    {
        return array_filter($this->functionMap, function ($mapping) use ($minPercentage, $maxPercentage) {
            $percentage = $mapping['integration_percentage'];
            return $percentage >= $minPercentage && $percentage <= $maxPercentage;
        });
    }

    /**
     * Get average integration percentage
     */
    public function getAverageIntegrationPercentage(): float
    {
        $percentages = array_column($this->functionMap, 'integration_percentage');
        return round(array_sum($percentages) / count($percentages), 2);
    }

    /**
     * Get integration statistics
     */
    public function getIntegrationStats(): array
    {
        $percentages = array_column($this->functionMap, 'integration_percentage');
        
        return [
            'total_functions' => count($this->functionMap),
            'average_integration' => $this->getAverageIntegrationPercentage(),
            'highest_integration' => max($percentages),
            'lowest_integration' => min($percentages),
            'highly_integrated' => count($this->getMappingsByPercentage(90, 100)),
            'moderately_integrated' => count($this->getMappingsByPercentage(70, 89)),
            'low_integration' => count($this->getMappingsByPercentage(0, 69)),
            'breakdown_by_category' => $this->getCategoryBreakdown(),
        ];
    }

    /**
     * Get breakdown by functional category
     */
    protected function getCategoryBreakdown(): array
    {
        $categories = [
            'State Management' => ['useState', 'useReducer', 'useContext'],
            'Performance' => ['useCallback', 'useMemo', 'React.lazy/Suspense'],
            'Lifecycle' => ['useEffect', 'componentDidMount'],
            'Data & Forms' => ['props', 'form submission', 'fetch/axios'],
            'User Interaction' => ['onClick/onChange', 'Routing', 'auth context'],
            'Development' => ['useRef', 'Error Boundaries', 'Jest/React Testing'],
        ];

        $breakdown = [];
        foreach ($categories as $category => $functions) {
            $percentages = [];
            foreach ($functions as $function) {
                if (isset($this->functionMap[$function])) {
                    $percentages[] = $this->functionMap[$function]['integration_percentage'];
                }
            }
            
            $breakdown[$category] = [
                'function_count' => count($functions),
                'average_integration' => count($percentages) > 0 ? round(array_sum($percentages) / count($percentages), 2) : 0,
                'functions' => $functions,
            ];
        }

        return $breakdown;
    }

    /**
     * Generate integration report
     */
    public function generateIntegrationReport(): string
    {
        $stats = $this->getIntegrationStats();
        
        $report = "# React-PHP Integration Report\n\n";
        $report .= "## Overall Statistics\n";
        $report .= "- **Total Functions Mapped**: {$stats['total_functions']}\n";
        $report .= "- **Average Integration**: {$stats['average_integration']}%\n";
        $report .= "- **Highest Integration**: {$stats['highest_integration']}%\n";
        $report .= "- **Lowest Integration**: {$stats['lowest_integration']}%\n\n";
        
        $report .= "## Integration Levels\n";
        $report .= "- **Highly Integrated (90-100%)**: {$stats['highly_integrated']} functions\n";
        $report .= "- **Moderately Integrated (70-89%)**: {$stats['moderately_integrated']} functions\n";
        $report .= "- **Low Integration (0-69%)**: {$stats['low_integration']} functions\n\n";
        
        $report .= "## Category Breakdown\n";
        foreach ($stats['breakdown_by_category'] as $category => $data) {
            $report .= "### {$category}\n";
            $report .= "- **Average Integration**: {$data['average_integration']}%\n";
            $report .= "- **Functions**: " . implode(', ', $data['functions']) . "\n\n";
        }
        
        $report .= "## Detailed Function Mappings\n";
        foreach ($this->functionMap as $reactFunction => $mapping) {
            $report .= "### {$reactFunction} ({$mapping['integration_percentage']}%)\n";
            $report .= "**PHP Equivalent**: {$mapping['php_equivalent']}\n\n";
            $report .= "**Description**: {$mapping['description']}\n\n";
            
            if (isset($mapping['examples'])) {
                $report .= "**React Example**:\n```javascript\n{$mapping['examples']['react']}\n```\n\n";
                $report .= "**PHP Example**:\n```php\n{$mapping['examples']['php']}\n```\n\n";
            }
            
            if (isset($mapping['integration_methods'])) {
                $report .= "**Integration Methods**:\n";
                foreach ($mapping['integration_methods'] as $method) {
                    $report .= "- {$method}\n";
                }
                $report .= "\n";
            }
        }
        
        return $report;
    }

    /**
     * Add or update a function mapping
     */
    public function addMapping(string $reactFunction, array $mapping): void
    {
        $this->functionMap[$reactFunction] = $mapping;
    }

    /**
     * Remove a function mapping
     */
    public function removeMapping(string $reactFunction): void
    {
        unset($this->functionMap[$reactFunction]);
    }
}