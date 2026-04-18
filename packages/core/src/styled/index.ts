import React from 'react';
import { hash, stringifyCSS } from '../core';
import { StyledConfig, StyledComponent, CSSWithUtils, AnyUtils } from '../types';

export function createStyled(config: any) {
  return function styled<T extends keyof React.JSX.IntrinsicElements>(
    element: T
  ) {
    return function <TUtils extends AnyUtils>(
      styledConfig: StyledConfig<any, TUtils>
    ): StyledComponent<React.ComponentProps<T> & { css?: CSSWithUtils<TUtils> }> {
      
      const className = `mantra-${hash(JSON.stringify(styledConfig))}`;
      
      let cssText = '';
      if (styledConfig.base) {
        cssText += stringifyCSS(`.${className}`, styledConfig.base);
      }

      if (styledConfig.variants) {
        for (const [vName, vMap] of Object.entries(styledConfig.variants)) {
          for (const [vValue, vStyle] of Object.entries(vMap as Record<string, any>)) {
            const vClass = `${className}-${vName}-${vValue}`;
            cssText += stringifyCSS(`.${vClass}`, vStyle);
          }
        }
      }

      // React 19 Component: ref is just a standard prop
      const Component = (props: any) => {
        const { ref, className: externalClassName, css, ...restProps } = props;
        let computedClassName = className;

        // Handle variants and remove them from restProps so they don't hit the DOM
        if (styledConfig.variants) {
          for (const [vName, vMap] of Object.entries(styledConfig.variants)) {
            const vValue = restProps[vName];
            if (vValue && (vMap as Record<string, any>)[vValue]) {
              computedClassName += ` ${className}-${vName}-${vValue}`;
            }
            delete restProps[vName]; // Prevent leaking to DOM
          }
        }

        // Handle dynamic css prop
        if (css) {
          const dynamicClass = `mantra-css-${hash(JSON.stringify(css))}`;
          computedClassName += ` ${dynamicClass}`;
        }

        // Handle external className
        if (externalClassName) {
          computedClassName += ` ${externalClassName}`;
        }

        // Fix 2: Cast 'element' to string. keyof IntrinsicElements can be string | number | symbol,
        // but React.createElement only accepts strings or components.
        return React.createElement(element as string, { ...restProps, ref, className: computedClassName });
      };

      // Fix 3: Wrap element in String() to avoid the "Implicit conversion of a 'symbol' to a 'string'" error
      Component.displayName = `Mantra(${String(element)})`;
      
      // Attach metadata for the Babel plugin to extract during build time
      (Component as any).__mantra__ = {
        baseClassName: className,
        cssText,
        config: styledConfig,
      };

      return Component;
    };
  };
}