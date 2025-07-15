<?php

namespace HadyFayed\ReactWrapper\Traits;

use HadyFayed\ReactWrapper\Services\AssetManager;
use HadyFayed\ReactWrapper\Services\VariableShareService;
use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;

trait ReactServiceInjection
{
    protected AssetManager $assetManager;
    protected VariableShareService $variableShare;
    protected ReactComponentRegistry $registry;

    /**
     * Initialize React services
     */
    protected function initializeReactServices(): void
    {
        $this->assetManager = app(AssetManager::class);
        $this->variableShare = app(VariableShareService::class);
        $this->registry = app(ReactComponentRegistry::class);
    }

    /**
     * Get asset manager instance
     */
    protected function getAssetManager(): AssetManager
    {
        return $this->assetManager ?? app(AssetManager::class);
    }

    /**
     * Get variable share service instance
     */
    protected function getVariableShare(): VariableShareService
    {
        return $this->variableShare ?? app(VariableShareService::class);
    }

    /**
     * Get component registry instance
     */
    protected function getRegistry(): ReactComponentRegistry
    {
        return $this->registry ?? app(ReactComponentRegistry::class);
    }
}