import { createStyled } from "./styled";
import { createCss } from "./css";
import { createThemeTokens } from "./theme";
import { MantraConfig } from "./types";
import { stringifyCSS } from "./core";

export type {
  MantraConfig,
  StyledConfig,
  CSSWithUtils,
  StyledRecipe,
  VariantProps,
  VariantDefinition
} from "./types";

export function createMantra(config: MantraConfig = {}) {
  const themeResult = createThemeTokens(config.theme || {});
  const styled = createStyled(config);
  const css = createCss(config);

  return {
    styled,
    css,
    theme: themeResult,
    globalCss: (styles: Record<string, any>) => {
      let cssText = "";
      for (const [selector, style] of Object.entries(styles)) {
        cssText += stringifyCSS(selector, style);
      }
      return { cssText };
    },
  };
}

export { hash, stringifyCSS } from "./core";
