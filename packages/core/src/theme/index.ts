import { hash, stringifyCSS } from '../core';

export function createThemeTokens(theme: Record<string, Record<string, string>>) {
  let cssText = '';
  const className = `theme-${hash(JSON.stringify(theme))}`;

  const vars: Record<string, string> = {};
  let varString = '';

  for (const [scale, tokens] of Object.entries(theme)) {
    for (const [token, value] of Object.entries(tokens)) {
      const varName = `--${scale}-${token}`;
      vars[`$${token}`] = `var(${varName})`;
      varString += `${varName}: ${value}; `;
    }
  }

  cssText += `.${className} { ${varString} } `;

  return {
    className,
    cssText,
    vars, // Used by the compiler to resolve $token references
  };
}
