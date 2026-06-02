import type { Program, Module } from '@swc/core';
import { visit } from 'swc-visitor';
import { createStyledVisitor } from '../visitors/styled-visitor';
import { MantraCompiler } from '@mantra/compiler';

/**
 * Options for the Mantra SWC transform
 */
export interface MantraSWCOptions {
  /**
   * Root directory for path resolution
   */
  root?: string;
  
  /**
   * Output directory for extracted CSS
   */
  outDir?: string;
  
  /**
   * Enable minification of extracted CSS
   */
  minify?: boolean;
  
  /**
   * Enable source map generation
   */
  sourcemap?: boolean | 'inline' | 'external';
  
  /**
   * Class name prefix
   */
  prefix?: string;
  
  /**
   * Enable debug mode
   */
  debug?: boolean;
  
  /**
   * Custom compiler instance (optional)
   */
  compiler?: MantraCompiler;
}

/**
 * Metadata attached to transformed nodes
 */
export interface TransformMetadata {
  /**
   * Extracted class names
   */
  classNames: string[];
  
  /**
   * Extracted CSS text
   */
  cssText: string;
  
  /**
   * Source file path
   */
  filePath: string;
  
  /**
   * Component name if detected
   */
  componentName?: string;
  
  /**
   * Variant information
   */
  variants?: Record<string, Record<string, string>>;
}

/**
 * Main transform function for SWC
 * 
 * This function creates a transform pipeline that:
 * 1. Parses the source code into AST
 * 2. Visits styled() calls
 * 3. Extracts styles at build-time
 * 4. Generates optimized component code
 * 5. Collects CSS for extraction
 */
export function mantraTransform(options: MantraSWCOptions = {}) {
  const {
    root = process.cwd(),
    outDir = '.mantra',
    minify = false,
    sourcemap = false,
    prefix = 'mantra',
    debug = false,
  } = options;

  // Create or use provided compiler instance
  const compiler = options.compiler ?? new MantraCompiler({
    root,
    outDir,
    minify,
    prefix,
  });

  /**
   * Transform function compatible with SWC plugin system
   */
  return function transform(module: Module): Module {
    const filePath = module.span?.filePath ?? 'unknown';
    
    if (debug) {
      console.log(`[Mantra SWC] Transforming: ${filePath}`);
    }

    // Track extracted styles for this module
    const metadata: TransformMetadata = {
      classNames: [],
      cssText: '',
      filePath,
    };

    // Create styled visitor with compiler and metadata
    const styledVisitor = createStyledVisitor({
      compiler,
      metadata,
      options: { prefix, debug },
    });

    // Visit the AST and transform styled() calls
    const visitedModule = visit(module, styledVisitor);

    // Attach metadata for downstream extraction
    if (metadata.cssText && metadata.classNames.length > 0) {
      // Emit CSS file
      compiler.emitCSS(filePath, metadata.cssText);
      
      if (debug) {
        console.log(`[Mantra SWC] Extracted ${metadata.classNames.length} classes from ${filePath}`);
      }
    }

    return visitedModule;
  };
}
