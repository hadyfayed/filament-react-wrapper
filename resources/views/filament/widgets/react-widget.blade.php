<x-filament-widgets::widget class="fi-wi-react">
    <x-filament::card>
        @if(isset($heading))
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ $heading }}
            </h3>
        </div>
        @endif
        
        <div 
            x-data="{ 
                containerId: '{{ $containerId }}',
                componentName: '{{ $componentName }}',
                componentProps: @js($componentProps),
                
                initReactWidget() {
                    if (window.ReactComponentRegistry) {
                        window.ReactComponentRegistry.mount(this.componentName, this.containerId, this.componentProps);
                    } else {
                        console.error('ReactComponentRegistry not found. Make sure React wrapper is properly loaded.');
                    }
                }
            }"
            x-init="initReactWidget()"
            wire:ignore
            class="react-widget-container p-6"
        >
            <div 
                id="{{ $containerId }}" 
                class="react-widget-mount"
                style="min-height: {{ $height }}px;"
            >
                <div class="flex items-center justify-center h-full text-gray-500">
                    <div class="text-center">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-3"></div>
                        <p class="text-sm">Loading {{ $componentName }}...</p>
                    </div>
                </div>
            </div>
        </div>
    </x-filament::card>
</x-filament-widgets::widget>