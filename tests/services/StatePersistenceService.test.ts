import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { statePersistenceService } from '@/services/StatePersistenceService';

// Mock localStorage
const mockLocalStorage = {
  data: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.data[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.data[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.data[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.data = {};
  })
};

// Mock sessionStorage
const mockSessionStorage = {
  data: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockSessionStorage.data[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockSessionStorage.data[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockSessionStorage.data[key];
  }),
  clear: vi.fn(() => {
    mockSessionStorage.data = {};
  })
};

// Mock Livewire
const mockLivewire = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
};

describe('StatePersistenceService', () => {
  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true
    });

    Object.defineProperty(window, 'Livewire', {
      value: mockLivewire,
      writable: true
    });

    // Clear all mocks
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockSessionStorage.clear();
    
    // Clear service state
    statePersistenceService.clear();
  });

  afterEach(() => {
    statePersistenceService.clear();
  });

  describe('Configuration Registration', () => {
    it('should register persistence configuration', () => {
      const config = {
        key: 'testKey',
        storage: 'localStorage' as const,
        syncWithLivewire: false
      };

      statePersistenceService.register(config);
      
      const registered = statePersistenceService.getConfig('testKey');
      expect(registered).toEqual(expect.objectContaining(config));
    });

    it('should throw error when registering config without key', () => {
      expect(() => {
        statePersistenceService.register({
          key: '',
          storage: 'localStorage'
        });
      }).toThrow('Persistence key is required');
    });

    it('should override existing configuration', () => {
      const config1 = {
        key: 'testKey',
        storage: 'localStorage' as const,
        debounceMs: 100
      };

      const config2 = {
        key: 'testKey',
        storage: 'sessionStorage' as const,
        debounceMs: 200
      };

      statePersistenceService.register(config1);
      statePersistenceService.register(config2);

      const registered = statePersistenceService.getConfig('testKey');
      expect(registered?.storage).toBe('sessionStorage');
      expect(registered?.debounceMs).toBe(200);
    });
  });

  describe('Data Persistence', () => {
    beforeEach(() => {
      statePersistenceService.register({
        key: 'testData',
        storage: 'localStorage'
      });
    });

    it('should save data to localStorage', () => {
      const testData = { name: 'John', age: 30 };
      
      statePersistenceService.save('testData', testData);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'react-wrapper:testData',
        JSON.stringify(testData)
      );
    });

    it('should load data from localStorage', () => {
      const testData = { name: 'John', age: 30 };
      mockLocalStorage.data['react-wrapper:testData'] = JSON.stringify(testData);
      
      const loaded = statePersistenceService.load('testData');
      
      expect(loaded).toEqual(testData);
    });

    it('should return null for non-existent data', () => {
      const loaded = statePersistenceService.load('nonExistent');
      expect(loaded).toBeNull();
    });

    it('should handle invalid JSON in storage', () => {
      mockLocalStorage.data['react-wrapper:testData'] = 'invalid json';
      
      const loaded = statePersistenceService.load('testData');
      expect(loaded).toBeNull();
    });

    it('should remove data from storage', () => {
      statePersistenceService.save('testData', { test: 'value' });
      statePersistenceService.remove('testData');
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('react-wrapper:testData');
    });
  });

  describe('Storage Types', () => {
    it('should use sessionStorage when configured', () => {
      statePersistenceService.register({
        key: 'sessionData',
        storage: 'sessionStorage'
      });

      const testData = { session: 'data' };
      statePersistenceService.save('sessionData', testData);

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'react-wrapper:sessionData',
        JSON.stringify(testData)
      );
    });

    it('should use memory storage as fallback', () => {
      statePersistenceService.register({
        key: 'memoryData',
        storage: 'memory'
      });

      const testData = { memory: 'data' };
      statePersistenceService.save('memoryData', testData);
      
      const loaded = statePersistenceService.load('memoryData');
      expect(loaded).toEqual(testData);
      
      // Should not call browser storage
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle storage errors gracefully', () => {
      // Mock storage to throw error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      statePersistenceService.register({
        key: 'errorData',
        storage: 'localStorage'
      });

      // Should not throw error
      expect(() => {
        statePersistenceService.save('errorData', { test: 'data' });
      }).not.toThrow();
    });
  });

  describe('Livewire Synchronization', () => {
    beforeEach(() => {
      statePersistenceService.register({
        key: 'livewireData',
        storage: 'localStorage',
        syncWithLivewire: true,
        livewirePath: 'user.preferences'
      });
    });

    it('should sync data to Livewire when enabled', () => {
      const testData = { theme: 'dark' };
      
      statePersistenceService.save('livewireData', testData);
      
      expect(mockLivewire.emit).toHaveBeenCalledWith(
        'statePersistence:update',
        { path: 'user.preferences', data: testData }
      );
    });

    it('should not sync to Livewire when disabled', () => {
      statePersistenceService.register({
        key: 'noSyncData',
        storage: 'localStorage',
        syncWithLivewire: false
      });

      statePersistenceService.save('noSyncData', { test: 'data' });
      
      expect(mockLivewire.emit).not.toHaveBeenCalled();
    });

    it('should handle missing Livewire gracefully', () => {
      // Remove Livewire mock
      delete (window as any).Livewire;

      expect(() => {
        statePersistenceService.save('livewireData', { test: 'data' });
      }).not.toThrow();
    });
  });

  describe('Data Transformation', () => {
    it('should use custom serializer', () => {
      const customSerializer = vi.fn((data) => `custom:${JSON.stringify(data)}`);
      
      statePersistenceService.register({
        key: 'customData',
        storage: 'localStorage',
        transformer: {
          serialize: customSerializer,
          deserialize: (str) => JSON.parse(str.replace('custom:', ''))
        }
      });

      const testData = { custom: 'data' };
      statePersistenceService.save('customData', testData);

      expect(customSerializer).toHaveBeenCalledWith(testData);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'react-wrapper:customData',
        'custom:{"custom":"data"}'
      );
    });

    it('should use custom deserializer', () => {
      const customDeserializer = vi.fn((str) => JSON.parse(str.replace('custom:', '')));
      
      statePersistenceService.register({
        key: 'customData',
        storage: 'localStorage',
        transformer: {
          serialize: (data) => `custom:${JSON.stringify(data)}`,
          deserialize: customDeserializer
        }
      });

      mockLocalStorage.data['react-wrapper:customData'] = 'custom:{"custom":"data"}';
      
      const loaded = statePersistenceService.load('customData');

      expect(customDeserializer).toHaveBeenCalledWith('custom:{"custom":"data"}');
      expect(loaded).toEqual({ custom: 'data' });
    });

    it('should handle transformer errors gracefully', () => {
      statePersistenceService.register({
        key: 'errorData',
        storage: 'localStorage',
        transformer: {
          serialize: () => { throw new Error('Serialize error'); },
          deserialize: () => { throw new Error('Deserialize error'); }
        }
      });

      // Should not throw on save error
      expect(() => {
        statePersistenceService.save('errorData', { test: 'data' });
      }).not.toThrow();

      // Should return null on deserialize error
      mockLocalStorage.data['react-wrapper:errorData'] = 'some data';
      const loaded = statePersistenceService.load('errorData');
      expect(loaded).toBeNull();
    });
  });

  describe('Debouncing', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      
      statePersistenceService.register({
        key: 'debouncedData',
        storage: 'localStorage',
        debounceMs: 100
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce rapid saves', () => {
      statePersistenceService.save('debouncedData', { value: 1 });
      statePersistenceService.save('debouncedData', { value: 2 });
      statePersistenceService.save('debouncedData', { value: 3 });

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

      // Fast forward time
      vi.advanceTimersByTime(100);

      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'react-wrapper:debouncedData',
        JSON.stringify({ value: 3 })
      );
    });

    it('should save immediately when debounce is disabled', () => {
      statePersistenceService.register({
        key: 'immediateData',
        storage: 'localStorage',
        debounceMs: 0
      });

      statePersistenceService.save('immediateData', { immediate: true });

      expect(mockLocalStorage.setItem).toHaveBeenCalledImmediately();
    });
  });

  describe('Memory Management', () => {
    it('should respect maximum memory entries', () => {
      // Configure with small memory limit for testing
      for (let i = 0; i < 1100; i++) {
        statePersistenceService.register({
          key: `memoryData${i}`,
          storage: 'memory'
        });
        
        statePersistenceService.save(`memoryData${i}`, { index: i });
      }

      // Should have cleaned up oldest entries
      const firstEntry = statePersistenceService.load('memoryData0');
      expect(firstEntry).toBeNull();

      const recentEntry = statePersistenceService.load('memoryData1099');
      expect(recentEntry).toEqual({ index: 1099 });
    });

    it('should clear memory storage', () => {
      statePersistenceService.register({
        key: 'memoryData1',
        storage: 'memory'
      });
      
      statePersistenceService.register({
        key: 'memoryData2',
        storage: 'memory'
      });

      statePersistenceService.save('memoryData1', { data: 1 });
      statePersistenceService.save('memoryData2', { data: 2 });

      statePersistenceService.clearMemoryStorage();

      expect(statePersistenceService.load('memoryData1')).toBeNull();
      expect(statePersistenceService.load('memoryData2')).toBeNull();
    });
  });

  describe('Service Management', () => {
    it('should get all registered configurations', () => {
      statePersistenceService.register({
        key: 'config1',
        storage: 'localStorage'
      });
      
      statePersistenceService.register({
        key: 'config2',
        storage: 'sessionStorage'
      });

      const configs = statePersistenceService.getAllConfigs();
      expect(configs).toHaveLength(2);
      expect(configs.find(c => c.key === 'config1')).toBeDefined();
      expect(configs.find(c => c.key === 'config2')).toBeDefined();
    });

    it('should unregister configuration', () => {
      statePersistenceService.register({
        key: 'toRemove',
        storage: 'localStorage'
      });

      expect(statePersistenceService.getConfig('toRemove')).toBeDefined();
      
      const removed = statePersistenceService.unregister('toRemove');
      expect(removed).toBe(true);
      expect(statePersistenceService.getConfig('toRemove')).toBeUndefined();
    });

    it('should return false when unregistering non-existent config', () => {
      const removed = statePersistenceService.unregister('nonExistent');
      expect(removed).toBe(false);
    });

    it('should clear all configurations and data', () => {
      statePersistenceService.register({
        key: 'config1',
        storage: 'memory'
      });
      
      statePersistenceService.save('config1', { data: 'test' });

      statePersistenceService.clear();

      expect(statePersistenceService.getAllConfigs()).toHaveLength(0);
      expect(statePersistenceService.load('config1')).toBeNull();
    });
  });
});