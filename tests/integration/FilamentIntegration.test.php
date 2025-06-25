<?php

namespace HadyFayed\ReactWrapper\Tests\Integration;

use HadyFayed\ReactWrapper\Forms\Components\ReactField;
use HadyFayed\ReactWrapper\Widgets\ReactWidget;
use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;
use HadyFayed\ReactWrapper\Tests\TestCase;
use Filament\Forms\Form;
use Filament\Forms\Components\TextInput;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FilamentIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected ReactComponentRegistry $registry;

    protected function setUp(): void
    {
        parent::setUp();
        $this->registry = app(ReactComponentRegistry::class);
    }

    /** @test */
    public function it_can_create_react_field_component()
    {
        $field = ReactField::make('test_field')
            ->component('TestComponent')
            ->props(['title' => 'Test Title'])
            ->statePath('form.data');

        $this->assertEquals('test_field', $field->getName());
        $this->assertEquals('TestComponent', $field->getComponent());
        $this->assertEquals(['title' => 'Test Title'], $field->getProps());
        $this->assertEquals('form.data', $field->getStatePath());
    }

    /** @test */
    public function it_can_set_field_dimensions()
    {
        $field = ReactField::make('test_field')
            ->component('TestComponent')
            ->height(400)
            ->width('100%');

        $this->assertEquals(400, $field->getHeight());
        $this->assertEquals('100%', $field->getWidth());
    }

    /** @test */
    public function it_can_configure_field_reactivity()
    {
        $field = ReactField::make('test_field')
            ->component('TestComponent')
            ->reactive()
            ->live()
            ->debounce(300);

        $this->assertTrue($field->isReactive());
        $this->assertTrue($field->isLive());
        $this->assertEquals(300, $field->getDebounce());
    }

    /** @test */
    public function it_can_set_field_callbacks()
    {
        $callback = function ($state) {
            return $state;
        };

        $field = ReactField::make('test_field')
            ->component('TestComponent')
            ->afterStateUpdated($callback);

        $this->assertEquals($callback, $field->getAfterStateUpdatedCallback());
    }

    /** @test */
    public function it_can_create_react_widget()
    {
        $widget = new class extends ReactWidget {
            protected string $component = 'TestWidget';

            protected function getProps(): array
            {
                return [
                    'title' => 'Test Widget',
                    'data' => ['item1', 'item2', 'item3']
                ];
            }

            protected function getHeight(): ?string
            {
                return '300px';
            }

            protected function getStatePath(): ?string
            {
                return 'widgets.test';
            }
        };

        $this->assertEquals('TestWidget', $widget->getComponent());
        $this->assertEquals([
            'title' => 'Test Widget',
            'data' => ['item1', 'item2', 'item3']
        ], $widget->getProps());
        $this->assertEquals('300px', $widget->getHeight());
        $this->assertEquals('widgets.test', $widget->getStatePath());
    }

    /** @test */
    public function it_can_register_component_from_php()
    {
        $this->registry->register([
            'name' => 'PHPRegisteredComponent',
            'component_path' => 'resources/js/components/TestComponent.tsx',
            'default_props' => [
                'title' => 'PHP Registered',
                'editable' => true
            ],
            'metadata' => [
                'category' => 'test',
                'description' => 'Component registered from PHP'
            ]
        ]);

        $this->assertTrue($this->registry->has('PHPRegisteredComponent'));
        
        $component = $this->registry->get('PHPRegisteredComponent');
        $this->assertEquals('PHPRegisteredComponent', $component['name']);
        $this->assertEquals('resources/js/components/TestComponent.tsx', $component['component_path']);
        $this->assertEquals('PHP Registered', $component['default_props']['title']);
        $this->assertEquals('test', $component['metadata']['category']);
    }

    /** @test */
    public function it_can_register_multiple_components()
    {
        $components = [
            [
                'name' => 'Component1',
                'component_path' => 'resources/js/components/Component1.tsx',
                'default_props' => ['prop1' => 'value1']
            ],
            [
                'name' => 'Component2',
                'component_path' => 'resources/js/components/Component2.tsx',
                'default_props' => ['prop2' => 'value2']
            ]
        ];

        $this->registry->registerMany($components);

        $this->assertTrue($this->registry->has('Component1'));
        $this->assertTrue($this->registry->has('Component2'));
        
        $this->assertEquals(2, $this->registry->count());
    }

    /** @test */
    public function it_can_get_registry_statistics()
    {
        $this->registry->register([
            'name' => 'AsyncComponent',
            'component_path' => 'resources/js/components/AsyncComponent.tsx',
            'is_async' => true,
            'config' => ['lazy' => true, 'cache' => true]
        ]);

        $this->registry->register([
            'name' => 'SyncComponent',
            'component_path' => 'resources/js/components/SyncComponent.tsx',
            'is_async' => false
        ]);

        $stats = $this->registry->getStats();

        $this->assertEquals(2, $stats['total_components']);
        $this->assertEquals(1, $stats['async_components']);
        $this->assertEquals(1, $stats['sync_components']);
        $this->assertEquals(1, $stats['cached_components']);
        $this->assertEquals(1, $stats['lazy_components']);
    }

    /** @test */
    public function it_can_unregister_component()
    {
        $this->registry->register([
            'name' => 'ToRemove',
            'component_path' => 'resources/js/components/ToRemove.tsx'
        ]);

        $this->assertTrue($this->registry->has('ToRemove'));
        
        $removed = $this->registry->unregister('ToRemove');
        $this->assertTrue($removed);
        $this->assertFalse($this->registry->has('ToRemove'));
    }

    /** @test */
    public function it_returns_false_when_unregistering_non_existent_component()
    {
        $removed = $this->registry->unregister('NonExistent');
        $this->assertFalse($removed);
    }

    /** @test */
    public function it_can_clear_all_components()
    {
        $this->registry->register([
            'name' => 'Component1',
            'component_path' => 'resources/js/components/Component1.tsx'
        ]);

        $this->registry->register([
            'name' => 'Component2',
            'component_path' => 'resources/js/components/Component2.tsx'
        ]);

        $this->assertEquals(2, $this->registry->count());

        $this->registry->clear();
        $this->assertEquals(0, $this->registry->count());
    }

    /** @test */
    public function it_can_get_all_registered_components()
    {
        $this->registry->register([
            'name' => 'Component1',
            'component_path' => 'resources/js/components/Component1.tsx',
            'metadata' => ['category' => 'widgets']
        ]);

        $this->registry->register([
            'name' => 'Component2',
            'component_path' => 'resources/js/components/Component2.tsx',
            'metadata' => ['category' => 'forms']
        ]);

        $components = $this->registry->getRegistered();

        $this->assertCount(2, $components);
        $this->assertArrayHasKey('Component1', $components);
        $this->assertArrayHasKey('Component2', $components);
        $this->assertEquals('widgets', $components['Component1']['metadata']['category']);
        $this->assertEquals('forms', $components['Component2']['metadata']['category']);
    }

    /** @test */
    public function it_validates_component_registration_data()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Component name is required');

        $this->registry->register([
            'component_path' => 'resources/js/components/TestComponent.tsx'
        ]);
    }

    /** @test */
    public function it_validates_component_path()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Component path is required');

        $this->registry->register([
            'name' => 'TestComponent'
        ]);
    }

    /** @test */
    public function it_can_create_form_with_react_field()
    {
        $form = Form::make()
            ->schema([
                TextInput::make('name')
                    ->required(),
                
                ReactField::make('profile_editor')
                    ->component('UserProfileEditor')
                    ->props([
                        'allowImageUpload' => true,
                        'maxImageSize' => '2MB'
                    ])
                    ->statePath('profile')
                    ->reactive()
                    ->afterStateUpdated(function ($state) {
                        // Handle state updates
                        return $state;
                    }),
                    
                ReactField::make('data_visualization')
                    ->component('ChartComponent')
                    ->props([
                        'type' => 'line',
                        'data' => []
                    ])
                    ->height(400)
                    ->width('100%')
            ]);

        $schema = $form->getSchema();
        $this->assertCount(3, $schema);
        
        $reactFields = array_filter($schema, fn($component) => $component instanceof ReactField);
        $this->assertCount(2, $reactFields);
    }

    /** @test */
    public function it_can_handle_widget_visibility()
    {
        $visibleWidget = new class extends ReactWidget {
            protected string $component = 'VisibleWidget';

            public static function canView(): bool
            {
                return true;
            }
        };

        $hiddenWidget = new class extends ReactWidget {
            protected string $component = 'HiddenWidget';

            public static function canView(): bool
            {
                return false;
            }
        };

        $this->assertTrue($visibleWidget::canView());
        $this->assertFalse($hiddenWidget::canView());
    }
}