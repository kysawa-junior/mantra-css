import { hash, fastHash } from '@mantra/core';
import { camelToKebab, stringifyCSS } from '@mantra/core';
import type { StyledConfig, VariantDefinition } from '@mantra/types';
import type { AnyUtils } from '@mantra/types';

/**
 * Compiler options for Mantra
 */
export interface CompilerOptions {
  /** Root directory for path resolution */
  root?: string;
  /** Output directory for extracted CSS */
  outDir?: string;
  /** Enable CSS minification */
  minify?: boolean;
  /** Class name prefix */
  prefix?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Hash length for class names */
  hashLength?: number;
}

/**
 * Result of CSS generation
 */
export interface CSSGenerationResult {
  /** Base class name */
  baseClassName: string;
  /** Complete CSS text */
  cssText: string;
  /** Variant class mappings */
  variantClassMappings?: Record<string, Record<string, string>>;
  /** Default variants */
  defaultVariants?: Record<string, string>;
}

/**
 * Extracted style information
 */
export interface ExtractedStyle {
  /** Source file path */
  filePath: string;
  /** Component name */
  componentName?: string;
  /** HTML element tag */
  tag: string;
  /** Configuration object */
  config: StyledConfig<AnyUtils>;
  /** Generated class names */
  classNames: string[];
  /** Generated CSS */
  cssText: string;
}

/**
 * Compile result with all extracted data
 */
export interface CompileResult {
  /** Extracted styles */
  styles: ExtractedStyle[];
  /** Combined CSS text */
  cssText: string;
  /** Source map (if enabled) */
  sourceMap?: any;
  /** Errors encountered */
  errors: CompileError[];
}

/**
 * Compile error information
 */
export interface CompileError {
  /** File where error occurred */
  file: string;
  /** Line number */
  line: number;
  /** Column number */
  column: number;
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
}

/**
 * Plugin context provided to compiler plugins
 */
export interface PluginContext {
  /** Compiler options */
  options: CompilerOptions;
  /** Add a watch file */
  addWatchFile: (id: string) => void;
  /** Emit a file to the build output */
  emitFile: (file: EmittedFile) => void;
  /** Get module info */
  getModuleInfo: (id: string) => ModuleInfo | null;
  /** Resolve an import */
  resolve: (id: string, importer?: string) => Promise<ResolvedId | null>;
  /** Emit a warning */
  warn: (warning: string | Warning) => void;
  /** Emit an error */
  error: (error: string | Error) => never;
}

/**
 * Compiler plugin interface
 */
export interface CompilerPlugin {
  /** Plugin name */
  name: string;
  /** Setup hook */
  setup?: (ctx: PluginContext) => void | Promise<void>;
  /** Transform hook */
  transform?: (code: string, id: string) => TransformResult | Promise<TransformResult>;
  /** Render chunk hook */
  renderChunk?: (chunk: RenderChunk) => RenderResult | Promise<RenderResult>;
  /** Generate bundle hook */
  generateBundle?: (bundle: Bundle) => void | Promise<void>;
}

/**
 * Emitted file for build output
 */
export interface EmittedFile {
  /** File type */
  type: 'asset' | 'chunk';
  /** File name */
  fileName?: string;
  /** Source content */
  source?: string;
  /** Code content */
  code?: string;
  /** Source map */
  map?: any;
}

/**
 * Module information
 */
export interface ModuleInfo {
  /** Module ID */
  id: string;
  /** Module code */
  code: string;
  /** Static imports */
  imports: string[];
  /** Dynamic imports */
  dynamicImports: string[];
  /** Exports */
  exports: string[];
  /** Is entry point */
  isEntry: boolean;
  /** Is external */
  isExternal: boolean;
}

/**
 * Resolved import ID
 */
export interface ResolvedId {
  /** Resolved ID */
  id: string;
  /** Is external */
  external?: boolean;
  /** Resolver name */
  resolvedBy?: string;
}

/**
 * Warning object
 */
export interface Warning {
  /** Warning message */
  message: string;
  /** Plugin name */
  plugin?: string;
  /** File ID */
  id?: string;
  /** Location */
  loc?: { line: number; column: number };
}

/**
 * Transform result
 */
export interface TransformResult {
  /** Transformed code */
  code?: string;
  /** Source map */
  map?: any;
  /** Extracted CSS */
  css?: string;
  /** Side effects flag */
  sideEffects?: boolean;
}

/**
 * Render chunk info
 */
export interface RenderChunk {
  /** Chunk code */
  code: string;
  /** Source map */
  map?: any;
  /** Modules in chunk */
  modules: Record<string, ModuleInfo>;
}

/**
 * Render result
 */
export interface RenderResult {
  /** Result code */
  code?: string;
  /** Source map */
  map?: any;
}

/**
 * Bundle representation
 */
export interface Bundle {
  /** Chunks */
  chunks: Record<string, RenderChunk>;
  /** Assets */
  assets: Record<string, EmittedFile>;
}

/**
 * Main Mantra Compiler class
 * 
 * This class provides the core compilation logic for Mantra:
 * - Parses styled() configurations
 * - Generates CSS and class names
 * - Handles variant resolution
 * - Emits extracted CSS files
 * - Supports plugin system
 */
export class MantraCompiler {
  private options: Required<CompilerOptions>;
  private emittedCSS: Map<string, string>;
  private styleCache: Map<string, CSSGenerationResult>;

  constructor(options: CompilerOptions = {}) {
    this.options = {
      root: options.root ?? process.cwd(),
      outDir: options.outDir ?? '.mantra',
      minify: options.minify ?? false,
      prefix: options.prefix ?? 'mantra',
      debug: options.debug ?? false,
      hashLength: options.hashLength ?? 8,
    };

    this.emittedCSS = new Map();
    this.styleCache = new Map();
  }

  /**
   * Generate CSS from a styled configuration
   */
  generateCSS<TUtils extends AnyUtils>(
    config: StyledConfig<TUtils>,
    tag: string,
    prefix?: string
  ): CSSGenerationResult {
    const cacheKey = JSON.stringify({ config, tag, prefix });
    
    // Check cache first
    if (this.styleCache.has(cacheKey)) {
      return this.styleCache.get(cacheKey)!;
    }

    const effectivePrefix = prefix ?? this.options.prefix;
    
    // Generate base class name
    const baseStyle = config.baseStyle ?? config.base ?? {};
    const baseHash = hash(JSON.stringify(baseStyle));
    const baseClassName = `${effectivePrefix}-${baseHash}`;

    let cssText = '';
    const variantClassMappings: Record<string, Record<string, string>> = {};

    // Generate base CSS
    if (Object.keys(baseStyle).length > 0) {
      cssText += this.generateCSSRule(`.${baseClassName}`, baseStyle);
    }

    // Generate variant CSS
    if (config.variants) {
      for (const [variantName, variantValues] of Object.entries(config.variants)) {
        variantClassMappings[variantName] = {};
        
        for (const [variantValue, variantStyle] of Object.entries(variantValues)) {
          const variantHash = hash(JSON.stringify(variantStyle));
          const variantClassName = `${baseClassName}-${String(variantName)}-${String(variantValue)}`;
          variantClassMappings[variantName][variantValue] = variantClassName;
          
          cssText += this.generateCSSRule(`.${variantClassName}`, variantStyle);
        }
      }
    }

    // Generate compound variant CSS
    if (config.compoundVariants) {
      for (const compound of config.compoundVariants) {
        if (compound.css) {
          const compoundHash = hash(JSON.stringify(compound));
          const compoundClassName = `${baseClassName}-compound-${compoundHash}`;
          cssText += this.generateCSSRule(`.${compoundClassName}`, compound.css);
          
          // Store compound class mapping
          if (!variantClassMappings['_compound']) {
            variantClassMappings['_compound'] = {};
          }
          variantClassMappings['_compound'][compoundHash] = compoundClassName;
        }
      }
    }

    const result: CSSGenerationResult = {
      baseClassName,
      cssText,
      variantClassMappings: Object.keys(variantClassMappings).length > 0 ? variantClassMappings : undefined,
      defaultVariants: config.defaultVariants,
    };

    // Cache result
    this.styleCache.set(cacheKey, result);

    return result;
  }

  /**
   * Generate a CSS rule from selector and styles
   */
  private generateCSSRule(selector: string, styles: Record<string, any>): string {
    let css = `${selector}{`;
    
    for (const [key, value] of Object.entries(styles)) {
      if (value === undefined || value === null) continue;
      
      const property = camelToKebab(key);
      const serializedValue = typeof value === 'number' ? `${value}px` : String(value);
      
      css += `${property}:${serializedValue};`;
    }
    
    css += '}';
    
    return css;
  }

  /**
   * Emit CSS to output directory
   */
  emitCSS(filePath: string, cssText: string): void {
    this.emittedCSS.set(filePath, cssText);
    
    if (this.options.debug) {
      console.log(`[Mantra Compiler] Emitted CSS for ${filePath}`);
    }
  }

  /**
   * Get all emitted CSS
   */
  getAllCSS(): string {
    return Array.from(this.emittedCSS.values()).join('\n');
  }

  /**
   * Clear the style cache
   */
  clearCache(): void {
    this.styleCache.clear();
  }

  /**
   * Get compiler options
   */
  getOptions(): Required<CompilerOptions> {
    return { ...this.options };
  }
}
