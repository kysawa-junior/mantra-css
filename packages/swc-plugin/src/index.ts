/**
 * ============================================================================
 * MANTRA SWC PLUGIN - Universal CSS Extraction Transform
 * ============================================================================
 * 
 * This plugin provides build-time CSS extraction using SWC's AST transformation
 * system. It is designed to be bundler-agnostic and works with any bundler that
 * supports SWC plugins (Rspack, RSBuild, Next.js SWC, etc.).
 * 
 * Features:
 * - Zero-runtime CSS extraction
 * - Styled component transformation
 * - Variant analysis and class generation
 * - Static CSS output
 * - Source map support
 * - Tree-shaking friendly
 * 
 * @package @mantra/swc-plugin
 */

export { mantraTransform } from './transforms/mantra-transform';
export { createStyledVisitor } from './visitors/styled-visitor';
export { extractStylesFromAST } from './extractor/ast-extractor';
export type { MantraSWCOptions, TransformMetadata } from './types';
