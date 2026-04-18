export function hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) ^ char;
  }
  return (hash >>> 0).toString(36).padStart(6, '0');
}

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

export function generateMantraCSS(config: any) {
  const baseHash = hash(JSON.stringify(config.base || {}));
  const baseClassName = `mantra-${baseHash}`;
  let cssText = '';
  const variantClassMappings: Record<string, Record<string, string>> = {};

  if (config.base) {
    cssText += stringifyCSS(`.${baseClassName}`, config.base);
  }

  if (config.variants) {
    for (const [vName, vMap] of Object.entries(config.variants)) {
      variantClassMappings[vName] = {};
      for (const [vValue, vStyle] of Object.entries(vMap as Record<string, any>)) {
        const vClass = `${baseClassName}-${vName}-${vValue}`;
        variantClassMappings[vName][vValue] = vClass;
        cssText += stringifyCSS(`.${vClass}`, vStyle);
      }
    }
  }

  return { baseClassName, variantClassMappings, cssText };
}
