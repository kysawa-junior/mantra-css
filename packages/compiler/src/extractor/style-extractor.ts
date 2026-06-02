/**
 * ============================================================================
 * MANTRA COMPILER - Style Extractor
 * ============================================================================
 * 
 * Extracts styles from source code using AST parsing.
 * Works with any parser backend (SWC, Babel, etc.).
 */

import type { ExtractedStyle } from '../core/compiler';
import type { StyledConfig } from '@mantra/types';
import type { AnyUtils } from '@mantra/types';

/**
 * Options for style extraction
 */
export interface ExtractorOptions {
  /** File path for context */
  filePath: string;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Style Extractor class
 * 
 * Provides utilities for extracting styled component configurations
 * from source code. This is a utility class that works with the
 * compiler to process extracted styles.
 */
export class StyleExtractor {
  private options: ExtractorOptions;
  private extractedStyles: ExtractedStyle[];

  constructor(options: ExtractorOptions) {
    this.options = {
      filePath: options.filePath,
      debug: options.debug ?? false,
    };
    this.extractedStyles = [];
  }

  /**
   * Add an extracted style
   */
  addStyle(style: ExtractedStyle): void {
    this.extractedStyles.push(style);
    
    if (this.options.debug) {
      console.log(`[Mantra Extractor] Added style: ${style.tag} -> ${style.classNames.join(', ')}`);
    }
  }

  /**
   * Get all extracted styles
   */
  getStyles(): ExtractedStyle[] {
    return [...this.extractedStyles];
  }

  /**
   * Get combined CSS text from all extracted styles
   */
  getCSS(): string {
    return this.extractedStyles.map(s => s.cssText).join('\n');
  }

  /**
   * Clear all extracted styles
   */
  clear(): void {
    this.extractedStyles = [];
  }

  /**
   * Get extraction summary
   */
  getSummary(): ExtractionSummary {
    const totalClasses = this.extractedStyles.reduce(
      (sum, style) => sum + style.classNames.length,
      0
    );

    return {
      fileCount: 1,
      styleCount: this.extractedStyles.length,
      classCount: totalClasses,
      cssSize: this.getCSS().length,
    };
  }
}

/**
 * Extraction summary statistics
 */
export interface ExtractionSummary {
  /** Number of files processed */
  fileCount: number;
  /** Number of styled components */
  styleCount: number;
  /** Total number of generated classes */
  classCount: number;
  /** Total CSS size in bytes */
  cssSize: number;
}

/**
 * Parse a styled configuration from runtime data
 * 
 * This function is used when the config is already available
 * as a JavaScript object (e.g., from AST evaluation).
 */
export function parseStyledConfig<TUtils extends AnyUtils>(
  config: Record<string, any>
): StyledConfig<TUtils> {
  const result: StyledConfig<TUtils> = {};

  if (config.baseStyle) {
    result.baseStyle = config.baseStyle;
  } else if (config.base) {
    result.base = config.base;
  }

  if (config.variants) {
    result.variants = config.variants;
  }

  if (config.compoundVariants) {
    result.compoundVariants = config.compoundVariants;
  }

  if (config.defaultVariants) {
    result.defaultVariants = config.defaultVariants;
  }

  if (config.responsiveVariants !== undefined) {
    result.responsiveVariants = config.responsiveVariants;
  }

  return result;
}
