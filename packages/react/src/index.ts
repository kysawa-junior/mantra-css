import React from "react";
import {
  createMantra as createVanillaMantra,
  StyledRecipe,
  VariantProps,
  VariantDefinition,
  CSSWithUtils,
  StyledConfig,
  MantraConfig,
  hash,
} from "@mantra-css/core";
import { AnyUtils } from "@mantra-css/core/dist/types";

export type {
  MantraConfig,
  StyledConfig,
  CSSWithUtils,
  VariantProps,
  StyledRecipe,
} from "@mantra-css/core";

export type MantraStyledComponent<
  T extends keyof React.JSX.IntrinsicElements,
  TVariants extends VariantDefinition,
> = (
  props: React.ComponentProps<T> &
    VariantProps<TVariants> & { css?: CSSWithUtils<any> },
) => React.ReactElement | null;

function createReactComponent<
  T extends keyof React.JSX.IntrinsicElements,
  TVariants extends VariantDefinition,
>(
  element: T,
  recipe: StyledRecipe<TVariants>,
): MantraStyledComponent<T, TVariants> {
  type ElementProps = React.ComponentProps<T>;
  type VariantPropsType = VariantProps<TVariants>;

  const Component = (
    props: ElementProps & VariantPropsType & { css?: CSSWithUtils<any> },
  ) => {
    const { ref, className, css, ...restProps } = props;

    const domProps: Record<string, any> = {};
    const variantValues: Record<string, any> = {};

    if (recipe.variantClassMappings) {
      for (const vName of Object.keys(recipe.variantClassMappings)) {
        if (props.hasOwnProperty(vName)) {
          variantValues[vName] = (props as any)[vName];
        }
      }
    }

    for (const [key, value] of Object.entries(restProps)) {
      if (!recipe.variantClassMappings?.[key] && key !== "css") {
        domProps[key] = value;
      }
    }

    let computedClassName = recipe.resolve(variantValues);

    if (css) {
      const dynamicClass = `mantra-css-${require("@mantra-css/core").hash(JSON.stringify(css))}`;
      computedClassName += ` ${dynamicClass}`;
    }

    // Handle external className
    if (className) {
      computedClassName += ` ${className}`;
    }

    return React.createElement(element, {
      ...domProps,
      ref,
      className: computedClassName,
    });
  };

  Component.displayName = `Mantra(${element})`;

  (Component as any).__mantra__ = recipe;

  return Component;
}

export function createMantra(config: MantraConfig = {}) {
  const vanillaMantra = createVanillaMantra(config);

  const styled = <
    T extends keyof React.JSX.IntrinsicElements,
    TVariants extends VariantDefinition,
    TUtils extends AnyUtils,
  >(
    element: T,
    styledConfig: StyledConfig<TUtils> & { variants?: TVariants },
  ) => {
    // 1. Generate the Vanilla Recipe (CSS + Mappings)
    const recipe = vanillaMantra.styled(element, styledConfig);

    // 2. Convert Recipe to a React Component
    return createReactComponent<T, TVariants>(element, recipe);
  };

  return {
    styled,
    css: vanillaMantra.css,
    theme: vanillaMantra.theme,
    globalCss: vanillaMantra.globalCss,
  };
}
