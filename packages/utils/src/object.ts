/**
 * Merge class names efficiently, handling undefined and empty strings
 */
export function mergeClassNames(...classNames: (string | undefined | null | false)[]): string {
  const result: string[] = [];
  
  for (const className of classNames) {
    if (className && typeof className === 'string') {
      result.push(className);
    }
  }
  
  return result.join(' ');
}

/**
 * Merge two objects deeply, with the second object taking precedence
 */
export function deepMerge<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  target: T,
  source: U
): T & U {
  const result = { ...target };
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key];
      
      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      } else {
        result[key] = sourceValue;
      }
    }
  }
  
  return result as T & U;
}

/**
 * Shallow merge objects
 */
export function shallowMerge<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  target: T,
  source: U
): T & U {
  return { ...target, ...source };
}

/**
 * Pick specific properties from an object
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

/**
 * Omit specific properties from an object
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  
  for (const key of keys) {
    delete result[key];
  }
  
  return result as Omit<T, K>;
}

/**
 * Check if an object is empty
 */
export function isEmpty(obj: Record<string, unknown>): boolean {
  for (const _ in obj) {
    return false;
  }
  return true;
}

/**
 * Convert object keys to a different case
 */
export function convertKeys<T extends Record<string, unknown>>(
  obj: T,
  converter: (key: string) => string
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[converter(key)] = obj[key];
    }
  }
  
  return result;
}

/**
 * Convert camelCase to kebab-case
 */
export function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Convert kebab-case to camelCase
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Create a cache with limited size using LRU strategy
 */
export function createLRUCache<K, V>(maxSize: number): {
  get: (key: K) => V | undefined;
  set: (key: K, value: V) => void;
  has: (key: K) => boolean;
  clear: () => void;
  size: () => number;
} {
  const cache = new Map<K, V>();
  
  return {
    get(key) {
      if (!cache.has(key)) {
        return undefined;
      }
      
      // Move to end (most recently used)
      const value = cache.get(key)!;
      cache.delete(key);
      cache.set(key, value);
      
      return value;
    },
    
    set(key, value) {
      if (cache.has(key)) {
        cache.delete(key);
      } else if (cache.size >= maxSize) {
        // Remove least recently used (first item)
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) {
          cache.delete(firstKey);
        }
      }
      
      cache.set(key, value);
    },
    
    has(key) {
      return cache.has(key);
    },
    
    clear() {
      cache.clear();
    },
    
    size() {
      return cache.size;
    },
  };
}

/**
 * Memoize a function with simple argument caching
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}
