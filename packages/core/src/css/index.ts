// ============================================================================
// MANTRA CORE - Advanced CSS API with Zero Runtime
// ============================================================================
// Modern css() and keyframes() implementation with:
// - Build-time extraction
// - Zero runtime overhead
// - Full TypeScript inference
// - Token support with autocomplete
// - Media queries and pseudo-selectors
// - Atomic optimization
// ============================================================================

import type {
  CSSProperties,
  CSSWithUtils,
  AnyUtils,
  ThemeTokens,
  MediaQueries,
  PseudoSelectors,
  MediaQueryCondition,
  SupportCondition,
  CSSResult,
  KeyframesResult,
} from '@mantra/types';
import { hash } from '../hashing/hash';
import {
  camelToKebab,
  serializeValue,
  stringifyCSS,
  parseTokenRef,
} from '../serializer/stringify';

// ============================================================================
// ADVANCED CSS OBJECT TYPES
// ============================================================================

/**
 * Nested selector support for & syntax
 */
export interface NestedSelectors<TUtils extends AnyUtils = AnyUtils> {
  [selector: string]: CSSWithUtils<TUtils> | NestedSelectors<TUtils> | undefined;
}

/**
 * CSS object with pseudo-selector support
 */
export type CSSWithPseudo<TUtils extends AnyUtils = AnyUtils> = 
  CSSWithUtils<TUtils> & {
    // Pseudo-selectors
    ':hover'?: CSSWithUtils<TUtils>;
    ':active'?: CSSWithUtils<TUtils>;
    ':focus'?: CSSWithUtils<TUtils>;
    ':focus-visible'?: CSSWithUtils<TUtils>;
    ':focus-within'?: CSSWithUtils<TUtils>;
    ':disabled'?: CSSWithUtils<TUtils>;
    ':checked'?: CSSWithUtils<TUtils>;
    ':indeterminate'?: CSSWithUtils<TUtils>;
    ':valid'?: CSSWithUtils<TUtils>;
    ':invalid'?: CSSWithUtils<TUtils>;
    ':placeholder-shown'?: CSSWithUtils<TUtils>;
    '::before'?: CSSWithUtils<TUtils>;
    '::after'?: CSSWithUtils<TUtils>;
    '::placeholder'?: CSSWithUtils<TUtils>;
    '::selection'?: CSSWithUtils<TUtils>;
  } & {
    // Generic pseudo-selectors
    [K in PseudoSelectors]?: CSSWithUtils<TUtils>;
  };

/**
 * CSS object with media query support
 */
export type CSSWithMedia<TUtils extends AnyUtils = AnyUtils> =
  CSSWithUtils<TUtils> & {
    // Common breakpoints
    '@media (min-width: 640px)'?: CSSWithUtils<TUtils>;
    '@media (min-width: 768px)'?: CSSWithUtils<TUtils>;
    '@media (min-width: 1024px)'?: CSSWithUtils<TUtils>;
    '@media (min-width: 1280px)'?: CSSWithUtils<TUtils>;
    '@media (min-width: 1536px)'?: CSSWithUtils<TUtils>;
    '@media (max-width: 640px)'?: CSSWithUtils<TUtils>;
    '@media (max-width: 768px)'?: CSSWithUtils<TUtils>;
    '@media (max-width: 1024px)'?: CSSWithUtils<TUtils>;
    '@media (prefers-color-scheme: dark)'?: CSSWithUtils<TUtils>;
    '@media (prefers-color-scheme: light)'?: CSSWithUtils<TUtils>;
    '@media (prefers-reduced-motion: reduce)'?: CSSWithUtils<TUtils>;
    '@media print'?: CSSWithUtils<TUtils>;
  } & {
    // Generic media queries
    [media: string]: CSSWithUtils<TUtils> | undefined;
  };

/**
 * Complete CSS object with all features
 */
export type AdvancedCSSObject<TUtils extends AnyUtils = AnyUtils> =
  CSSWithUtils<TUtils> & {
    // Pseudo-selectors
    [K in PseudoSelectors]?: CSSWithUtils<TUtils>;
  } & {
    // Media queries
    [media: `@media ${string}`]: CSSWithUtils<TUtils> | undefined;
    // Support queries
    [support: `@supports ${string}`]: CSSWithUtils<TUtils> | undefined;
    // Nested selectors
    [nested: `& ${string}`]: CSSWithUtils<TUtils> | undefined;
    // Container queries
    [container: `@container ${string}`]: CSSWithUtils<TUtils> | undefined;
  };

/**
 * Keyframes definition type
 */
export interface KeyframesDefinition {
  from?: CSSProperties;
  to?: CSSProperties;
  [percentage: `${number}%`]: CSSProperties;
  [keyframe: string]: CSSProperties | undefined;
}

// ============================================================================
// CSS GENERATION OPTIONS
// ============================================================================

export interface CSSOptions {
  /** Class name prefix override */
  prefix?: string;
  /** Enable atomic CSS generation */
  atomic?: boolean;
  /** Layer for @layer rule */
  layer?: string;
  /** Priority for style ordering */
  priority?: number;
}

// ============================================================================
// KEYFRAMES IMPLEMENTATION
// ============================================================================

/**
 * Create keyframes animation with build-time extraction
 * 
 * @example
 * const fadeIn = keyframes({
 *   from: { opacity: 0 },
 *   to: { opacity: 1 }
 * });
 * 
 * const animated = css({
 *   animation: `${fadeIn} 300ms ease`
 * });
 */
export function createKeyframes(
  frames: KeyframesDefinition,
  name?: string,
  prefix: string = 'mantra'
): KeyframesResult {
  // Generate stable name from content hash
  const contentHash = hash(JSON.stringify(frames));
  const animationName = name ?? `${prefix}-kf-${contentHash}`;
  
  // Build keyframes CSS
  let cssText = `@keyframes ${animationName}{`;
  
  for (const [keyframe, styles] of Object.entries(frames)) {
    if (!styles) continue;
    
    cssText += `${keyframe}{`;
    
    for (const [prop, value] of Object.entries(styles)) {
      if (value === undefined || value === null) continue;
      
      const cssProperty = camelToKebab(prop);
      const cssValue = serializeValue(value as any, prop);
      
      if (cssValue) {
        cssText += `${cssProperty}:${cssValue};`;
      }
    }
    
    cssText += '}';
  }
  
  cssText += '}';
  
  return {
    name: animationName,
    cssText,
  };
}

// ============================================================================
// ADVANCED CSS IMPLEMENTATION
// ============================================================================

/**
 * Process nested selectors and pseudo-selectors
 */
function processNestedCSS(
  baseSelector: string,
  styles: Record<string, any>,
  result: string[] = []
): string[] {
  const baseStyles: Record<string, any> = {};
  const nestedRules: Record<string, Record<string, any>> = {};
  
  // Separate base styles from nested rules
  for (const [key, value] of Object.entries(styles)) {
    if (
      key.startsWith('@') ||           // Media queries, supports, containers
      key.startsWith(':') ||           // Pseudo-classes
      key.startsWith('::') ||          // Pseudo-elements
      key.startsWith('&') ||           // Nested selectors
      typeof value === 'object'        // Nested object
    ) {
      nestedRules[key] = typeof value === 'object' ? value : { [key]: value };
    } else {
      baseStyles[key] = value;
    }
  }
  
  // Generate base CSS
  if (Object.keys(baseStyles).length > 0) {
    result.push(stringifyCSS(baseSelector, baseStyles));
  }
  
  // Process nested rules
  for (const [selector, nestedStyles] of Object.entries(nestedRules)) {
    let fullSelector: string;
    
    if (selector.startsWith('@')) {
      // Media query or other at-rule
      const innerCSS: string[] = [];
      processNestedCSS(baseSelector, nestedStyles, innerCSS);
      
      if (innerCSS.length > 0) {
        result.push(`${selector}{${innerCSS.join('')}}`);
      }
      continue;
    } else if (selector.startsWith('&')) {
      // Nested selector with &
      fullSelector = selector.replace(/&/g, baseSelector);
    } else if (selector.startsWith(':') || selector.startsWith('::')) {
      // Pseudo-selector
      fullSelector = `${baseSelector}${selector}`;
    } else {
      // Other selector
      fullSelector = selector;
    }
    
    // Recursively process nested styles
    processNestedCSS(fullSelector, nestedStyles, result);
  }
  
  return result;
}

/**
 * Main css() function with advanced features
 * 
 * @example
 * const card = css({
 *   display: 'flex',
 *   alignItems: 'center',
 *   background: '$background',
 *   padding: '$4',
 *   borderRadius: '$lg',
 *   ':hover': {
 *     background: '$backgroundHover'
 *   },
 *   '@media (min-width: 768px)': {
 *     padding: '$6'
 *   }
 * });
 * 
 * <div className={card} />
 */
export function createCSS<TUtils extends AnyUtils>(
  defaultPrefix: string = 'mantra'
) {
  return function css(
    styles: AdvancedCSSObject<TUtils>,
    options?: CSSOptions
  ): CSSResult {
    const prefix = options?.prefix ?? defaultPrefix;
    
    // Generate stable class name from styles hash
    const stylesHash = hash(JSON.stringify(styles));
    const className = `${prefix}-${stylesHash}`;
    const selector = `.${className}`;
    
    // Process all CSS including nested rules
    const cssRules = processNestedCSS(selector, styles);
    const cssText = cssRules.join('');
    
    return {
      className,
      cssText,
      selectors: [selector],
    };
  };
}

/**
 * Compose multiple css classes into one
 * Optimizes by deduplicating properties
 */
export function compose(...results: CSSResult[]): CSSResult {
  if (results.length === 0) {
    return { className: '', cssText: '' };
  }
  
  if (results.length === 1) {
    return results[0];
  }
  
  const classNames = results.map(r => r.className).filter(Boolean);
  const cssTexts = results.map(r => r.cssText).filter(Boolean);
  
  return {
    className: classNames.join(' '),
    cssText: cssTexts.join(''),
    selectors: results.flatMap(r => r.selectors ?? []),
  };
}

/**
 * Merge css objects with override behavior
 */
export function mergeCSS<TUtils extends AnyUtils>(
  ...stylesArray: Array<AdvancedCSSObject<TUtils> | undefined | null | false>
): AdvancedCSSObject<TUtils> {
  const result: Record<string, any> = {};
  
  for (const styles of stylesArray) {
    if (!styles) continue;
    
    for (const [key, value] of Object.entries(styles)) {
      if (typeof value === 'object' && value !== null) {
        // Deep merge for nested objects (pseudo-selectors, media queries)
        result[key] = mergeCSS(result[key] as any, value as any);
      } else {
        // Override behavior
        result[key] = value;
      }
    }
  }
  
  return result as AdvancedCSSObject<TUtils>;
}

// ============================================================================
// TOKEN TRANSFORM
// ============================================================================

/**
 * Transform token references ($token) to CSS variables
 */
export function transformTokens(
  styles: Record<string, any>,
  theme: ThemeTokens
): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === 'string' && value.startsWith('$')) {
      // Token reference - convert to CSS variable
      const tokenName = value.slice(1);
      result[key] = `var(--${tokenName})`;
    } else if (typeof value === 'object' && value !== null) {
      // Recursively transform nested objects
      result[key] = transformTokens(value, theme);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { processNestedCSS };
