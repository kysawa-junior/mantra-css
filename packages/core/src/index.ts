// ============================================================================
// MANTRA CORE - Main Entry Point
// Bundler Agnostic Zero-Runtime CSS-in-JS
// ============================================================================
// Universal core API for creating styled components and extracting CSS.
// This package is bundler-agnostic and contains only pure functions.
// ============================================================================

import type {
  AnyUtils,
  MantraConfig,
  StyledConfig,
  StyledRecipe,
  KeyframesResult,
  CSSProperties,
  GlobalCSSResult,
} from '@mantra/types';

import type { KeyframesDefinition } from './css/generate';
import {
  createCSS,
  createKeyframes,
  generateCSS,
  stringifyCSS,
} from './index.internal';

// Hash utilities
export {
  hash,
  fastHash,
  hashMultiple,
  hashObject,
  murmurHash,
  generateId,
  resetIdCounter,
  getIdCounter,
  setIdCounter,
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
  createKeyframes,
  createCSS,
  compose,
  mergeCSS,
  transformTokens,
  type KeyframesDefinition,
} from './css/generate';

// Advanced CSS processing (nested selectors, pseudo-selectors, media queries)
export { processNestedCSS } from './css/index';

export type {
  NestedSelectors,
  CSSWithPseudo,
  CSSWithMedia,
  AdvancedCSSObject,
  CSSOptions,
} from './css/index';

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
  PseudoSelectors,
  MediaQueryCondition,
  SupportCondition,
  TokenReference,
  CSSVariableReference,
  BreakpointName,
  StandardCSSProperties,
  CSSCustomProperties,
  VendorCSSProperties,
} from '@mantra/types';

/**
 * Create a Mantra instance with the provided configuration
 */
export function createMantra<TUtils extends AnyUtils>(config: MantraConfig<TUtils> = {} as MantraConfig<TUtils>) {
  const prefix = config.prefix || 'mantra';
  
  // Create css and keyframes functions with the configured prefix
  const css = createCSS<TUtils>(prefix);
  
  function styled<TElement extends string>(
    element: TElement,
    styledConfig: StyledConfig<TUtils>
  ): StyledRecipe {
    return generateCSS(styledConfig, element, prefix);
  }
  
  function keyframes(frames: KeyframesDefinition, name?: string): KeyframesResult {
    return createKeyframes(frames, name, prefix);
  }
  
  function globalCss(styles: Record<string, CSSProperties>): GlobalCSSResult {
    let cssText = '';
    for (const [selector, style] of Object.entries(styles)) {
      cssText += stringifyCSS(selector, style);
    }
    return { cssText };
  }
  
  return { styled, css, keyframes, globalCss, config };
}

export const mantra = createMantra();
export const VERSION = '1.0.0';
