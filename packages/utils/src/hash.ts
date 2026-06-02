/**
 * djb2 hash algorithm - fast and small footprint
 * Optimized for CSS class name generation
 */
export function hash(str: string): string {
  let h = 5381;
  const len = str.length;
  
  for (let i = 0; i < len; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  
  return (h >>> 0).toString(36).padStart(6, '0');
}

/**
 * Fast hash for simple strings - optimized version
 */
export function fastHash(str: string): string {
  let h = 0;
  const len = str.length;
  
  for (let i = 0; i < len; i++) {
    h = (h << 4) - h + str.charCodeAt(i);
    h &= h; // Keep it 32-bit
  }
  
  return (h >>> 0).toString(36).padStart(6, '0');
}

/**
 * Hash multiple strings together
 */
export function hashMultiple(...strings: string[]): string {
  return hash(strings.join('|'));
}

/**
 * Create a stable hash from an object by serializing keys in order
 */
export function hashObject(obj: Record<string, unknown>): string {
  const sortedKeys = Object.keys(obj).sort();
  const serialized = sortedKeys
    .map((key) => `${key}:${JSON.stringify(obj[key])}`)
    .join(',');
  return hash(serialized);
}
