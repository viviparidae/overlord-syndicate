export type EventMap = Record<string, unknown>;

type StoredListener = (payload: unknown) => void;

export class EventSystem<T extends EventMap = EventMap> {
  private listeners: Map<string, Set<StoredListener>> = new Map();

  on<K extends keyof T & string>(event: K, callback: (payload: T[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback as StoredListener);
  }

  off<K extends keyof T & string>(event: K, callback: (payload: T[K]) => void): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback as StoredListener);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit<K extends keyof T & string>(event: K, payload?: T[K]): void {
    const set = this.listeners.get(event);
    if (set) {
      for (const callback of set) {
        (callback as (payload: T[K]) => void)(payload as T[K]);
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
