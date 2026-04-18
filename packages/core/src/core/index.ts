// djb2 hash algorithm - fast and small
export function hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) ^ char;
  }
  return (hash >>> 0).toString(36).padStart(6, '0');
}

// Serializes a JS CSS object into a standard CSS string
export function stringifyCSS(selector: string, styleObj: Record<string, any>): string {
  let css = `${selector} { `;
  for (const [key, value] of Object.entries(styleObj)) {
    if (value === undefined || value === null) continue;
    const cssProperty = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    css += `${cssProperty}: ${value}; `;
  }
  css += '} ';
  return css;
}
