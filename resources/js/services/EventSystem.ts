/**
 * Event System Service - implements IEventSystem interface
 * Following Single Responsibility Principle
 */

import { IEventSystem } from '../interfaces/IComponentRegistry';

export class EventSystem implements IEventSystem {
  private listeners: Map<string, Array<{ callback: Function; priority: number }>> = new Map();

  on(event: string, callback: Function, priority: number = 10): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push({ callback, priority });
    
    // Sort by priority (higher number = higher priority)
    this.listeners.get(event)!.sort((a, b) => b.priority - a.priority);
  }

  off(event: string, callback: Function): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.findIndex(l => l.callback === callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any): any {
    const listeners = this.listeners.get(event);
    if (!listeners) return data;

    let result = data;
    for (const listener of listeners) {
      try {
        const returned = listener.callback(result);
        if (returned !== undefined) {
          result = returned;
        }
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    }
    
    return result;
  }

  hasListeners(event: string): boolean {
    return this.listeners.has(event) && this.listeners.get(event)!.length > 0;
  }

  clear(): void {
    this.listeners.clear();
  }

  getListenerCount(event?: string): number {
    if (event) {
      return this.listeners.get(event)?.length || 0;
    }
    return Array.from(this.listeners.values()).reduce((total, arr) => total + arr.length, 0);
  }
}