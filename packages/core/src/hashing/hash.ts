// ============================================================================
// MANTRA CORE - Hash Utilities
// Bundler Agnostic Zero-Runtime CSS-in-JS
// ============================================================================
// Fast, stable hashing algorithms for CSS class name generation.
// Optimized for performance, determinism and SSR compatibility.
// ============================================================================

/**
 * Internal counter for unique IDs (resettable for SSR)
 */
let _idCounter = 0;

/**
 * Get current ID counter value
 */
export function getIdCounter(): number {
  return _idCounter;
}

/**
 * djb2 hash algorithm - fast and small footprint
 * Optimized for CSS class name generation
 * 
 * @param str - Input string to hash
 * @returns Base36 encoded hash string (6 chars)
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
 * Uses bit manipulation for maximum speed
 * 
 * @param str - Input string to hash
 * @returns Base36 encoded hash string (6 chars)
 */
export function fastHash(str: string): string {
  let h = 0;
  const len = str.length;

  for (let i = 0; i < len; i++) {
    h = (h << 4) - h + str.charCodeAt(i);
    h |= 0; // Keep it 32-bit
  }

  return (h >>> 0).toString(36).padStart(6, '0');
}

/**
 * Hash multiple strings together with a separator
 * 
 * @param strings - Strings to hash together
 * @returns Combined base36 encoded hash
 */
export function hashMultiple(...strings: string[]): string {
  return hash(strings.join('|'));
}

/**
 * Create a stable hash from an object by serializing keys in sorted order
 * Ensures consistent hashing regardless of property order
 * 
 * @param obj - Object to hash
 * @returns Base36 encoded hash string
 */
export function hashObject(obj: Record<string, unknown>): string {
  const sortedKeys = Object.keys(obj).sort();
  const serialized = sortedKeys
    .map((key) => `${key}:${JSON.stringify(obj[key])}`)
    .join(',');
  return hash(serialized);
}

/**
 * MurmurHash3-inspired hash for better distribution
 * Good for larger inputs and collision resistance
 * 
 * @param str - Input string to hash
 * @param seed - Optional seed value
 * @returns Base36 encoded hash string (8 chars)
 */
export function murmurHash(str: string, seed = 0): string {
  const len = str.length;
  let h1 = seed ^ 0xdeadbeef;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  const r1 = 15;
  const r2 = 13;
  const m = 5;
  const n = 0xe6546b64;

  let i = 0;
  while (i + 4 <= len) {
    let k1 =
      (str.charCodeAt(i) & 0xff) |
      ((str.charCodeAt(++i) & 0xff) << 8) |
      ((str.charCodeAt(++i) & 0xff) << 16) |
      ((str.charCodeAt(++i) & 0xff) << 24);

    k1 = Math.imul(k1, c1);
    k1 = (k1 << r1) | (k1 >>> (32 - r1));
    k1 = Math.imul(k1, c2);

    h1 ^= k1;
    h1 = (h1 << r2) | (h1 >>> (32 - r2));
    h1 = Math.imul(h1, m) + n;

    ++i;
  }

  let k1 = 0;
  switch (len & 3) {
    case 3:
      k1 ^= (str.charCodeAt(i + 2) & 0xff) << 16;
    case 2:
      k1 ^= (str.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      k1 ^= str.charCodeAt(i) & 0xff;
      k1 = Math.imul(k1, c1);
      k1 = (k1 << r1) | (k1 >>> (32 - r1));
      k1 = Math.imul(k1, c2);
      h1 ^= k1;
  }

  h1 ^= len;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return (h1 >>> 0).toString(36).padStart(8, '0');
}

/**
 * Generate a deterministic unique ID
 * Uses content-based hashing for SSR stability
 * Falls back to counter-only mode when content is provided
 * 
 * @param content - Optional content for deterministic ID
 * @param prefix - Optional prefix for the ID
 * @returns Unique identifier string
 */
export function generateId(prefix = 'mantra', content?: string): string {
  if (content !== undefined) {
    // Deterministic mode: hash content for SSR stability
    return `${prefix}-${hash(content)}`;
  }
  
  // Counter mode: for non-SSR or dynamic scenarios
  const id = `${prefix}-${(_idCounter++).toString(36)}`;
  return id;
}

/**
 * Reset the ID counter (critical for SSR hydration consistency)
 * Should be called before each SSR render pass
 */
export function resetIdCounter(): void {
  _idCounter = 0;
}

/**
 * Set the ID counter to a specific value (advanced SSR scenarios)
 */
export function setIdCounter(value: number): void {
  _idCounter = value;
}
