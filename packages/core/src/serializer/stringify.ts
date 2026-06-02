// ============================================================================
// MANTRA CORE - CSS Serialization Utilities
// Bundler Agnostic Zero-Runtime CSS-in-JS
// ============================================================================
// Efficient CSS object to string serialization.
// Optimized for performance with minimal allocations.
// ============================================================================

import type { CSSProperties, CSSPropertyValue } from '@mantra/types';

/**
 * Convert camelCase CSS property name to kebab-case
 * Handles vendor prefixes and custom properties
 * 
 * @param prop - CSS property name in camelCase
 * @returns CSS property name in kebab-case
 */
export function camelToKebab(prop: string): string {
  // Handle vendor prefixes first
  if (prop.startsWith('webkit')) return `-webkit-${prop.slice(6).replace(/([A-Z])/g, '-$1').toLowerCase()}`;
  if (prop.startsWith('moz')) return `-moz-${prop.slice(3).replace(/([A-Z])/g, '-$1').toLowerCase()}`;
  if (prop.startsWith('ms')) return `-ms-${prop.slice(2).replace(/([A-Z])/g, '-$1').toLowerCase()}`;
  if (prop.startsWith('o')) return `-o-${prop.slice(1).replace(/([A-Z])/g, '-$1').toLowerCase()}`;
  
  // Handle custom properties (CSS variables)
  if (prop.startsWith('--')) return prop;
  
  // Standard camelCase to kebab-case conversion
  return prop.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Serialize a single CSS value, handling numbers and special cases
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
    // Properties that accept unitless numbers
    const unitlessProperties = [
      'animationIterationCount',
      'aspectRatio',
      'borderImageOutset',
      'borderImageSlice',
      'borderImageWidth',
      'columnCount',
      'columns',
      'flex',
      'flexGrow',
      'flexPositive',
      'flexShrink',
      'flexNegative',
      'flexOrder',
      'gridArea',
      'gridRow',
      'gridRowEnd',
      'gridRowSpan',
      'gridRowStart',
      'gridColumn',
      'gridColumnEnd',
      'gridColumnSpan',
      'gridColumnStart',
      'fontWeight',
      'lineClamp',
      'lineHeight',
      'opacity',
      'order',
      'orphans',
      'scale',
      'tabSize',
      'widows',
      'zIndex',
      'zoom',
      'fillOpacity',
      'floodOpacity',
      'stopOpacity',
      'strokeDasharray',
      'strokeDashoffset',
      'strokeMiterlimit',
      'strokeOpacity',
      'strokeWidth',
    ];
    
    if (unitlessProperties.some(p => p.toLowerCase() === property.toLowerCase())) {
      return String(value);
    }
    
    return `${value}px`;
  }
  
  return String(value);
}

/**
 * Serializes a JavaScript CSS object into a standard CSS string
 * Optimized for performance with minimal allocations
 * 
 * @param selector - CSS selector (e.g., '.className', '#id', 'div')
 * @param styleObj - CSS properties object
 * @returns Serialized CSS string
 */
export function stringifyCSS(selector: string, styleObj: CSSProperties): string {
  const rules: string[] = [];
  
  for (const key in styleObj) {
    if (!Object.prototype.hasOwnProperty.call(styleObj, key)) {
      continue;
    }
    
    const value = styleObj[key];
    
    if (value === undefined || value === null) {
      continue;
    }
    
    const cssProperty = camelToKebab(key);
    const cssValue = serializeValue(value, key);
    
    if (cssValue) {
      rules.push(`${cssProperty}:${cssValue}`);
    }
  }
  
  if (rules.length === 0) {
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
  
  for (const key in styleObj) {
    if (!Object.prototype.hasOwnProperty.call(styleObj, key)) {
      continue;
    }
    
    const value = styleObj[key];
    
    if (value === undefined || value === null) {
      continue;
    }
    
    const cssProperty = camelToKebab(key);
    const cssValue = serializeValue(value, key);
    
    if (cssValue) {
      rules.push(`${cssProperty}:${cssValue}`);
    }
  }
  
  if (rules.length === 0) {
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
  const fallbackValue = fallback !== undefined
    ? (typeof fallback === 'number' ? `${fallback}px` : String(fallback))
    : undefined;
  
  return fallbackValue !== undefined
    ? `var(--${name},${fallbackValue})`
    : `var(--${name})`;
}

/**
 * Parse CSS variable name from token reference
 * Converts $tokenName to tokenName
 * 
 * @param token - Token reference (e.g., '$color')
 * @returns Variable name or null if not a token reference
 */
export function parseTokenRef(token: string): string | null {
  if (token.startsWith('$')) {
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
  return rules
    .map((rule) => stringifyCSS(rule.selector, rule.styles))
    .filter(Boolean)
    .join('');
}

/**
 * Minify CSS by removing unnecessary whitespace
 * Basic minification for build-time optimization
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
