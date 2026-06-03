// ============================================================================
// MANTRA CORE - CSS Serialization Utilities
// Bundler Agnostic Zero-Runtime CSS-in-JS
// ============================================================================
// Efficient CSS object to string serialization.
// Optimized for performance with minimal allocations.
// Uses array-based concatenation for better performance.
// ============================================================================

import type { CSSProperties, CSSPropertyValue } from '@mantra/types';

/**
 * Properties that accept unitless numbers (no 'px' suffix)
 * Cached for performance - computed once at module load
 */
const UNITLESS_PROPERTIES = new Set([
  'animationiterationcount',
  'aspectratio',
  'borderimageoutset',
  'borderimageslice',
  'borderimagewidth',
  'columncount',
  'columns',
  'flex',
  'flexgrow',
  'flexpositive',
  'flexshrink',
  'flexnegative',
  'flexorder',
  'gridarea',
  'gridrow',
  'gridrowend',
  'gridrowspan',
  'gridrowstart',
  'gridcolumn',
  'gridcolumnend',
  'gridcolumnspan',
  'gridcolumnstart',
  'fontweight',
  'lineclamp',
  'lineheight',
  'opacity',
  'order',
  'orphans',
  'scale',
  'tabsize',
  'widows',
  'zindex',
  'zoom',
  'fillopacity',
  'floodopacity',
  'stopopacity',
  'strokedasharray',
  'strokedashoffset',
  'strokemiterlimit',
  'strokeopacity',
  'strokewidth',
]);

/**
 * Convert camelCase CSS property name to kebab-case
 * Handles vendor prefixes and custom properties
 * Optimized with early returns for common cases
 * 
 * @param prop - CSS property name in camelCase
 * @returns CSS property name in kebab-case
 */
export function camelToKebab(prop: string): string {
  // Fast path: custom properties (CSS variables)
  if (prop.charCodeAt(0) === 45 && prop.charCodeAt(1) === 45) { // '--'
    return prop;
  }
  
  // Vendor prefixes - optimized checks
  const firstChar = prop.charCodeAt(0);
  
  if (firstChar === 119) { // 'w' - webkit
    if (prop.startsWith('webkit')) {
      return `-webkit-${prop.slice(6).replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    }
  } else if (firstChar === 109) { // 'm' - moz, ms
    if (prop.startsWith('moz')) {
      return `-moz-${prop.slice(3).replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    } else if (prop.startsWith('ms')) {
      return `-ms-${prop.slice(2).replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    }
  } else if (firstChar === 111) { // 'o' - o
    if (prop.startsWith('o')) {
      return `-o-${prop.slice(1).replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    }
  }
  
  // Standard camelCase to kebab-case conversion
  let result = '';
  for (let i = 0; i < prop.length; i++) {
    const code = prop.charCodeAt(i);
    if (code >= 65 && code <= 90) { // A-Z
      result += '-' + String.fromCharCode(code + 32); // to lowercase
    } else {
      result += prop[i];
    }
  }
  return result;
}

/**
 * Serialize a single CSS value, handling numbers and special cases
 * Optimized with Set lookup for unitless properties
 * 
 * @param value - CSS property value
 * @param property - The CSS property name (for context-aware conversion)
 * @returns Serialized CSS value string
 */
export function serializeValue(value: CSSPropertyValue, property: string): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // Number values: auto-add px for properties that accept it
  if (typeof value === 'number') {
    // Fast case-insensitive lookup using lowercase
    const lowerProp = property.toLowerCase();
    
    if (UNITLESS_PROPERTIES.has(lowerProp)) {
      return String(value);
    }
    
    return `${value}px`;
  }
  
  return String(value);
}

/**
 * Serializes a JavaScript CSS object into a standard CSS string
 * Optimized for performance with minimal allocations
 * Uses array-based string building for better performance
 * 
 * @param selector - CSS selector (e.g., '.className', '#id', 'div')
 * @param styleObj - CSS properties object
 * @returns Serialized CSS string
 */
export function stringifyCSS(selector: string, styleObj: CSSProperties): string {
  const rules: string[] = [];
  let hasRules = false;
  
  for (const key in styleObj) {
    if (!Object.prototype.hasOwnProperty.call(styleObj, key)) {
      continue;
    }
    
    const value = (styleObj as Record<string, any>)[key];
    
    if (value === undefined || value === null) {
      continue;
    }
    
    const cssProperty = camelToKebab(key);
    const cssValue = serializeValue(value, key);
    
    if (cssValue) {
      rules.push(`${cssProperty}:${cssValue}`);
      hasRules = true;
    }
  }
  
  if (!hasRules) {
    return '';
  }
  
  return `${selector}{${rules.join(';')}}`;
}

/**
 * Stringify multiple selectors with the same styles
 * More efficient than calling stringifyCSS multiple times
 * 
 * @param selectors - Array of CSS selectors
 * @param styleObj - CSS properties object
 * @returns Combined CSS string
 */
export function stringifyCSSMultiple(
  selectors: string[],
  styleObj: CSSProperties
): string {
  if (selectors.length === 0) {
    return '';
  }
  
  const rules: string[] = [];
  let hasRules = false;
  
  for (const key in styleObj) {
    if (!Object.prototype.hasOwnProperty.call(styleObj, key)) {
      continue;
    }
    
    const value = (styleObj as Record<string, any>)[key];
    
    if (value === undefined || value === null) {
      continue;
    }
    
    const cssProperty = camelToKebab(key);
    const cssValue = serializeValue(value, key);
    
    if (cssValue) {
      rules.push(`${cssProperty}:${cssValue}`);
      hasRules = true;
    }
  }
  
  if (!hasRules) {
    return '';
  }
  
  const body = `{${rules.join(';')}}`;
  return selectors.map((selector) => `${selector}${body}`).join('');
}

/**
 * Stringify CSS with media query support
 * Wraps the CSS in a media query if provided
 * 
 * @param selector - CSS selector
 * @param styleObj - CSS properties object
 * @param mediaQuery - Optional media query string
 * @returns CSS string wrapped in media query if provided
 */
export function stringifyCSSWithMedia(
  selector: string,
  styleObj: CSSProperties,
  mediaQuery?: string
): string {
  const baseCSS = stringifyCSS(selector, styleObj);
  
  if (!baseCSS) {
    return '';
  }
  
  if (!mediaQuery) {
    return baseCSS;
  }
  
  return `${mediaQuery}{${baseCSS}}`;
}

/**
 * Stringify CSS with pseudo selectors
 * Generates CSS for base styles and pseudo-selector variants
 * 
 * @param selector - Base CSS selector
 * @param baseStyleObj - Base CSS properties
 * @param pseudoSelectors - Object mapping pseudo-selectors to styles
 * @returns Combined CSS string
 */
export function stringifyCSSWithPseudo(
  selector: string,
  baseStyleObj: CSSProperties,
  pseudoSelectors: Record<string, CSSProperties>
): string {
  let css = stringifyCSS(selector, baseStyleObj);
  
  for (const [pseudo, styles] of Object.entries(pseudoSelectors)) {
    const pseudoCSS = stringifyCSS(`${selector}${pseudo}`, styles);
    if (pseudoCSS) {
      css += pseudoCSS;
    }
  }
  
  return css;
}

/**
 * Create CSS custom property (variable) declaration
 * 
 * @param name - Variable name (without -- prefix)
 * @param value - Variable value
 * @returns CSS variable declaration string
 */
export function createCSSVariable(name: string, value: string | number): string {
  const stringValue = typeof value === 'number' ? `${value}px` : String(value);
  return `--${name}:${stringValue}`;
}

/**
 * Create CSS custom property reference
 * 
 * @param name - Variable name (without -- prefix)
 * @param fallback - Optional fallback value
 * @returns CSS var() reference string
 */
export function cssVar(name: string, fallback?: string | number): string {
  if (fallback !== undefined) {
    const stringValue = typeof fallback === 'number' ? `${fallback}px` : String(fallback);
    return `var(--${name},${stringValue})`;
  }
  return `var(--${name})`;
}

/**
 * Parse CSS variable name from token reference
 * Converts $tokenName to tokenName
 * 
 * @param token - Token reference (e.g., '$color')
 * @returns Variable name or null if not a token reference
 */
export function parseTokenRef(token: string): string | null {
  if (token.length > 0 && token.charCodeAt(0) === 36) { // '$'
    return token.slice(1);
  }
  return null;
}

/**
 * Build a complete stylesheet from multiple rules
 * 
 * @param rules - Array of { selector, styles } objects
 * @returns Complete CSS stylesheet string
 */
export function buildStyleSheet(
  rules: Array<{ selector: string; styles: CSSProperties }>
): string {
  const result: string[] = [];
  
  for (const rule of rules) {
    const css = stringifyCSS(rule.selector, rule.styles);
    if (css) {
      result.push(css);
    }
  }
  
  return result.join('');
}

/**
 * Minify CSS by removing unnecessary whitespace
 * Basic minification for build-time optimization
 * Uses regex chains for performance
 * 
 * @param css - CSS string to minify
 * @returns Minified CSS string
 */
export function minifyCSS(css: string): string {
  return css
    .replace(/\s+/g, ' ')           // Collapse whitespace
    .replace(/\s*{\s*/g, '{')       // Remove spaces around {
    .replace(/\s*}\s*/g, '}')       // Remove spaces around }
    .replace(/\s*;\s*/g, ';')       // Remove spaces around ;
    .replace(/^\s+|\s+$/g, '')      // Trim leading/trailing whitespace
    .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove comments
}
