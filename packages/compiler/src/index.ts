/**
 * ============================================================================
 * MANTRA COMPILER - Universal Build-Time CSS Compiler
 * ============================================================================
 * 
 * Bundler-agnostic compiler for Mantra zero-runtime CSS-in-JS.
 * This package provides the core compilation logic used by all adapters.
 * 
 * Features:
 * - AST-based style extraction
 * - CSS generation and optimization
 * - Class name hashing
 * - Variant resolution
 * - Source map generation
 * - Plugin system
 * 
 * @package @mantra/compiler
 */

export { MantraCompiler } from './core/compiler';
export { StyleExtractor } from './extractor/style-extractor';
export type {
  CompilerOptions,
  CompileResult,
  ExtractedStyle,
  CompilerPlugin,
  PluginContext,
} from './types';
