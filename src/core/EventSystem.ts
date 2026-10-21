type EventCallback = () => void;

export class EventSystem {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event: string): void {
    const set = this.listeners.get(event);
    if (set) {
      for (const callback of set) {
        callback();
      }
    }
  }

  listenerCount(event: string): number {
    const set = this.listeners.get(event);
    return set ? set.size : 0;
  }

  clear(): void {
    this.listeners.clear();
  }
}
