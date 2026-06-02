// ============================================================================
// MANTRA CORE - CSS Generation Engine
// Bundler Agnostic Zero-Runtime CSS-in-JS
// ============================================================================
// Core CSS generation from styled configurations.
// Generates class names, CSS text, and variant mappings.
// ============================================================================

import type {
  StyledConfig,
  StyledRecipe,
  VariantDefinition,
  VariantProps,
  AnyUtils,
} from '@mantra/types';
import { hash } from '../hashing/hash';
import { stringifyCSS } from '../serializer/stringify';

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