<?php

namespace HadyFayed\ReactWrapper\Integrations;

/**
 * Single Responsibility: Manage Filament panel detection and caching
 */
class FilamentPanelManager
{
    protected ?\Filament\Panel $currentPanel = null;

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

        if ($this->currentPanel === null) {
            try {
                $this->currentPanel = \Filament\Facades\Filament::getCurrentPanel();
            } catch (\Exception $e) {
                logger()->warning('Failed to get current Filament panel', ['error' => $e->getMessage()]);
                return null;
            }
        }

        return $this->currentPanel;
    }

    /**
     * Clear cached panel
     */
    public function clearCache(): void
    {
        $this->currentPanel = null;
    }
}