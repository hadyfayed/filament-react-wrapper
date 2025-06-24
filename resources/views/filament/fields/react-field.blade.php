<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    <div 
        x-data="{ 
            containerId: '{{ $getContainerId() }}',
            componentName: '{{ $getComponentName() }}',
            componentProps: @js($getComponentProps()),
            initReactComponent() {
                if (window.ReactComponentRegistry) {
                    window.ReactComponentRegistry.mount(this.componentName, this.containerId, {
                        ...this.componentProps,
                        onDataChange: (data) => {
                            $wire.set('{{ $getStatePath() }}', data);
                        }
                    });
                } else {
                    console.error('ReactComponentRegistry not found. Make sure React wrapper is properly loaded.');
                }
            }
        }"
        x-init="initReactComponent()"
        wire:ignore
        class="react-component-container"
    >
        <div 
            id="{{ $getContainerId() }}" 
            class="react-component-mount"
            style="min-height: {{ $getComponentProps()['height'] ?? 400 }}px;"
        >
            <div class="flex items-center justify-center h-full text-gray-500">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p>Loading {{ $getComponentName() }} component...</p>
                </div>
            </div>
        </div>
    </div>
</x-dynamic-component>