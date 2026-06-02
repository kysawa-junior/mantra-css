import type { CSSProperties } from '@mantra/types';

/**
 * Serializes a JavaScript CSS object into a standard CSS string
 * Optimized for performance with minimal allocations
 */
export function stringifyCSS(selector: string, styleObj: CSSProperties): string {
  const rules: string[] = [];
  
  for (const key in styleObj) {
    const value = styleObj[key];
    
    if (value === undefined || value === null) {
      continue;
    }
    
    // Convert camelCase to kebab-case efficiently
    const cssProperty = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    rules.push(`${cssProperty}:${value}`);
  }
  
  if (rules.length === 0) {
    return '';
  }
  
  return `${selector}{${rules.join(';')}}`;
}

/**
 * Stringify multiple selectors with the same styles
 */
export function stringifyCSSMultiple(
  selectors: string[],
  styleObj: CSSProperties
): string {
  const baseStyles = stringifyCSS('', styleObj).slice(1); // Remove leading {
  
  if (!baseStyles) {
    return '';
  }
  
  return selectors.map((selector) => `${selector}${baseStyles}`).join('');
}

/**
 * Stringify CSS with media query support
 */
export function stringifyCSSWithMedia(
  selector: string,
  styleObj: CSSProperties,
  mediaQuery?: string
): string {
  const baseCSS = stringifyCSS(selector, styleObj);
  
  if (!mediaQuery) {
    return baseCSS;
  }
  
  return `${mediaQuery}{${baseCSS}}`;
}

/**
 * Stringify CSS with pseudo selectors
 */
export function stringifyCSSWithPseudo(
  selector: string,
  baseStyleObj: CSSProperties,
  pseudoSelectors: Record<string, CSSProperties>
): string {
  let css = stringifyCSS(selector, baseStyleObj);
  
  for (const [pseudo, styles] of Object.entries(pseudoSelectors)) {
    css += stringifyCSS(`${selector}${pseudo}`, styles);
  }
  
  return css;
}

/**
 * Create CSS custom property (variable) declaration
 */
export function createCSSVariable(name: string, value: string | number): string {
  return `--${name}:${value}`;
}

/**
 * Create CSS custom property reference
 */
export function cssVar(name: string, fallback?: string | number): string {
  return fallback !== undefined 
    ? `var(--${name},${fallback})` 
    : `var(--${name})`;
}

/**
 * Parse CSS variable name from token reference
 */
export function parseTokenRef(token: string): string | null {
  if (token.startsWith('$')) {
    return token.slice(1);
  }
  return null;
}
