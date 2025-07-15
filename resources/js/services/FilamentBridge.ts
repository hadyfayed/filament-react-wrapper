// Laravel-style method calls inspired by MingleJS $wire
export interface FilamentBridgeConfig {
  baseUrl?: string;
  token?: string;
  timeout?: number;
}

export class FilamentBridge {
  private config: FilamentBridgeConfig;
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config: FilamentBridgeConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || '/filament',
      token: config.token || this.getCSRFToken(),
      timeout: config.timeout || 5000,
    };
  }

  // Laravel-style method calls
  async call(method: string, ...args: any[]): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/react-bridge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': this.config.token || '',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          method,
          args,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('FilamentBridge call failed:', error);
      throw error;
    }
  }

  // Event emission (Laravel events)
  emit(event: string, data: any = null): void {
    // Emit to server
    this.call('emit', event, data).catch(error => {
      console.error('Failed to emit event to server:', error);
    });

    // Emit locally
    this.emitLocal(event, data);
  }

  // Local event emission
  emitLocal(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  // Event listening
  on(event: string, callback: (data: any) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    this.eventListeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(event);
        }
      }
    };
  }

  // State setting (similar to Livewire)
  set(path: string, value: any): Promise<any> {
    return this.call('set', path, value);
  }

  // State getting
  get(path: string): Promise<any> {
    return this.call('get', path);
  }

  // Form submission
  submit(form: Record<string, any>): Promise<any> {
    return this.call('submit', form);
  }

  // File upload
  async upload(file: File, path: string = 'uploads'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const response = await fetch(`${this.config.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': this.config.token || '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed! status: ${response.status}`);
    }

    return response.json();
  }

  // Validation
  validate(data: Record<string, any>, rules: Record<string, string>): Promise<any> {
    return this.call('validate', data, rules);
  }

  // Refresh component
  refresh(): Promise<any> {
    return this.call('refresh');
  }

  // Private helper methods
  private getCSRFToken(): string {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    return token || '';
  }
}

// Create singleton instance
export const filamentBridge = new FilamentBridge();

// React hook for using the bridge
export const useFilamentBridge = () => {
  return {
    $filament: {
      call: filamentBridge.call.bind(filamentBridge),
      emit: filamentBridge.emit.bind(filamentBridge),
      on: filamentBridge.on.bind(filamentBridge),
      set: filamentBridge.set.bind(filamentBridge),
      get: filamentBridge.get.bind(filamentBridge),
      submit: filamentBridge.submit.bind(filamentBridge),
      upload: filamentBridge.upload.bind(filamentBridge),
      validate: filamentBridge.validate.bind(filamentBridge),
      refresh: filamentBridge.refresh.bind(filamentBridge),
    },
  };
};

// MingleJS-style $wire compatibility
export const use$wire = () => {
  return {
    $wire: {
      call: filamentBridge.call.bind(filamentBridge),
      emit: filamentBridge.emit.bind(filamentBridge),
      set: filamentBridge.set.bind(filamentBridge),
      get: filamentBridge.get.bind(filamentBridge),
      submit: filamentBridge.submit.bind(filamentBridge),
      upload: filamentBridge.upload.bind(filamentBridge),
      refresh: filamentBridge.refresh.bind(filamentBridge),
    },
  };
};

// Global access
if (typeof window !== 'undefined') {
  (window as any).FilamentBridge = filamentBridge;
  (window as any).$filament = filamentBridge;
}
