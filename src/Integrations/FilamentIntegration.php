<?php

namespace HadyFayed\ReactWrapper\Integrations;

use HadyFayed\ReactWrapper\Services\AssetManager;
use HadyFayed\ReactWrapper\Services\VariableShareService;
use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;
use Illuminate\Support\Facades\Event;

class FilamentIntegration
{
    protected AssetManager $assetManager;
    protected VariableShareService $variableShare;
    protected ReactComponentRegistry $registry;
    protected bool $initialized = false;

    public function __construct(
        AssetManager $assetManager,
        VariableShareService $variableShare,
        ReactComponentRegistry $registry
    ) {
        $this->assetManager = $assetManager;
        $this->variableShare = $variableShare;
        $this->registry = $registry;
    }

    /**
     * Initialize Filament integration without plugin
     */
    public function initialize(): void
    {
        if ($this->initialized || !$this->isFilamentAvailable()) {
            return;
        }

        $this->setupFilamentHooks();
        $this->shareFilamentData();
        $this->registerFilamentAssets();
        
        $this->initialized = true;
        
        Event::dispatch('react-wrapper.filament.initialized');
    }

    /**
     * Check if Filament is available
     */
    public function isFilamentAvailable(): bool
    {
        return class_exists('\Filament\Facades\Filament') && 
               config('react-wrapper.integrations.filament.enabled', true);
    }

    /**
     * Get current Filament panel
     */
    public function getCurrentPanel(): ?\Filament\Panel
    {
        if (!$this->isFilamentAvailable()) {
            return null;
        }

        try {
            return \Filament\Facades\Filament::getCurrentPanel();
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Setup Filament render hooks for asset injection
     */
    protected function setupFilamentHooks(): void
    {
        $panel = $this->getCurrentPanel();
        if (!$panel) {
            return;
        }

        // Inject assets in head
        $panel->renderHook(
            'panels::head.end',
            function (): string {
                return $this->generateHeadInjection();
            }
        );

        // Initialize lazy loading
        $panel->renderHook(
            'panels::body.end',
            function (): string {
                return $this->generateBodyInjection();
            }
        );
    }

    /**
     * Share Filament-specific data
     */
    protected function shareFilamentData(): void
    {
        $panel = $this->getCurrentPanel();
        if (!$panel) {
            return;
        }

        $this->variableShare->shareGlobal('filament', [
            'panel_id' => $panel->getId(),
            'panel_path' => $panel->getPath(),
            'brand_name' => $panel->getBrandName(),
            'brand_logo' => $panel->getBrandLogo(),
            'brand_logo_height' => $panel->getBrandLogoHeight(),
            'favicon' => $panel->getFavicon(),
            'theme' => $panel->getTheme(),
            'dark_mode' => $panel->hasDarkMode(),
            'dark_mode_forced' => $panel->hasForcedDarkMode(),
            'collapsible_navigation' => $panel->hasCollapsibleNavigation(),
            'navigation_on_top' => $panel->hasTopNavigation(),
            'max_content_width' => $panel->getMaxContentWidth(),
            'spa_mode' => $panel->isSpaMode(),
            'tenant_menu_placement' => $panel->getTenantMenuPlacement(),
        ]);

        // Share current user data
        if (auth()->check()) {
            $user = auth()->user();
            $this->variableShare->shareGlobal('filament_user', [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => method_exists($user, 'getFilamentAvatarUrl') 
                    ? $user->getFilamentAvatarUrl() 
                    : null,
                'can_access_panel' => method_exists($user, 'canAccessPanel') 
                    ? $user->canAccessPanel($panel) 
                    : true,
            ]);
        }

        // Share navigation data
        $this->shareNavigationData($panel);
    }

    /**
     * Share navigation data
     */
    protected function shareNavigationData($panel): void
    {
        try {
            $navigationItems = collect($panel->getNavigation())
                ->map(function ($item) {
                    return [
                        'label' => $item->getLabel(),
                        'url' => $item->getUrl(),
                        'icon' => $item->getIcon(),
                        'is_active' => $item->isActive(),
                        'badge' => $item->getBadge(),
                        'badge_color' => $item->getBadgeColor(),
                        'sort' => $item->getSort(),
                        'group' => $item->getGroup(),
                    ];
                })->toArray();

            $this->variableShare->shareGlobal('filament_navigation', $navigationItems);
        } catch (\Exception $e) {
            // Navigation might not be available in all contexts
        }
    }

    /**
     * Register minimal Filament assets
     */
    protected function registerFilamentAssets(): void
    {
        // Register core Filament React components
        $filamentComponents = [
            'ReactField' => [
                'js' => 'resources/js/filament/ReactField.tsx',
                'dependencies' => ['react', 'react-dom'],
                'preload' => true, // Fields are critical
            ],
            'ReactWidget' => [
                'js' => 'resources/js/filament/ReactWidget.tsx', 
                'dependencies' => ['react', 'react-dom'],
                'preload' => false, // Widgets can be lazy
            ],
            'FilamentTable' => [
                'js' => 'resources/js/filament/FilamentTable.tsx',
                'dependencies' => ['ReactField'],
                'preload' => false,
            ],
            'FilamentForm' => [
                'js' => 'resources/js/filament/FilamentForm.tsx',
                'dependencies' => ['ReactField'],
                'preload' => false,
            ],
            'FilamentModal' => [
                'js' => 'resources/js/filament/FilamentModal.tsx',
                'dependencies' => ['react', 'react-dom'],
                'preload' => false,
            ],
            'FilamentNotification' => [
                'js' => 'resources/js/filament/FilamentNotification.tsx',
                'dependencies' => ['react', 'react-dom'],
                'preload' => false,
            ],
        ];

        foreach ($filamentComponents as $component => $config) {
            if (!$this->registry->has($component)) {
                $this->registry->register($component, $component, [
                    'lazy' => !($config['preload'] ?? false),
                    'preload' => $config['preload'] ?? false,
                    'filament_specific' => true,
                ]);
            }

            $this->assetManager->registerComponentAsset($component, array_merge($config, [
                'lazy' => !($config['preload'] ?? false),
            ]));
        }
    }

    /**
     * Generate head injection for assets and variables
     */
    protected function generateHeadInjection(): string
    {
        $scripts = [];
        
        // Inject shared variables
        $scripts[] = $this->variableShare->generateJavaScriptInjection();
        
        // Get pending Filament components
        $pendingComponents = array_filter(
            $this->assetManager->getPendingAssets(),
            fn($component) => $this->isFilamentComponent($component)
        );
        
        // Generate lazy loading script for Filament components
        if (!empty($pendingComponents)) {
            $scripts[] = $this->assetManager->generateLazyLoadScript($pendingComponents);
        }
        
        // Generate preload tags for critical Filament components
        $preloadTags = $this->assetManager->generatePreloadTags($pendingComponents);
        
        $allTags = array_merge($preloadTags, array_filter($scripts));
        
        return implode("\n", $allTags);
    }

    /**
     * Generate body injection for initialization
     */
    protected function generateBodyInjection(): string
    {
        return '<script>
            document.addEventListener("DOMContentLoaded", function() {
                if (window.ReactWrapper?.initializeLazyLoading) {
                    window.ReactWrapper.initializeLazyLoading();
                    console.log("React Wrapper initialized for Filament");
                }
                
                // Initialize Filament-specific features
                if (window.ReactWrapper?.initializeFilament) {
                    window.ReactWrapper.initializeFilament();
                }
            });
        </script>';
    }

    /**
     * Check if a component is Filament-specific
     */
    protected function isFilamentComponent(string $componentName): bool
    {
        $component = $this->registry->get($componentName);
        return $component && ($component['config']['filament_specific'] ?? false);
    }

    /**
     * Get integration statistics
     */
    public function getIntegrationStats(): array
    {
        return [
            'available' => $this->isFilamentAvailable(),
            'initialized' => $this->initialized,
            'panel' => $this->getCurrentPanel()?->getId(),
            'components_registered' => count(array_filter(
                $this->registry->all(),
                fn($config) => $config['config']['filament_specific'] ?? false
            )),
            'assets_pending' => count(array_filter(
                $this->assetManager->getPendingAssets(),
                fn($component) => $this->isFilamentComponent($component)
            )),
        ];
    }

    /**
     * Clean up Filament integration
     */
    public function cleanup(): void
    {
        // Remove Filament-specific components from registry
        $filamentComponents = array_filter(
            $this->registry->all(),
            fn($config) => $config['config']['filament_specific'] ?? false
        );

        foreach (array_keys($filamentComponents) as $componentName) {
            $this->registry->unregister($componentName);
        }

        $this->initialized = false;
        
        Event::dispatch('react-wrapper.filament.cleaned');
    }
}