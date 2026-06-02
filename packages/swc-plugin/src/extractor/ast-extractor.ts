/**
 * ============================================================================
 * MANTRA SWC PLUGIN - AST Style Extractor
 * ============================================================================
 * 
 * Low-level AST extraction utilities for parsing and extracting styles
 * from TypeScript/JavaScript source code using SWC.
 */

import type { Module, Expression, ObjectExpression } from '@swc/core';

/**
 * Extract style objects from a module's AST
 * 
 * This function traverses the AST and finds all styled() calls,
 * extracting their configuration objects for build-time processing.
 * 
 * @param module - SWC Module AST node
 * @returns Array of extracted style configurations
 */
export function extractStylesFromAST(module: Module): ExtractedStyle[] {
  const extracted: ExtractedStyle[] = [];
  
  // Find Mantra import name
  let styledImportName: string | null = null;
  
  if (module.body) {
    for (const item of module.body) {
      if (item.type === 'ImportDeclaration') {
        const source = item.source.value;
        if (
          source === '@mantra/core' ||
          source === '@mantra/react' ||
          source === '@mantra-css/core' ||
          source === '@mantra-css/react'
        ) {
          for (const specifier of item.specifiers || []) {
            if (
              specifier.type === 'ImportSpecifier' &&
              specifier.imported?.type === 'Identifier' &&
              specifier.imported.name === 'styled'
            ) {
              styledImportName = specifier.local?.name ?? null;
            }
          }
        }
      }
    }
  }
  
  if (!styledImportName) {
    return extracted;
  }
  
  // Traverse and extract styled() calls
  traverseModule(module, (node) => {
    if (node.type === 'CallExpression') {
      const result = tryExtractStyledCall(node, styledImportName!);
      if (result) {
        extracted.push(result);
      }
    }
  });
  
  return extracted;
}

/**
 * Try to extract a styled() call expression
 */
function tryExtractStyledCall(
  node: any,
  styledImportName: string
): ExtractedStyle | null {
  const callee = node.callee;
  
  // Pattern: styled('tag', { config })
  if (
    callee?.type === 'Identifier' &&
    callee.name === styledImportName &&
    node.arguments?.length >= 2
  ) {
    const firstArg = node.arguments[0];
    const secondArg = node.arguments[1];
    
    if (
      firstArg?.type === 'StringLiteral' &&
      secondArg?.type === 'ObjectExpression'
    ) {
      const htmlTag = firstArg.value;
      const config = evaluateObjectExpression(secondArg);
      
      return {
        tag: htmlTag,
        config,
        span: node.span,
      };
    }
  }
  
  // Pattern: styled('tag')({ config }) - curried form
  if (
    callee?.type === 'CallExpression' &&
    callee.callee?.type === 'Identifier' &&
    callee.callee.name === styledImportName &&
    callee.arguments?.length === 1 &&
    callee.arguments[0]?.type === 'StringLiteral'
  ) {
    const htmlTag = callee.arguments[0].value;
    
    // Check if parent is a call with config object
    // This would require checking the parent node context
    // For now, we handle the direct form above
  }
  
  return null;
}

/**
 * Evaluate an ObjectExpression to a plain JavaScript object
 */
function evaluateObjectExpression(node: ObjectExpression): Record<string, any> {
  const obj: Record<string, any> = {};
  
  for (const prop of node.properties || []) {
    if (prop.type === 'KeyValueProperty' || prop.type === 'Property') {
      let key: string;
      
      if (prop.key.type === 'Identifier') {
        key = prop.key.value;
      } else if (prop.key.type === 'StringLiteral') {
        key = prop.key.value;
      } else if (prop.key.type === 'NumericLiteral') {
        key = String(prop.key.value);
      } else {
        throw new Error(
          `Mantra AST: Dynamic property keys not supported. Found: ${prop.key.type}`
        );
      }
      
      obj[key] = evaluateValue(prop.value);
    } else if (prop.type === 'SpreadElement') {
      throw new Error(
        'Mantra AST: Spread properties not supported in style objects.'
      );
    }
  }
  
  return obj;
}

/**
 * Evaluate any value expression recursively
 */
function evaluateValue(expr: any): any {
  switch (expr.type) {
    case 'StringLiteral':
      return expr.value;
    case 'NumericLiteral':
      return expr.value;
    case 'BooleanLiteral':
      return expr.value;
    case 'NullLiteral':
      return null;
    case 'Undefined':
      return undefined;
    case 'ObjectExpression':
      return evaluateObjectExpression(expr);
    case 'ArrayExpression': {
      const arr: any[] = [];
      for (const elem of expr.elements || []) {
        if (elem && elem.type !== 'SpreadElement') {
          arr.push(evaluateValue(elem));
        }
      }
      return arr;
    }
    default:
      throw new Error(
        `Mantra AST: Cannot evaluate dynamic expression of type ${expr.type}`
      );
  }
}

/**
 * Simple AST traversal helper
 */
function traverseModule(
  node: any,
  visitor: (node: any) => void
) {
  visitor(node);
  
  if (node && typeof node === 'object') {
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object' && item.type) {
            traverseModule(item, visitor);
          }
        }
      } else if (value && typeof value === 'object' && value.type) {
        traverseModule(value, visitor);
      }
    }
  }
}

/**
 * Extracted style information
 */
export interface ExtractedStyle {
  /** HTML element tag */
  tag: string;
  /** Configuration object with baseStyle, variants, etc. */
  config: Record<string, any>;
  /** Source span location */
  span?: {
    start: number;
    end: number;
    filePath?: string;
  };
}
