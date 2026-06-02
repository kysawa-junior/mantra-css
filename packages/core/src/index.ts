// ============================================================================
// MANTRA CORE - Main Entry Point
// Bundler Agnostic Zero-Runtime CSS-in-JS
// ============================================================================
// Universal core API for creating styled components and extracting CSS.
// This package is bundler-agnostic and contains only pure functions.
// ============================================================================

// Hash utilities
export {
  hash,
  fastHash,
  hashMultiple,
  hashObject,
  murmurHash,
  generateId,
  resetIdCounter,
} from './hashing/hash';

// CSS serialization utilities
export {
  camelToKebab,
  serializeValue,
  stringifyCSS,
  stringifyCSSMultiple,
  stringifyCSSWithMedia,
  stringifyCSSWithPseudo,
  createCSSVariable,
  cssVar,
  parseTokenRef,
  buildStyleSheet,
  minifyCSS,
} from './serializer/stringify';

// CSS generation engine
export {
  generateVariantClassName,
  buildVariantClassMappings,
  generateVariantCSS,
  resolveVariantClasses,
  getVariantPropNames,
  separateVariantProps,
  createVariantResolver,
  generateBaseCSS,
  generateCSS,
  mergeStyledConfigs,
} from './css/generate';

// Re-export all types from @mantra/types
export type {
  CSSPropertyValue,
  CSSProperties,
  AnyUtils,
  CSSWithUtils,
  UtilsFn,
  VariantDefinition,
  VariantProps,
  CompoundVariant,
  StyledConfig,
  ThemeScaleMap,
  ThemeTokens,
  MediaQueries,
  MantraConfig,
  StyledRecipe,
  CSSResult,
  ThemeResult,
  GlobalCSSResult,
  KeyframesResult,
  HashFunction,
  StringifyCSSFunction,
  StyleTransform,
  TransformContext,
  StyledComponentProps,
  RecipeComposeOptions,
  SlotDefinition,
  SlotRecipe,
  MultiVariantRecipe,
  AtomicClass,
  StyleSheet,
  ExtractionContext,
  CompilerOptions,
  ExtractionResult,
  ExtractionError,
  CompilerPlugin,
  PluginContext,
  TransformResult,
  SourceMap,
  InjectionOptions,
  StyleSheetManager,
  HydrationOptions,
  RequireKeys,
  DeepPartial,
  Merge,
  NonUndefined,
  ReturnTypeOf,
  ParametersOf,
  Fn,
  Nullable,
  ReadonlyDeep,
  ValueOf,
  ArrayElement,
  Awaited,
  ResolvedModule,
  EmittedFile,
  ModuleInfo,
  ResolvedId,
  Warning,
  RenderChunk,
  RenderResult,
  Bundle,
  BundlerAdapter,
  AdapterSetupOptions,
  AdapterInstance,
  LoadResult,
} from '@mantra/types';

/**
 * Create a Mantra instance with the provided configuration
 */
export function createMantra<TUtils extends AnyUtils>(config: MantraConfig<TUtils> = {} as MantraConfig<TUtils>) {
  const prefix = config.prefix || 'mantra';
  
  function styled<TElement extends string>(
    element: TElement,
    styledConfig: StyledConfig<TUtils>
  ): StyledRecipe {
    return generateCSS(styledConfig, element, prefix);
  }
  
  function css(styles: CSSWithUtils<AnyUtils>): CSSResult {
    const className = `${prefix}-${hash(JSON.stringify(styles))}`;
    const cssText = stringifyCSS(`.${className}`, styles);
    return { className, cssText };
  }
  
  function globalCss(styles: Record<string, CSSProperties>): GlobalCSSResult {
    let cssText = '';
    for (const [selector, style] of Object.entries(styles)) {
      cssText += stringifyCSS(selector, style);
    }
    return { cssText };
  }
  
  function keyframes(name: string, frames: Record<string, CSSProperties>): KeyframesResult {
    let cssText = `@keyframes ${name}{`;
    for (const [keyframe, style] of Object.entries(frames)) {
      cssText += `${keyframe}{`;
      for (const [prop, value] of Object.entries(style)) {
        cssText += `${camelToKebab(prop)}:${serializeValue(value, prop)};`;
      }
      cssText += '}';
    }
    cssText += '}';
    return { name, cssText };
  }
  
  return { styled, css, globalCss, keyframes, config };
}

export const mantra = createMantra();
export const VERSION = '1.0.0';
