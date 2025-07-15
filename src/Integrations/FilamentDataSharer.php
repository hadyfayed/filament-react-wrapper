<?php

namespace HadyFayed\ReactWrapper\Integrations;

use HadyFayed\ReactWrapper\Services\VariableShareService;

/**
 * Single Responsibility: Share Filament-specific data with React components
 */
class FilamentDataSharer
{
    public function __construct(
        protected VariableShareService $variableShare,
        protected FilamentPanelManager $panelManager
    ) {}

    /**
     * Share all Filament-specific data
     */
    public function shareFilamentData(): void
    {
        $panel = $this->panelManager->getCurrentPanel();
        if (!$panel) {
            return;
        }

        $this->sharePanelData($panel);
        $this->shareUserData($panel);
        $this->shareNavigationData($panel);
    }

    /**
     * Share panel configuration data
     */
    protected function sharePanelData(\Filament\Panel $panel): void
    {
        $this->variableShare->shareGlobal('filament', [
            'panel_id' => $panel->getId(),
            'panel_path' => $panel->getPath(),
            'brand_name' => $panel->getBrandName(),
            'brand_logo' => $panel->getBrandLogo(),
            'brand_logo_height' => $panel->getBrandLogoHeight(),
            'favicon' => $panel->getFavicon(),
            'theme' => $panel->getTheme(),
            'dark_mode' => $panel->hasDarkMode(),
            'dark_mode_forced' => method_exists($panel, 'hasForcedDarkMode') ? $panel->hasForcedDarkMode() : false,
            'collapsible_navigation' => method_exists($panel, 'hasCollapsibleNavigation') ? $panel->hasCollapsibleNavigation() : false,
            'navigation_on_top' => $panel->hasTopNavigation(),
            'max_content_width' => $panel->getMaxContentWidth(),
            'spa_mode' => method_exists($panel, 'isSpaMode') ? $panel->isSpaMode() : false,
        ]);
    }

    /**
     * Share current user data
     */
    protected function shareUserData(\Filament\Panel $panel): void
    {
        if (!auth()->check()) {
            return;
        }

        $user = auth()->user();
        $this->variableShare->shareGlobal('filament_user', [
            'id' => $user->getKey(),
            'name' => $user->getAttribute('name') ?? 'Unknown',
            'email' => $user->getAttribute('email') ?? '',
            'avatar_url' => method_exists($user, 'getFilamentAvatarUrl')
                ? $user->getFilamentAvatarUrl()
                : null,
            'can_access_panel' => method_exists($user, 'canAccessPanel')
                ? $user->canAccessPanel($panel)
                : true,
        ]);
    }

    /**
     * Share navigation data
     */
    protected function shareNavigationData(\Filament\Panel $panel): void
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
            logger()->debug('Failed to share Filament navigation data', ['error' => $e->getMessage()]);
        }
    }
}