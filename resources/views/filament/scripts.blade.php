@if(config('react-wrapper.dev_mode'))
<!-- React Wrapper Development Scripts -->
<script type="module">
    // React DevTools integration
    if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('React DevTools detected');
    }
    
    // Development error handling
    window.addEventListener('error', function(event) {
        if (event.error && event.error.stack && event.error.stack.includes('react')) {
            console.group('React Wrapper Error');
            console.error('Error:', event.error.message);
            console.error('Stack:', event.error.stack);
            console.error('Source:', event.filename + ':' + event.lineno);
            console.groupEnd();
        }
    });
</script>
@endif

<!-- React Wrapper Core -->
<script type="module">
    // Global React Wrapper configuration (Laravel 12.x compatible)
    window.ReactWrapperConfig = {
        appName: '{{ config('app.name') }}',
        devMode: {{ config('react-wrapper.dev_mode') ? 'true' : 'false' }},
        environment: '{{ app()->environment() }}',
        stateManagement: {
            persistence: {
                defaultStorage: '{{ config('react-wrapper.state_management.persistence.default_storage') }}',
                debounceMs: {{ config('react-wrapper.state_management.persistence.debounce_ms') }}
            },
            livewireSync: {{ config('react-wrapper.state_management.livewire_sync') ? 'true' : 'false' }}
        },
        errorHandling: {
            showErrorOverlay: {{ config('react-wrapper.error_handling.show_error_overlay') ? 'true' : 'false' }},
            logReactErrors: {{ config('react-wrapper.error_handling.log_react_errors') ? 'true' : 'false' }},
            errorBoundary: {{ config('react-wrapper.error_handling.error_boundary') ? 'true' : 'false' }}
        }
    };
    
    // Initialize ReactComponentRegistry if not already available
    if (typeof window.ReactComponentRegistry === 'undefined') {
        window.ReactComponentRegistry = {};
        console.log('ReactComponentRegistry initialized');
    }
</script>

<!-- Load React Bootstrap if available (Multi-Laravel version compatible) -->
@php
    $bootstrapAsset = null;
    $viteManifestPaths = [
        public_path('build/.vite/manifest.json'), // Laravel 12.x
        public_path('build/manifest.json'),       // Laravel 11.x
        public_path('build/assets/manifest.json'), // Alternative
    ];
    
    // Try published bootstrap first
    if (file_exists(resource_path('js/bootstrap-react.tsx'))) {
        foreach ($viteManifestPaths as $manifestPath) {
            if (file_exists($manifestPath)) {
                $manifest = json_decode(file_get_contents($manifestPath), true);
                $bootstrapAsset = $manifest['resources/js/bootstrap-react.tsx']['file'] ?? null;
                if ($bootstrapAsset) break;
            }
        }
    }
    
    // Fallback to package bootstrap
    if (!$bootstrapAsset) {
        $packageBootstrapKey = 'packages/react-wrapper/resources/js/bootstrap.tsx';
        foreach ($viteManifestPaths as $manifestPath) {
            if (file_exists($manifestPath)) {
                $manifest = json_decode(file_get_contents($manifestPath), true);
                $bootstrapAsset = $manifest[$packageBootstrapKey]['file'] ?? null;
                if ($bootstrapAsset) break;
            }
        }
    }
    
    // Development server fallback
    if (!$bootstrapAsset && app()->environment('local')) {
        $devServerUrl = config('react-wrapper.vite.dev_server_url', 'http://localhost:5173');
        $context = stream_context_create(['http' => ['timeout' => 1]]);
        if (@file_get_contents($devServerUrl, false, $context) !== false) {
            if (file_exists(resource_path('js/bootstrap-react.tsx'))) {
                $bootstrapAsset = $devServerUrl . '/resources/js/bootstrap-react.tsx';
            } else {
                $bootstrapAsset = $devServerUrl . '/packages/react-wrapper/resources/js/bootstrap.tsx';
            }
        }
    }
@endphp

@if($bootstrapAsset)
    <script type="module" src="{{ str_starts_with($bootstrapAsset, 'http') ? $bootstrapAsset : asset('build/' . $bootstrapAsset) }}"></script>
@endif