// ============================================================================
// MANTRA TYPES - Bundler Agnostic Architecture
// ============================================================================
// Core type definitions for the Mantra zero-runtime CSS-in-JS library.
// These types are designed to be bundler-agnostic and work across:
// - Vite, Webpack, Rspack, Rollup, ESBuild, RSBuild, Bun, Turbopack
// - SSR, RSC, Edge Runtime, Node.js, Browser environments
// ============================================================================

/**
 * Base CSS property value type
 * Supports strings, numbers (auto-converted to px), and special values
 */
export type CSSPropertyValue = string | number | null | undefined;

/**
 * Standard CSS properties interface
 * Uses index signature to allow any valid CSS property
 */
export interface CSSProperties {
  [property: `--${string}`]: CSSPropertyValue;
  [property: string]: CSSPropertyValue;
}

/**
 * Utility function type for transforming values into CSS properties
 * Utils enable shorthand properties and custom transformations
 */
export interface AnyUtils {
  [name: string]: (...args: readonly unknown[]) => CSSProperties;
}

/**
 * CSS object enhanced with utility function support
 * Allows using utility functions directly in style objects
 */
export type CSSWithUtils<TUtils extends AnyUtils> = CSSProperties & {
  [K in keyof TUtils]?: Parameters<TUtils[K]>[0];
};

/**
 * Generic utility type for any utils object
 */
export type UtilsFn<TArgs extends readonly unknown[] = readonly unknown[]> = (
  ...args: TArgs
) => CSSProperties;

// ============================================================================
// VARIANT SYSTEM TYPES
// ============================================================================

/**
 * Definition of variant configurations
 * Each variant name maps to multiple variant values with associated styles
 */
export interface VariantDefinition {
  [variantName: string]: {
    [variantValue: string]: CSSProperties;
  };
}

/**
 * Extract variant prop names and their allowed values from a VariantDefinition
 */
export type VariantProps<V extends VariantDefinition> = {
  [K in keyof V]?: keyof V[K];
};

/**
 * Compound variant configuration
 * Apply styles when multiple variant conditions are met
 */
export interface CompoundVariant<TUtils extends AnyUtils = AnyUtils> {
  variants: Record<string, string>;
  css?: CSSWithUtils<TUtils>;
  className?: string;
}

/**
 * Styled component configuration
 */
export interface StyledConfig<TUtils extends AnyUtils = AnyUtils> {
  /** Base styles applied to all instances */
  baseStyle?: CSSWithUtils<TUtils>;
  /** Alias for baseStyle */
  base?: CSSWithUtils<TUtils>;
  /** Variant definitions */
  variants?: VariantDefinition;
  /** Compound variant rules */
  compoundVariants?: CompoundVariant<TUtils>[];
  /** Default variant values */
  defaultVariants?: Record<string, string>;
  /** Responsive variants (optional, framework-specific) */
  responsiveVariants?: boolean;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Theme token scales
 * Organizes design tokens by category
 */
export interface ThemeScaleMap {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  sizes: Record<string, string>;
  fonts: Record<string, string>;
  fontSizes: Record<string, string>;
  fontWeights: Record<string, string>;
  lineHeights: Record<string, string>;
  radii: Record<string, string>;
  shadows: Record<string, string>;
  zIndices: Record<string, string>;
  transitions: Record<string, string>;
  breakpoints: Record<string, string>;
  [scale: string]: Record<string, string>;
}

/**
 * Theme tokens structure
 */
export type ThemeTokens = Partial<ThemeScaleMap>;

/**
 * Media query configuration
 */
export interface MediaQueries {
  [name: string]: string;
}

/**
 * Main configuration for creating a Mantra instance
 */
export interface MantraConfig<TUtils extends AnyUtils = AnyUtils> {
  theme?: ThemeTokens;
  media?: MediaQueries;
  utils?: TUtils;
  prefix?: string;
  hashLength?: number;
}

// ============================================================================
// RESULT TYPES
// ============================================================================

/**
 * Result from styled() call - framework agnostic recipe
 * This is the core output that adapters consume
 */
export interface StyledRecipe<TVariants extends VariantDefinition = VariantDefinition> {
  /** HTML element or component type */
  element: string;
  /** Base class name for this component */
  baseClassName: string;
  /** Complete CSS text for all styles */
  cssText: string;
  /** Mapping of variant names to value-to-class mappings */
  variantClassMappings: Record<string, Record<string, string>>;
  /** Default variant values */
  defaultVariants?: Record<string, string>;
  /** Function to resolve final className from variant props */
  resolve: (props: VariantProps<TVariants> & { className?: string }) => string;
  /** Metadata for extraction */
  __mantra?: {
    config: StyledConfig;
    extractedAt?: string;
    sourceFile?: string;
  };
}

/**
 * Result from css() call
 */
export interface CSSResult {
  className: string;
  cssText: string;
  selectors?: string[];
}

/**
 * Result from theme creation
 */
export interface ThemeResult {
  className: string;
  cssText: string;
  vars: Record<string, string>;
  tokens: ThemeTokens;
}

/**
 * Global CSS injection result
 */
export interface GlobalCSSResult {
  cssText: string;
  id?: string;
}

/**
 * Keyframes result
 */
export interface KeyframesResult {
  name: string;
  cssText: string;
}

// ============================================================================
// FUNCTION SIGNATURES
// ============================================================================

/**
 * Hash function for generating stable class names
 */
export type HashFunction = (input: string) => string;

/**
 * CSS serialization function
 */
export type StringifyCSSFunction = (selector: string, styles: CSSProperties) => string;

/**
 * Style transformation function
 */
export type StyleTransform = (styles: CSSProperties, context: TransformContext) => CSSProperties;

/**
 * Context for style transformations
 */
export interface TransformContext {
  theme?: ThemeTokens;
  media?: MediaQueries;
  utils?: AnyUtils;
  hash?: HashFunction;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * Props for styled components with variant support
 */
export type StyledComponentProps<
  T extends keyof JSX.IntrinsicElements | React.ComponentType<any>,
  TVariants extends VariantDefinition,
> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T] &
      VariantProps<TVariants> & {
        css?: CSSProperties;
        className?: string;
        as?: keyof JSX.IntrinsicElements;
        asChild?: boolean;
      }
  : React.ComponentProps<T> &
      VariantProps<TVariants> & {
        css?: CSSProperties;
        className?: string;
        as?: React.ComponentType<any>;
        asChild?: boolean;
      };

/**
 * Recipe composition options for runtime merging
 */
export interface RecipeComposeOptions<TVariants extends VariantDefinition> {
  variants?: Partial<{
    [K in keyof TVariants]: keyof TVariants[K];
  }>;
  className?: string;
  css?: CSSProperties;
}

// ============================================================================
// SLOT & MULTI-VARIANT TYPES
// ============================================================================

/**
 * Slot-based style definition for composite components
 */
export type SlotDefinition = Record<string, CSSProperties>;

/**
 * Slot recipe for components with multiple parts
 */
export interface SlotRecipe<
  TSlots extends string,
  TVariants extends VariantDefinition,
> {
  slots: readonly TSlots[];
  variants: TVariants;
  defaultVariants?: Record<string, string>;
  slotStyles: Record<TSlots, CSSProperties>;
}

/**
 * Multi-variant recipe configuration
 */
export interface MultiVariantRecipe<
  TSlots extends Record<string, string>,
  TVariants extends VariantDefinition,
> {
  slots: TSlots;
  variants: TVariants;
  defaultVariants?: Record<string, string>;
}

// ============================================================================
// ATOMIC CSS TYPES
// ============================================================================

/**
 * Atomic CSS class representation
 */
export interface AtomicClass {
  id: string;
  selector: string;
  cssText: string;
  specificity: number;
  layer?: string;
  media?: string;
  support?: string;
}

/**
 * Style sheet representation for extraction
 */
export interface StyleSheet {
  classes: Map<string, AtomicClass>;
  layers: Map<string, AtomicClass[]>;
  cssText: string;
}

/**
 * Extraction context for build-time processing
 */
export interface ExtractionContext {
  fileName: string;
  componentName: string;
  filePath: string;
  styles: StyleSheet;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// COMPILER & EXTRACTOR TYPES
// ============================================================================

/**
 * Compiler options for the bundler-agnostic compiler
 */
export interface CompilerOptions {
  cwd?: string;
  outDir?: string;
  minify?: boolean;
  sourcemap?: boolean | 'inline' | 'external';
  target?: string | string[];
  define?: Record<string, string>;
  alias?: Record<string, string>;
}

/**
 * Extraction result from the extractor
 */
export interface ExtractionResult {
  cssText: string;
  atoms: AtomicClass[];
  files: string[];
  errors: ExtractionError[];
}

/**
 * Extraction error information
 */
export interface ExtractionError {
  file: string;
  line: number;
  column: number;
  message: string;
  code?: string;
}

/**
 * Plugin interface for extending the compiler
 */
export interface CompilerPlugin {
  name: string;
  setup?: (ctx: PluginContext) => void | Promise<void>;
  transform?: (code: string, id: string) => TransformResult | Promise<TransformResult>;
  renderChunk?: (chunk: RenderChunk) => RenderResult | Promise<RenderResult>;
  generateBundle?: (bundle: Bundle) => void | Promise<void>;
}

/**
 * Plugin context provided to plugins
 */
export interface PluginContext {
  options: CompilerOptions;
  addWatchFile: (id: string) => void;
  emitFile: (file: EmittedFile) => void;
  getModuleInfo: (id: string) => ModuleInfo | null;
  resolve: (id: string, importer?: string) => Promise<ResolvedId | null>;
  warn: (warning: string | Warning) => void;
  error: (error: string | Error) => never;
}

/**
 * Transform result from plugin hooks
 */
export interface TransformResult {
  code?: string;
  map?: SourceMap;
  css?: string;
  sideEffects?: boolean;
}

/**
 * Source map format
 */
export interface SourceMap {
  version: number;
  sources: string[];
  sourcesContent?: string[];
  mappings: string;
  names?: string[];
}

// ============================================================================
// RUNTIME & INJECTION TYPES
// ============================================================================

/**
 * Runtime style injection options
 */
export interface InjectionOptions {
  priority?: number;
  layer?: string;
  media?: string;
  prepend?: boolean;
}

/**
 * Runtime style sheet manager interface
 */
export interface StyleSheetManager {
  inject: (id: string, css: string, options?: InjectionOptions) => void;
  remove: (id: string) => void;
  clear: () => void;
  toString: () => string;
  tags: Map<string, HTMLStyleElement>;
}

/**
 * SSR hydration options
 */
export interface HydrationOptions {
  nonce?: string;
  container?: HTMLElement;
  prefix?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make specific properties required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make all properties deeply partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown> ? DeepPartial<T[P]> : T[P];
};

/**
 * Merge two types, with U taking precedence
 */
export type Merge<T, U> = Omit<T, keyof U> & U;

/**
 * Remove undefined from a type
 */
export type NonUndefined<T> = Exclude<T, undefined>;

/**
 * Get the return type of a function
 */
export type ReturnTypeOf<T extends (...args: unknown[]) => unknown> = ReturnType<T>;

/**
 * Get the parameters of a function
 */
export type ParametersOf<T extends (...args: unknown[]) => unknown> = Parameters<T>;

/**
 * Generic function type
 */
export type Fn<TInput = unknown, TOutput = unknown> = (arg: TInput) => TOutput;

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null | undefined;

/**
 * Read-only deep
 */
export type ReadonlyDeep<T> = {
  readonly [P in keyof T]: T[P] extends Record<string, unknown>
    ? ReadonlyDeep<T[P]>
    : T[P];
};

/**
 * ValueOf helper - extract value types from an object
 */
export type ValueOf<T> = T[keyof T];

/**
 * Array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Promise unwrap type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

// ============================================================================
// BUNDLER AGNOSTIC MODULE TYPES
// ============================================================================

/**
 * Module resolution result
 */
export interface ResolvedModule {
  id: string;
  code: string;
  map?: SourceMap;
  meta?: Record<string, unknown>;
}

/**
 * Emitted file for build output
 */
export interface EmittedFile {
  type: 'asset' | 'chunk';
  fileName?: string;
  source?: string;
  code?: string;
  map?: SourceMap;
}

/**
 * Module information
 */
export interface ModuleInfo {
  id: string;
  code: string;
  imports: string[];
  dynamicImports: string[];
  exports: string[];
  isEntry: boolean;
  isExternal: boolean;
}

/**
 * Resolved import ID
 */
export interface ResolvedId {
  id: string;
  external?: boolean;
  resolvedBy?: string;
}

/**
 * Warning object
 */
export interface Warning {
  message: string;
  plugin?: string;
  id?: string;
  loc?: { line: number; column: number };
}

/**
 * Render chunk info
 */
export interface RenderChunk {
  code: string;
  map?: SourceMap;
  modules: Record<string, ModuleInfo>;
}

/**
 * Render result
 */
export interface RenderResult {
  code?: string;
  map?: SourceMap;
}

/**
 * Bundle representation
 */
export interface Bundle {
  chunks: Record<string, RenderChunk>;
  assets: Record<string, EmittedFile>;
}

// ============================================================================
// ADAPTER TYPES
// ============================================================================

/**
 * Base adapter interface for bundler integration
 * Each bundler (Vite, Webpack, etc.) implements this interface
 */
export interface BundlerAdapter {
  name: string;
  setup: (options: AdapterSetupOptions) => AdapterInstance;
}

/**
 * Options for setting up an adapter
 */
export interface AdapterSetupOptions {
  compilerOptions: CompilerOptions;
  mantraConfig: MantraConfig;
  watchMode?: boolean;
}

/**
 * Instance returned by adapter setup
 */
export interface AdapterInstance {
  transform?: (code: string, id: string) => TransformResult | Promise<TransformResult>;
  load?: (id: string) => LoadResult | Promise<LoadResult>;
  resolveId?: (id: string, importer?: string) => ResolvedId | null | Promise<ResolvedId | null>;
  buildStart?: () => void | Promise<void>;
  buildEnd?: () => void | Promise<void>;
  closeBundle?: () => void | Promise<void>;
}

/**
 * Load result from adapter
 */
export interface LoadResult {
  code: string;
  map?: SourceMap;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  CSSPropertyValue,
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
};
