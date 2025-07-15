<?php

namespace HadyFayed\ReactWrapper\Integrations;

use Illuminate\Support\Facades\Event;

/**
 * SOLID-compliant Filament Integration Orchestrator
 * Single Responsibility: Coordinate Filament integration components
 */
class FilamentIntegration
{
    protected bool $initialized = false;

    public function __construct(
        protected FilamentPanelManager $panelManager,
        protected FilamentDataSharer $dataSharer,
        protected FilamentHookRegistrar $hookRegistrar,
        protected FilamentAssetRegistrar $assetRegistrar
    ) {}

    /**
     * Initialize Filament integration
     */
    public function initialize(): void
    {
        if ($this->initialized || !$this->isFilamentAvailable()) {
            return;
        }

        $this->hookRegistrar->registerHooks();
        $this->dataSharer->shareFilamentData();
        $this->assetRegistrar->registerFilamentAssets();

        $this->initialized = true;

        Event::dispatch('react-wrapper.filament.initialized');
    }

    /**
     * Check if Filament is available
     */
    public function isFilamentAvailable(): bool
    {
        return $this->panelManager->isFilamentAvailable();
    }

    /**
     * Check if Filament integration has been initialized
     */
    public function isInitialized(): bool
    {
        return $this->initialized;
    }

    /**
     * Get current Filament panel
     */
    public function getCurrentPanel(): ?\Filament\Panel
    {
        return $this->panelManager->getCurrentPanel();
    }

    /**
     * Get integration statistics
     */
    public function getIntegrationStats(): array
    {
        $registrationStats = $this->assetRegistrar->getRegistrationStats();
        
        return [
            'available' => $this->isFilamentAvailable(),
            'initialized' => $this->initialized,
            'panel' => $this->getCurrentPanel()?->getId(),
            'hooks_registered' => $this->hookRegistrar->isRegistered(),
            'components_registered' => $registrationStats['components_registered'],
            'assets_pending' => $registrationStats['assets_pending'],
        ];
    }

    /**
     * Clean up Filament integration
     */
    public function cleanup(): void
    {
        $this->assetRegistrar->cleanup();
        $this->hookRegistrar->reset();
        $this->panelManager->clearCache();
        
        $this->initialized = false;

        Event::dispatch('react-wrapper.filament.cleaned');
    }
}