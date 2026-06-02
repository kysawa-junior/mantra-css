/**
 * ============================================================================
 * MANTRA SWC PLUGIN - Styled Component Visitor
 * ============================================================================
 * 
 * AST visitor that transforms styled() calls using SWC's visitor pattern.
 * Extracts styles at build-time and generates optimized component code.
 */

import type {
  CallExpression,
  Expression,
  Identifier,
  StringLiteral,
  ObjectExpression,
  Module,
} from '@swc/core';
import { visit } from 'swc-visitor';
import type { MantraCompiler } from '@mantra/compiler';
import type { TransformMetadata } from '../transforms/mantra-transform';

/**
 * Options for the styled visitor
 */
export interface StyledVisitorOptions {
  /** Class name prefix */
  prefix: string;
  /** Debug mode */
  debug: boolean;
}

/**
 * Context passed to the visitor
 */
export interface StyledVisitorContext {
  compiler: MantraCompiler;
  metadata: TransformMetadata;
  options: StyledVisitorOptions;
  styledImportName: string | null;
}

/**
 * Create a styled component visitor for SWC AST transformation
 * 
 * This visitor:
 * 1. Detects styled() import from @mantra/core or @mantra/react
 * 2. Finds all styled() call expressions
 * 3. Extracts style objects statically
 * 4. Generates class names and CSS
 * 5. Transforms the call into an optimized component
 */
export function createStyledVisitor(context: StyledVisitorContext) {
  const { compiler, metadata, options } = context;
  let styledImportName: string | null = null;

  return {
    /**
     * Visit module to detect imports
     */
    visitModule(node: Module): Module {
      // Detect Mantra imports
      if (node.body) {
        for (const item of node.body) {
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

      return node;
    },

    /**
     * Visit call expressions to find styled() calls
     */
    visitCallExpression(node: CallExpression): Expression {
      const callee = node.callee;

      // Check for styled('tag') pattern
      if (
        callee.type === 'CallExpression' &&
        callee.callee.type === 'Identifier' &&
        callee.callee.name === styledImportName &&
        callee.arguments?.length === 1 &&
        callee.arguments[0].type === 'StringLiteral'
      ) {
        const htmlTag = callee.arguments[0].value;
        
        // Check if parent call has config object
        // styled('button')({ baseStyle: {...}, variants: {...} })
        // This is handled by visiting the parent call expression
        
        return node;
      }

      // Check for styled('tag', { config }) pattern (curried form)
      if (
        callee.type === 'Identifier' &&
        callee.name === styledImportName &&
        node.arguments?.length >= 1
      ) {
        const firstArg = node.arguments[0];
        
        // styled('tag', { baseStyle, variants, ... })
        if (
          firstArg.type === 'StringLiteral' &&
          node.arguments.length >= 2 &&
          node.arguments[1].type === 'ObjectExpression'
        ) {
          const htmlTag = firstArg.value;
          const configNode = node.arguments[1] as ObjectExpression;

          try {
            // Evaluate config object statically
            const config = evaluateObjectExpression(configNode);
            
            // Generate CSS and class names
            const result = compiler.generateCSS(config, htmlTag, options.prefix);
            
            // Track extracted styles
            metadata.classNames.push(result.baseClassName);
            metadata.cssText += result.cssText;
            
            if (result.variantClassMappings) {
              metadata.variants = result.variantClassMappings;
            }

            // TODO: Replace with optimized component code
            // For now, we just track the extraction
            
            if (options.debug) {
              console.log(`[Mantra SWC] Extracted styled(${JSON.stringify(htmlTag)}) -> ${result.baseClassName}`);
            }
          } catch (error: any) {
            if (options.debug) {
              console.warn(`[Mantra SWC] Could not extract styles: ${error.message}`);
            }
          }
        }
      }

      return node;
    },
  };
}

/**
 * Statically evaluate an ObjectExpression AST node
 * 
 * This function recursively evaluates object literals containing only
 * static values (strings, numbers, booleans, null, nested objects).
 * 
 * @param node - SWC ObjectExpression node
 * @returns Evaluated JavaScript object
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
          `Mantra SWC: Dynamic property keys are not supported. Found: ${prop.key.type}`
        );
      }

      obj[key] = evaluateValue(prop.value);
    } else if (prop.type === 'SpreadElement') {
      throw new Error(
        'Mantra SWC: Spread properties are not supported in style objects.'
      );
    }
  }

  return obj;
}

/**
 * Evaluate a value expression recursively
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
        `Mantra SWC: Cannot evaluate dynamic expression of type ${expr.type}. Style objects must be statically analyzable.`
      );
  }
}
