// Simple in-memory cache for demo purposes
class MemoryCache {
  private cache = new Map<string, { value: any; expires: number }>();

  set(key: string, value: any, ttlMs: number = 60000): void {
    const expires = Date.now() + ttlMs;
    this.cache.set(key, { value, expires });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Rate limiting helper
  increment(key: string, ttlMs: number = 60000): number {
    const current = this.get(key) || 0;
    const newValue = current + 1;
    this.set(key, newValue, ttlMs);
    return newValue;
  }
}

export const memoryCache = new MemoryCache();

