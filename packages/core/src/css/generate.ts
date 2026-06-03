// ============================================================================
// MANTRA CORE - CSS Generation Engine
// Bundler Agnostic Zero-Runtime CSS-in-JS
// ============================================================================
// Core CSS generation from styled configurations.
// Generates class names, CSS text, and variant mappings.
// Optimized for performance with minimal allocations.
// ============================================================================

import type {
  StyledConfig,
  StyledRecipe,
  VariantDefinition,
  VariantProps,
  AnyUtils,
  CSSProperties,
  KeyframesResult,
  CSSResult,
} from '@mantra/types';
import { hash } from '../hashing/hash';
import { stringifyCSS, camelToKebab, serializeValue } from '../serializer/stringify';
import { processNestedCSS } from './index';

/**
 * Advanced CSS object with nested selectors support
 */
export interface AdvancedCSSObject<TUtils extends AnyUtils = AnyUtils> {
  [key: string]: CSSProperties | AdvancedCSSObject<TUtils> | undefined;
}

/**
 * CSS options for customization
 */
export interface CSSOptions {
  prefix?: string;
  atomic?: boolean;
  layer?: string;
  priority?: number;
}

/**
 * Generate a unique class name for a variant combination
 */
export function generateVariantClassName(
  baseClassName: string,
  variantName: string,
  variantValue: string
): string {
  return `${baseClassName}-${variantName}-${variantValue}`;
}

/**
 * Build variant class mappings from variant definitions
 */
export function buildVariantClassMappings(
  baseClassName: string,
  variants?: VariantDefinition
): Record<string, Record<string, string>> {
  const mappings: Record<string, Record<string, string>> = {};

  if (!variants) {
    return mappings;
  }

  for (const [variantName, variantValues] of Object.entries(variants)) {
    mappings[variantName] = {};

    for (const variantValue of Object.keys(variantValues)) {
      mappings[variantName][variantValue] = generateVariantClassName(
        baseClassName,
        variantName,
        variantValue
      );
    }
  }

  return mappings;
}

/**
 * Generate CSS text for all variants
 */
export function generateVariantCSS(
  variantClassMappings: Record<string, Record<string, string>>,
  variants?: VariantDefinition
): string {
  let cssText = '';

  if (!variants) {
    return cssText;
  }

  for (const [variantName, variantValues] of Object.entries(variants)) {
    const classMapping = variantClassMappings[variantName];

    if (!classMapping) {
      continue;
    }

    for (const [variantValue, styles] of Object.entries(variantValues)) {
      const className = classMapping[variantValue];
      cssText += stringifyCSS(`.${className}`, styles);
    }
  }

  return cssText;
}

/**
 * Resolve class names from variant props
 */
export function resolveVariantClasses(
  props: Record<string, unknown>,
  variantClassMappings: Record<string, Record<string, string>>,
  defaultVariants?: Record<string, string>
): string {
  const classes: string[] = [];

  for (const [variantName, classMapping] of Object.entries(variantClassMappings)) {
    const propValue = props[variantName];
    const resolvedValue = propValue !== undefined && propValue !== null
      ? String(propValue)
      : defaultVariants?.[variantName];

    if (resolvedValue && classMapping[resolvedValue]) {
      classes.push(classMapping[resolvedValue]);
    }
  }

  return classes.join(' ');
}

/**
 * Get variant prop names from variant definitions
 */
export function getVariantPropNames(variants?: VariantDefinition): string[] {
  if (!variants) {
    return [];
  }
  return Object.keys(variants);
}

/**
 * Filter out variant props from regular DOM props
 */
export function separateVariantProps<T extends Record<string, unknown>>(
  props: T,
  variantPropNames: string[]
): { variantProps: Record<string, unknown>; domProps: Record<string, unknown> } {
  const variantProps: Record<string, unknown> = {};
  const domProps: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (variantPropNames.includes(key)) {
      variantProps[key] = value;
    } else {
      domProps[key] = value;
    }
  }

  return { variantProps, domProps };
}

/**
 * Create a complete variant resolver function
 */
export function createVariantResolver<TVariants extends VariantDefinition>(
  variantClassMappings: Record<string, Record<string, string>>,
  defaultVariants?: Record<string, string>
) {
  return function resolve(
    props: VariantProps<TVariants> & { className?: string }
  ): string {
    const variantClasses = resolveVariantClasses(
      props,
      variantClassMappings,
      defaultVariants
    );

    const allClasses = [variantClasses];

    if (props.className) {
      allClasses.push(props.className);
    }

    return allClasses.filter(Boolean).join(' ');
  };
}

/**
 * Generate base CSS from styled config
 */
export function generateBaseCSS<TUtils extends AnyUtils>(
  config: StyledConfig<TUtils>,
  prefix: string = 'mantra'
): { baseClassName: string; baseCSSText: string } {
  const baseStyle = config.baseStyle || config.base;
  
  if (!baseStyle) {
    const baseHash = hash('empty-base');
    return {
      baseClassName: `${prefix}-${baseHash}`,
      baseCSSText: '',
    };
  }
  
  const baseHash = hash(JSON.stringify(baseStyle));
  const baseClassName = `${prefix}-${baseHash}`;
  const baseCSSText = stringifyCSS(`.${baseClassName}`, baseStyle);
  
  return { baseClassName, baseCSSText };
}

/**
 * Main CSS generation function
 */
export function generateCSS<TUtils extends AnyUtils>(
  config: StyledConfig<TUtils>,
  element: string,
  prefix: string = 'mantra'
): StyledRecipe {
  const { baseClassName, baseCSSText } = generateBaseCSS(config, prefix);
  
  const variantClassMappings = buildVariantClassMappings(
    baseClassName,
    config.variants
  );
  
  const variantCSSText = generateVariantCSS(variantClassMappings, config.variants);
  
  const cssText = baseCSSText + variantCSSText;
  
  const resolve = createVariantResolver(variantClassMappings, config.defaultVariants);
  
  return {
    element,
    baseClassName,
    cssText,
    variantClassMappings,
    defaultVariants: config.defaultVariants,
    resolve,
    __mantra: {
      config: config as StyledConfig,
      extractedAt: new Date().toISOString(),
    },
  };
}

/**
 * Merge multiple styled configs
 */
export function mergeStyledConfigs<TUtils extends AnyUtils>(
  base: StyledConfig<TUtils>,
  override: Partial<StyledConfig<TUtils>>
): StyledConfig<TUtils> {
  return {
    ...base,
    ...override,
    baseStyle: override.baseStyle || override.base || base.baseStyle || base.base,
    variants: {
      ...base.variants,
      ...override.variants,
    },
    compoundVariants: [
      ...(base.compoundVariants || []),
      ...(override.compoundVariants || []),
    ],
    defaultVariants: {
      ...base.defaultVariants,
      ...override.defaultVariants,
    },
  };
}

// ============================================================================
// KEYFRAMES IMPLEMENTATION
// ============================================================================

/**
 * Keyframes definition type
 */
export interface KeyframesDefinition {
  from?: CSSProperties;
  to?: CSSProperties;
  [percentage: `${number}%`]: CSSProperties;
  [keyframe: string]: CSSProperties | undefined;
}

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

/**
 * Transform token references ($token) to CSS variables
 */
export function transformTokens(
  styles: Record<string, any>,
  theme: Record<string, any>
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
