type CacheEntry<T> = {
  element: T;
  lastAccess: number;
};

export class MemoryCache<T> {
  private readonly ttl: number;
  private readonly cache: Map<string, CacheEntry<T>> = new Map();

  constructor(ttl: number) {
    this.ttl = ttl;
  }

  public get(key: string): T | undefined {
    const res = this.cache.get(key);
    if (res && res.lastAccess + this.ttl > Date.now()) {
      return res.element;
    } else {
      this.cache.delete(key);
    }
  }

  public set(key: string, obj: T) {
    this.cache.set(key, { element: obj, lastAccess: Date.now() });
  }
}
