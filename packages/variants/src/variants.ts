import type {
  VariantDefinition,
  VariantProps,
  CSSProperties,
  StyledConfig,
  AnyUtils,
  CompoundVariant,
} from '@mantra/types';
import { hash, stringifyCSS } from '@mantra/utils';

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
    const resolvedValue = propValue !== undefined 
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
 * Process compound variants and return additional CSS classes
 */
export function resolveCompoundVariants<TUtils extends AnyUtils>(
  props: Record<string, unknown>,
  compoundVariants?: CompoundVariant<TUtils>[],
  defaultVariants?: Record<string, string>
): string[] {
  if (!compoundVariants) {
    return [];
  }

  const additionalClasses: string[] = [];

  for (const compound of compoundVariants) {
    const matches = Object.entries(compound.variants).every(
      ([variantName, expectedValue]) => {
        const actualValue = props[variantName] ?? defaultVariants?.[variantName];
        return actualValue === expectedValue;
      }
    );

    if (matches) {
      // Compound variants can add additional classes or inline styles
      // For now, we'll generate a unique class for the compound style
      if (compound.css) {
        const compoundHash = hash(JSON.stringify(compound.css));
        additionalClasses.push(`mantra-compound-${compoundHash}`);
      }
    }
  }

  return additionalClasses;
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
 * Validate variant props against variant definitions
 */
export function validateVariantProps(
  props: Record<string, unknown>,
  variants?: VariantDefinition
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!variants) {
    return { valid: true, errors };
  }

  for (const [variantName, variantValues] of Object.entries(variants)) {
    const propValue = props[variantName];

    if (propValue !== undefined && propValue !== null) {
      const stringValue = String(propValue);
      if (!(stringValue in variantValues)) {
        const validValues = Object.keys(variantValues).join(', ');
        errors.push(
          `Invalid variant value "${stringValue}" for "${variantName}". Valid values: ${validValues}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Merge variant configurations
 */
export function mergeVariantConfigs<TUtils extends AnyUtils>(
  base: StyledConfig<TUtils>,
  override: Partial<StyledConfig<TUtils>>
): StyledConfig<TUtils> {
  return {
    ...base,
    ...override,
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

/**
 * Create a styled configuration with variants
 */
export function createStyledConfig<TUtils extends AnyUtils>(
  baseStyle?: CSSProperties,
  variants?: VariantDefinition,
  defaultVariants?: Record<string, string>,
  compoundVariants?: CompoundVariant<TUtils>[]
): StyledConfig<TUtils> {
  return {
    baseStyle,
    variants,
    defaultVariants,
    compoundVariants,
  };
}
