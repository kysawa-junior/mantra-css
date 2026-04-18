import { hash, stringifyCSS } from '../core';
import { CSSWithUtils } from '../types';

export function createCss(config: any) {
  return function css(style: CSSWithUtils<any>) {
    // In a zero-runtime environment, the Babel plugin replaces this call.
    // This runtime code exists for uncompiled usage (e.g. testing/SSR) and type inference.
    const styleString = JSON.stringify(style);
    const className = `css-${hash(styleString)}`;
    const cssText = stringifyCSS(`.${className}`, style);
    
    return {
      className,
      cssText,
    };
  };
}
