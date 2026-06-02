import type { ThemeTokens, ThemeResult } from '@mantra/types';
import { hash, stringifyCSS, createCSSVariable } from '@mantra/utils';

/**
 * Default theme scales for semantic token organization
 */
export const DEFAULT_THEME_SCALES = {
  colors: 'colors',
  spacing: 'spacing',
  sizes: 'sizes',
  fonts: 'fonts',
  fontSizes: 'fontSizes',
  fontWeights: 'fontWeights',
  lineHeights: 'lineHeights',
  radii: 'radii',
  shadows: 'shadows',
  zIndices: 'zIndices',
  transitions: 'transitions',
  breakpoints: 'breakpoints',
} as const;

export type ThemeScale = keyof typeof DEFAULT_THEME_SCALES;

/**
 * Create CSS custom properties from theme tokens
 */
export function createThemeVariables(
  theme: ThemeTokens,
  scalePrefix: string = ''
): { cssText: string; vars: Record<string, string> } {
  const vars: Record<string, string> = {};
  const declarations: string[] = [];

  for (const [scale, tokens] of Object.entries(theme)) {
    const prefix = scalePrefix ? `${scalePrefix}-${scale}` : scale;

    for (const [token, value] of Object.entries(tokens)) {
      const varName = `--${prefix}-${token}`;
      const tokenKey = `$${token}`;

      vars[tokenKey] = `var(${varName})`;
      declarations.push(`${varName}:${value}`);
    }
  }

  return {
    cssText: declarations.length > 0 ? `:root{${declarations.join(';')}}` : '',
    vars,
  };
}

/**
 * Create a theme class with scoped CSS variables
 */
export function createThemeClass(theme: ThemeTokens): ThemeResult {
  const className = `theme-${hash(JSON.stringify(theme))}`;
  const { cssText, vars } = createThemeVariables(theme);

  const scopedCssText = cssText.replace(':root', `.${className}`);

  return {
    className,
    cssText: scopedCssText,
    vars,
  };
}

/**
 * Resolve a token reference to its CSS variable
 */
export function resolveToken(token: string, vars: Record<string, string>): string {
  if (token.startsWith('$')) {
    return vars[token] || token;
  }
  return token;
}

/**
 * Transform style object to resolve token references
 */
export function transformStylesWithTokens(
  styles: Record<string, any>,
  vars: Record<string, string>
): Record<string, string | number> {
  const result: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === 'string' && value.startsWith('$')) {
      result[key] = resolveToken(value, vars);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = transformStylesWithTokens(value, vars);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Merge multiple theme configurations
 */
export function mergeThemes(...themes: ThemeTokens[]): ThemeTokens {
  const result: ThemeTokens = {};

  for (const theme of themes) {
    for (const [scale, tokens] of Object.entries(theme)) {
      if (!result[scale]) {
        result[scale] = {};
      }
      result[scale] = { ...result[scale], ...tokens };
    }
  }

  return result;
}

/**
 * Create a dark mode theme variant
 */
export function createDarkTheme(baseTheme: ThemeTokens, darkOverrides: ThemeTokens): ThemeTokens {
  return mergeThemes(baseTheme, darkOverrides);
}

/**
 * Generate semantic color tokens from a palette
 */
export function generateSemanticColors(palette: Record<string, string>): ThemeTokens {
  const colors: Record<string, string> = {};

  // Generate standard semantic color names
  const semanticMappings: Record<string, string[]> = {
    primary: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    secondary: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    accent: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    neutral: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    success: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    warning: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    error: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  };

  for (const [semanticName, shades] of Object.entries(semanticMappings)) {
    const baseColor = palette[semanticName] || palette.primary || '#000000';
    
    for (const shade of shades) {
      colors[`${semanticName}${shade}`] = baseColor; // In real implementation, would generate actual shades
    }
  }

  return { colors };
}

/**
 * Create default spacing scale
 */
export function createSpacingScale(baseUnit: number = 4): ThemeTokens {
  const spacing: Record<string, string> = {};

  for (let i = 0; i <= 16; i++) {
    spacing[i.toString()] = `${i * baseUnit}px`;
  }

  // Add common fractional values
  spacing['px'] = '1px';
  spacing['0.5'] = `${baseUnit / 2}px`;
  spacing['1.5'] = `${baseUnit * 1.5}px`;
  spacing['2.5'] = `${baseUnit * 2.5}px`;
  spacing['3.5'] = `${baseUnit * 3.5}px`;

  return { spacing };
}

/**
 * Create default size scale
 */
export function createSizeScale(baseUnit: number = 4): ThemeTokens {
  const sizes: Record<string, string> = {};

  for (let i = 0; i <= 16; i++) {
    sizes[i.toString()] = `${i * baseUnit}px`;
  }

  // Add common component sizes
  sizes['full'] = '100%';
  sizes['screen'] = '100vw';
  sizes['min'] = 'min-content';
  sizes['max'] = 'max-content';
  sizes['fit'] = 'fit-content';

  return { sizes };
}

/**
 * Create default border radius scale
 */
export function createRadiiScale(): ThemeTokens {
  return {
    radii: {
      none: '0',
      sm: '2px',
      md: '4px',
      lg: '8px',
      xl: '12px',
      '2xl': '16px',
      full: '9999px',
    },
  };
}

/**
 * Create default font scale
 */
export function createFontScale(): ThemeTokens {
  return {
    fonts: {
      sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    fontWeights: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeights: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  };
}

/**
 * Create default shadow scale
 */
export function createShadowScale(): ThemeTokens {
  return {
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      none: 'none',
    },
  };
}

/**
 * Create a complete default theme
 */
export function createDefaultTheme(): ThemeTokens {
  return {
    ...createSpacingScale(),
    ...createSizeScale(),
    ...createRadiiScale(),
    ...createFontScale(),
    ...createShadowScale(),
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000000',
      white: '#ffffff',
    },
  };
}
