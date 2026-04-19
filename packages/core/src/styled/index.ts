import { hash, stringifyCSS } from "../core";
import {
  StyledConfig,
  StyledRecipe,
  CSSWithUtils,
  VariantDefinition,
  AnyUtils,
} from "../types";

export function createStyled(config: any) {
  return function styled<
    T extends string,
    TVariants extends VariantDefinition,
    TUtils extends AnyUtils,
  >(
    element: T,
    styledConfig: StyledConfig<TUtils> & { variants?: TVariants },
  ): StyledRecipe<TVariants> {
    const className = `mantra-${hash(JSON.stringify(styledConfig))}`;
    let cssText = "";
    const variantClassMappings: Record<string, Record<string, string>> = {};

    if (styledConfig.base) {
      cssText += stringifyCSS(`.${className}`, styledConfig.base);
    }

    if (styledConfig.variants) {
      for (const [vName, vMap] of Object.entries(styledConfig.variants)) {
        variantClassMappings[vName] = {};
        for (const [vValue, vStyle] of Object.entries(
          vMap as Record<string, any>,
        )) {
          const vClass = `${className}-${vName}-${vValue}`;
          variantClassMappings[vName][vValue] = vClass;
          cssText += stringifyCSS(`.${vClass}`, vStyle);
        }
      }
    }

    const resolve = (props: Record<string, any>): string => {
      let computedClassName = className;

      for (const [vName, vMap] of Object.entries(variantClassMappings)) {
        const vValue = props[vName];
        if (vValue && vMap[vValue]) {
          computedClassName += ` ${vMap[vValue]}`;
        }
      }

      if (props.className) {
        computedClassName += ` ${props.className}`;
      }

      return computedClassName;
    };

    return {
      element,
      baseClassName: className,
      cssText,
      variantClassMappings,
      resolve,
    };
  };
}
