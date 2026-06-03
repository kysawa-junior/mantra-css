// ============================================================================
// MANTRA TYPES - Advanced Zero-Runtime CSS-in-JS Architecture
// ============================================================================
// Core type definitions with advanced inference, auto-complete support,
// and comprehensive CSS property typing for optimal DX.
// ============================================================================

/**
 * CSS value types with token reference support
 * Supports string, number (auto-px), null, undefined, and token references ($token)
 */
export type CSSPropertyValue = string | number | null | undefined;

/**
 * Token reference type - enables $token syntax with autocomplete
 */
export type TokenReference<T extends string> = `$${T}`;

/**
 * CSS Custom Property reference
 */
export type CSSVariableReference<T extends string> = `var(--${T})`;

/**
 * Breakpoint names from theme
 */
export type BreakpointName<T extends ThemeTokens> = keyof T['breakpoints'] & string;

/**
 * Pseudo selectors with full CSS support
 */
export type PseudoSelectors = 
  // State pseudo-classes
  | ':hover' | ':active' | ':focus' | ':focus-visible' | ':focus-within'
  | ':disabled' | ':enabled' | ':checked' | ':indeterminate'
  | ':valid' | ':invalid' | ':required' | ':optional'
  | ':read-only' | ':read-write' | ':placeholder-shown'
  | ':autofill' | ':visited' | ':link' | ':target'
  // Tree structural pseudo-classes
  | ':first-child' | ':last-child' | ':only-child'
  | ':first-of-type' | ':last-of-type' | ':only-of-type'
  | ':nth-child' | ':nth-last-child' | ':nth-of-type' | ':nth-last-of-type'
  | ':not' | ':where' | ':is' | ':has'
  // Content pseudo-elements
  | '::before' | '::after' | '::first-letter' | '::first-line'
  | '::selection' | '::marker' | '::placeholder' | '::backdrop'
  // Scrollbar pseudo-elements (WebKit)
  | '::-webkit-scrollbar' | '::-webkit-scrollbar-thumb' | '::-webkit-scrollbar-track'
  // Spelling/grammar pseudo-elements
  | '::spelling-error' | '::grammar-error';

/**
 * Media query conditions with common breakpoints
 */
export type MediaQueryCondition = 
  | '@media (min-width: 0)' | '@media (min-width: 640px)' | '@media (min-width: 768px)'
  | '@media (min-width: 1024px)' | '@media (min-width: 1280px)' | '@media (min-width: 1536px)'
  | '@media (max-width: 640px)' | '@media (max-width: 768px)' | '@media (max-width: 1024px)'
  | '@media (max-width: 1280px)' | '@media (max-width: 1536px)'
  | '@media (prefers-color-scheme: dark)' | '@media (prefers-color-scheme: light)'
  | '@media (prefers-reduced-motion: reduce)' | '@media (prefers-reduced-motion: no-preference)'
  | '@media print' | '@media screen' | '@media speech'
  | '@media (orientation: portrait)' | '@media (orientation: landscape)'
  | '@media (hover: hover)' | '@media (hover: none)'
  | '@media (pointer: fine)' | '@media (pointer: coarse)'
  | string;

/**
 * Support condition for @supports rule
 */
export type SupportCondition = 
  | '@supports (display: grid)' | '@supports (display: flex)'
  | '@supports (-webkit-backdrop-filter: blur(1px))'
  | string;

/**
 * Standard CSS properties with proper value typing
 * Comprehensive coverage of all CSS properties
 */
export interface StandardCSSProperties {
  // Box Model
  width?: CSSPropertyValue;
  height?: CSSPropertyValue;
  minWidth?: CSSPropertyValue;
  minHeight?: CSSPropertyValue;
  maxWidth?: CSSPropertyValue;
  maxHeight?: CSSPropertyValue;
  boxSizing?: 'border-box' | 'content-box' | 'border-box';
  
  // Margin
  margin?: CSSPropertyValue;
  marginTop?: CSSPropertyValue;
  marginRight?: CSSPropertyValue;
  marginBottom?: CSSPropertyValue;
  marginLeft?: CSSPropertyValue;
  marginX?: CSSPropertyValue;
  marginY?: CSSPropertyValue;
  
  // Padding
  padding?: CSSPropertyValue;
  paddingTop?: CSSPropertyValue;
  paddingRight?: CSSPropertyValue;
  paddingBottom?: CSSPropertyValue;
  paddingLeft?: CSSPropertyValue;
  paddingX?: CSSPropertyValue;
  paddingY?: CSSPropertyValue;
  
  // Border
  border?: CSSPropertyValue;
  borderTop?: CSSPropertyValue;
  borderRight?: CSSPropertyValue;
  borderBottom?: CSSPropertyValue;
  borderLeft?: CSSPropertyValue;
  borderWidth?: CSSPropertyValue;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  borderColor?: CSSPropertyValue;
  borderRadius?: CSSPropertyValue;
  borderTopLeftRadius?: CSSPropertyValue;
  borderTopRightRadius?: CSSPropertyValue;
  borderBottomLeftRadius?: CSSPropertyValue;
  borderBottomRightRadius?: CSSPropertyValue;
  
  // Flexbox
  display?: 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'block' | 'inline-block' | 'none' | 'contents' | 'table' | 'table-row' | 'table-cell' | 'list-item';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  flex?: CSSPropertyValue;
  flexGrow?: CSSPropertyValue;
  flexShrink?: CSSPropertyValue;
  flexBasis?: CSSPropertyValue;
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap?: CSSPropertyValue;
  rowGap?: CSSPropertyValue;
  columnGap?: CSSPropertyValue;
  
  // Grid
  gridTemplateColumns?: CSSPropertyValue;
  gridTemplateRows?: CSSPropertyValue;
  gridColumn?: CSSPropertyValue;
  gridRow?: CSSPropertyValue;
  gridColumnStart?: CSSPropertyValue;
  gridColumnEnd?: CSSPropertyValue;
  gridRowStart?: CSSPropertyValue;
  gridRowEnd?: CSSPropertyValue;
  gridAutoFlow?: 'row' | 'column' | 'row dense' | 'column dense';
  gridAutoColumns?: CSSPropertyValue;
  gridAutoRows?: CSSPropertyValue;
  
  // Position
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: CSSPropertyValue;
  right?: CSSPropertyValue;
  bottom?: CSSPropertyValue;
  left?: CSSPropertyValue;
  inset?: CSSPropertyValue;
  zIndex?: CSSPropertyValue;
  
  // Typography
  font?: CSSPropertyValue;
  fontFamily?: CSSPropertyValue;
  fontSize?: CSSPropertyValue;
  fontWeight?: CSSPropertyValue;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontVariant?: CSSPropertyValue;
  lineHeight?: CSSPropertyValue;
  letterSpacing?: CSSPropertyValue;
  textAlign?: 'left' | 'right' | 'center' | 'justify' | 'start' | 'end';
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  textDecoration?: CSSPropertyValue;
  textDecorationLine?: 'none' | 'underline' | 'overline' | 'line-through';
  textDecorationColor?: CSSPropertyValue;
  textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy';
  textDecorationThickness?: CSSPropertyValue;
  textUnderlineOffset?: CSSPropertyValue;
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line' | 'break-spaces';
  wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word';
  overflowWrap?: 'normal' | 'break-word' | 'anywhere';
  textOverflow?: 'clip' | 'ellipsis';
  verticalAlign?: 'baseline' | 'top' | 'middle' | 'bottom' | 'text-top' | 'text-bottom' | 'sub' | 'super';
  textIndent?: CSSPropertyValue;
  
  // Colors & Backgrounds
  color?: CSSPropertyValue;
  background?: CSSPropertyValue;
  backgroundColor?: CSSPropertyValue;
  backgroundImage?: CSSPropertyValue;
  backgroundRepeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | 'space' | 'round';
  backgroundSize?: CSSPropertyValue;
  backgroundPosition?: CSSPropertyValue;
  backgroundAttachment?: 'scroll' | 'fixed' | 'local';
  backgroundClip?: 'border-box' | 'padding-box' | 'content-box' | 'text';
  backgroundOrigin?: 'border-box' | 'padding-box' | 'content-box';
  opacity?: CSSPropertyValue;
  
  // Shadow & Filter
  boxShadow?: CSSPropertyValue;
  textShadow?: CSSPropertyValue;
  filter?: CSSPropertyValue;
  backdropFilter?: CSSPropertyValue;
  
  // Transform & Animation
  transform?: CSSPropertyValue;
  transformOrigin?: CSSPropertyValue;
  transformStyle?: 'flat' | 'preserve-3d';
  transition?: CSSPropertyValue;
  transitionProperty?: CSSPropertyValue;
  transitionDuration?: CSSPropertyValue;
  transitionTimingFunction?: CSSPropertyValue;
  transitionDelay?: CSSPropertyValue;
  animation?: CSSPropertyValue;
  animationName?: CSSPropertyValue;
  animationDuration?: CSSPropertyValue;
  animationTimingFunction?: CSSPropertyValue;
  animationDelay?: CSSPropertyValue;
  animationIterationCount?: CSSPropertyValue;
  animationDirection?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  animationFillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  animationPlayState?: 'running' | 'paused';
  
  // Visibility & Overflow
  visibility?: 'visible' | 'hidden' | 'collapse';
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto' | 'clip';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto' | 'clip';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto' | 'clip';
  overscrollBehavior?: 'auto' | 'none' | 'contain';
  overscrollBehaviorX?: 'auto' | 'none' | 'contain';
  overscrollBehaviorY?: 'auto' | 'none' | 'contain';
  
  // List
  listStyle?: CSSPropertyValue;
  listStyleType?: CSSPropertyValue;
  listStylePosition?: 'inside' | 'outside';
  listStyleImage?: CSSPropertyValue;
  
  // Table
  tableLayout?: 'auto' | 'fixed';
  borderCollapse?: 'collapse' | 'separate';
  borderSpacing?: CSSPropertyValue;
  
  // Outline
  outline?: CSSPropertyValue;
  outlineWidth?: CSSPropertyValue;
  outlineStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  outlineColor?: CSSPropertyValue;
  outlineOffset?: CSSPropertyValue;
  
  // Cursor & Pointer
  cursor?: CSSPropertyValue;
  pointerEvents?: 'auto' | 'none' | 'visiblePainted' | 'visibleFill' | 'visibleStroke' | 'all';
  touchAction?: 'auto' | 'none' | 'pan-x' | 'pan-y' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'pinch-zoom' | 'manipulation';
  
  // User Select
  userSelect?: 'auto' | 'none' | 'text' | 'all';
  
  // Content
  content?: CSSPropertyValue;
  quotes?: CSSPropertyValue;
  
  // Clip & Mask
  clipPath?: CSSPropertyValue;
  clipRule?: 'nonzero' | 'evenodd';
  mask?: CSSPropertyValue;
  maskImage?: CSSPropertyValue;
  maskSize?: CSSPropertyValue;
  maskPosition?: CSSPropertyValue;
  maskRepeat?: CSSPropertyValue;
  
  // Object Fit
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  objectPosition?: CSSPropertyValue;
  
  // Resize & Scroll
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  scrollBehavior?: 'auto' | 'smooth';
  scrollSnapType?: 'none' | 'x mandatory' | 'y mandatory' | 'both mandatory';
  scrollSnapAlign?: 'none' | 'start' | 'end' | 'center';
  
  // Column
  columnCount?: CSSPropertyValue;
  columnWidth?: CSSPropertyValue;
  columnRule?: CSSPropertyValue;
  columnSpan?: 'none' | 'all';
  
  // Break
  breakBefore?: 'auto' | 'avoid' | 'always' | 'all' | 'avoid-page' | 'page' | 'left' | 'right' | 'recto' | 'verso';
  breakAfter?: 'auto' | 'avoid' | 'always' | 'all' | 'avoid-page' | 'page' | 'left' | 'right' | 'recto' | 'verso';
  breakInside?: 'auto' | 'avoid' | 'avoid-page' | 'avoid-column';
  
  // Hyphens & Writing
  hyphens?: 'none' | 'manual' | 'auto';
  writingMode?: 'horizontal-tb' | 'vertical-rl' | 'vertical-lr';
  direction?: 'ltr' | 'rtl';
  unicodeBidi?: 'normal' | 'embed' | 'bidi-override' | 'isolate' | 'isolate-override' | 'plaintext';
  
  // Accent Color
  accentColor?: CSSPropertyValue;
  caretColor?: CSSPropertyValue;
  
  // Mix Blend
  mixBlendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
  isolation?: 'auto' | 'isolate';
  
  // Will Change
  willChange?: CSSPropertyValue;
  
  // Zoom
  zoom?: CSSPropertyValue;
  scale?: CSSPropertyValue;
  
  // Print
  orphans?: CSSPropertyValue;
  widows?: CSSPropertyValue;
  
  // SVG Properties
  fill?: CSSPropertyValue;
  stroke?: CSSPropertyValue;
  strokeWidth?: CSSPropertyValue;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  strokeDasharray?: CSSPropertyValue;
  strokeDashoffset?: CSSPropertyValue;
  strokeMiterlimit?: CSSPropertyValue;
  strokeOpacity?: CSSPropertyValue;
  fillOpacity?: CSSPropertyValue;
  fillRule?: 'nonzero' | 'evenodd';
}

/**
 * CSS Custom Properties (variables)
 */
export interface CSSCustomProperties {
  [property: `--${string}`]: CSSPropertyValue;
}

/**
 * Vendor prefixed properties
 */
export interface VendorCSSProperties {
  WebkitAlignContent?: CSSPropertyValue;
  WebkitAlignItems?: CSSPropertyValue;
  WebkitAlignSelf?: CSSPropertyValue;
  WebkitAnimation?: CSSPropertyValue;
  WebkitAppearance?: CSSPropertyValue;
  WebkitBackdropFilter?: CSSPropertyValue;
  WebkitBackgroundClip?: CSSPropertyValue;
  WebkitBoxOrient?: CSSPropertyValue;
  WebkitBoxSizing?: CSSPropertyValue;
  WebkitFlex?: CSSPropertyValue;
  WebkitFlexBasis?: CSSPropertyValue;
  WebkitFlexDirection?: CSSPropertyValue;
  WebkitFlexFlow?: CSSPropertyValue;
  WebkitFlexGrow?: CSSPropertyValue;
  WebkitFlexShrink?: CSSPropertyValue;
  WebkitFlexWrap?: CSSPropertyValue;
  WebkitJustifyContent?: CSSPropertyValue;
  WebkitLineClamp?: CSSPropertyValue;
  WebkitOrder?: CSSPropertyValue;
  WebkitPerspective?: CSSPropertyValue;
  WebkitTapHighlightColor?: CSSPropertyValue;
  WebkitTextFillColor?: CSSPropertyValue;
  WebkitTextStroke?: CSSPropertyValue;
  WebkitTransform?: CSSPropertyValue;
  WebkitTransformOrigin?: CSSPropertyValue;
  WebkitTransformStyle?: CSSPropertyValue;
  WebkitTransition?: CSSPropertyValue;
  WebkitUserSelect?: CSSPropertyValue;
  MozAppearance?: CSSPropertyValue;
  MozOsxFontSmoothing?: CSSPropertyValue;
  MozTapHighlightColor?: CSSPropertyValue;
  MozTransform?: CSSPropertyValue;
  MozTransition?: CSSPropertyValue;
  MozUserSelect?: CSSPropertyValue;
  msHyphens?: CSSPropertyValue;
  msOverflowStyle?: CSSPropertyValue;
  msTransform?: CSSPropertyValue;
  msTransition?: CSSPropertyValue;
  OTextOverflow?: CSSPropertyValue;
}

/**
 * Complete CSS properties combining standard, custom, and vendor properties
 */
export type CSSProperties = StandardCSSProperties & CSSCustomProperties & VendorCSSProperties;

/**
 * Utility function type for transforming values into CSS properties
 */
export interface AnyUtils {
  [name: string]: (...args: readonly unknown[]) => CSSProperties;
}

/**
 * CSS object enhanced with utility function support
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
  TElement extends string | React.ComponentType<any>,
  TVariants extends VariantDefinition,
> = TElement extends keyof React.JSX.IntrinsicElements
  ? React.JSX.IntrinsicElements[TElement] &
      VariantProps<TVariants> & {
        css?: CSSProperties;
        className?: string;
        as?: keyof React.JSX.IntrinsicElements;
        asChild?: boolean;
      }
  : TElement extends React.ComponentType<infer P>
    ? P &
        VariantProps<TVariants> & {
          css?: CSSProperties;
          className?: string;
          as?: React.ComponentType<any>;
          asChild?: boolean;
        }
    : never;

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
// END OF FILE - All types are already exported individually above
// ============================================================================
