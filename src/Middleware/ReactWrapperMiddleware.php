<?php

namespace HadyFayed\ReactWrapper\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;
use HadyFayed\ReactWrapper\Services\AssetManager;
use HadyFayed\ReactWrapper\Services\VariableShareService;
use Symfony\Component\HttpFoundation\Response as BaseResponse;

class ReactWrapperMiddleware
{
    protected ReactComponentRegistry $registry;
    protected AssetManager $assetManager;
    protected VariableShareService $variableShare;

    public function __construct(
        ReactComponentRegistry $registry,
        AssetManager $assetManager,
        VariableShareService $variableShare
    ) {
        $this->registry = $registry;
        $this->assetManager = $assetManager;
        $this->variableShare = $variableShare;
    }

    public function handle(Request $request, Closure $next): BaseResponse
    {
        $response = $next($request);

        // Only process HTML responses
        if (!$this->shouldProcessResponse($response)) {
            return $response;
        }

        $content = $response->getContent();
        
        // Inject React component bootstrapping
        if ($this->shouldInjectBootstrap($content)) {
            $content = $this->injectReactBootstrap($content);
            $response->setContent($content);
        }

        return $response;
    }

    protected function shouldProcessResponse(BaseResponse $response): bool
    {
        // Only process successful HTML responses
        if (!$response->isSuccessful()) {
            return false;
        }

        $contentType = $response->headers->get('Content-Type', '');
        
        return str_contains($contentType, 'text/html') || 
               str_contains($contentType, 'application/xhtml+xml') ||
               empty($contentType); // Default to HTML if no content type
    }

    protected function shouldInjectBootstrap(string $content): bool
    {
        // Only inject if we have components to render and haven't already injected
        return $this->registry->count() > 0 && 
               str_contains($content, '<html') &&
               !str_contains($content, 'react-wrapper-bootstrap');
    }

    protected function injectReactBootstrap(string $content): string
    {
        $scripts = [];
        
        // Inject shared variables
        $scripts[] = $this->variableShare->generateJavaScriptInjection();
        
        // Get pending components for lazy loading
        $pendingComponents = $this->assetManager->getPendingAssets();
        
        // Generate lazy loading script
        if (!empty($pendingComponents)) {
            $scripts[] = $this->assetManager->generateLazyLoadScript($pendingComponents);
        }
        
        // Only inject minimal bootstrap - not all assets
        $isDev = $this->assetManager->isViteDevServerRunning();
        
        if ($isDev) {
            // Development mode - inject minimal Vite client
            $viteDevServerUrl = config('react-wrapper.vite.dev_server_url', 'http://localhost:5173');
            $scripts[] = '<script type="module" src="' . $viteDevServerUrl . '/@vite/client"></script>';
            $scripts[] = '<script type="module" src="' . $viteDevServerUrl . '/resources/js/bootstrap.tsx"></script>';
        } else {
            // Production mode - inject minimal bootstrap only
            $bootstrapUrl = $this->assetManager->getAssetUrl('resources/js/bootstrap.tsx');
            if ($bootstrapUrl) {
                $scripts[] = '<script type="module" src="' . $bootstrapUrl . '"></script>';
            }
        }
        
        // Add component registry data (minimal)
        $registeredComponents = array_keys($this->registry->all());
        $componentData = json_encode([
            'registered' => $registeredComponents,
            'pending' => $pendingComponents,
        ], JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);
        
        $scripts[] = '<script id="react-wrapper-registry" type="application/json">' . $componentData . '</script>';
        
        // Generate preload tags for critical components
        $preloadTags = $this->assetManager->generatePreloadTags($pendingComponents);
        
        // Inject before closing head tag
        $allTags = array_merge($preloadTags, $scripts);
        $scriptTags = implode("\n    ", array_filter($allTags));
        
        return str_replace(
            '</head>',
            "    {$scriptTags}\n</head>",
            $content
        );
    }

    protected function isDevServerRunning(string $url): bool
    {
        $context = stream_context_create([
            'http' => [
                'timeout' => 2,
                'ignore_errors' => true
            ]
        ]);
        
        return @file_get_contents($url, false, $context) !== false;
    }
}