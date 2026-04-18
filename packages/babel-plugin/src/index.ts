import type { PluginObj } from '@babel/core';
import { template, types as t } from '@babel/core';
import { evaluateAstNode } from './evaluate';
import { generateMantraCSS } from './generate-css';

const MANTRA_IMPORT = '@mantra/core';

export default function mantraBabelPlugin(): PluginObj {
  return {
    name: '@mantra/babel-plugin',
    visitor: {
      Program(programPath) {
        let styledImportName: string | null = null;

        programPath.traverse({
          ImportDeclaration(path) {
            if (path.node.source.value === MANTRA_IMPORT) {
              for (const specifier of path.node.specifiers) {
                if (specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier' && specifier.imported.name === 'styled') {
                  styledImportName = specifier.local.name;
                }
              }
            }
          }
        });

        if (!styledImportName) return;

        let hasInjectedRuntime = false;

        programPath.traverse({
          CallExpression(path) {
            const callee = path.node.callee;
            
            if (
              callee.type === 'CallExpression' &&
              callee.callee.type === 'Identifier' &&
              callee.callee.name === styledImportName &&
              callee.arguments.length === 1 &&
              callee.arguments[0].type === 'StringLiteral' &&
              path.node.arguments.length === 1 &&
              path.node.arguments[0].type === 'ObjectExpression'
            ) {
              const htmlTag = callee.arguments[0].value;
              const configNode = path.node.arguments[0];

              try {
                const configObj = evaluateAstNode(configNode);
                const { baseClassName, variantClassMappings, cssText } = generateMantraCSS(configObj);

                // Inject runtime style insertion
                const cssInjection = `__MantraZeroRuntimeCSS__.inject("${baseClassName}", "${cssText.replace(/"/g, '\\"')}");`;
                const injectionStatement = template.smart(cssInjection)();
                programPath.unshiftContainer('body', injectionStatement);

                // Inject tiny runtime setup once
                if (!hasInjectedRuntime) {
                  const setup = template.smart(`
                    var __MantraZeroRuntimeCSS__ = window.__MantraZeroRuntimeCSS__ || (window.__MantraZeroRuntimeCSS__ = { styles: {}, inject: (id, css) => { if (!window.__MantraZeroRuntimeCSS__.styles[id]) { var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); window.__MantraZeroRuntimeCSS__.styles[id] = true; } } });
                  `)();
                  programPath.unshiftContainer('body', setup);
                  hasInjectedRuntime = true;
                }

                // React 19 Component Template: ref is just a destructured prop
                const componentStmt = template.smart(`
                  (PROPS) => {
                    const { ref, className, css, ...REST_PROPS } = PROPS;
                    let CLASSNAME = "BASE_CLASS";
                    VARIANTS_LOGIC
                    if (className) CLASSNAME += " " + className;
                    return React.createElement(TAG, { ...REST_PROPS, ref, className: CLASSNAME });
                  }
                `)({
                  PROPS: path.scope.generateUidIdentifier('props'),
                  REST_PROPS: path.scope.generateUidIdentifier('restProps'),
                  CLASSNAME: path.scope.generateUidIdentifier('className'),
                  BASE_CLASS: baseClassName,
                  TAG: htmlTag,
                  VARIANTS_LOGIC: null
                });

                // Fix: Cast to ExpressionStatement to access .expression
                const exprStmt = componentStmt as t.ExpressionStatement;
                const arrowFn = exprStmt.expression as t.ArrowFunctionExpression;
                
                const propsId = (arrowFn.params[0] as t.Identifier).name;
                
                const fnBody = arrowFn.body as t.BlockStatement;
                const destructuringDecl = fnBody.body[0] as t.VariableDeclaration;
                
                const restPattern = (destructuringDecl.declarations[0].id as t.ObjectPattern).properties.find(
                  (p): p is t.RestElement => p.type === 'RestElement'
                )!;
                const restPropsId = (restPattern.argument as t.Identifier).name;
                
                const classNameDecl = fnBody.body[1] as t.VariableDeclaration;
                const classNameId = (classNameDecl.declarations[0].id as t.Identifier).name;
                
                const variantStatements: t.Statement[] = [];
                for (const [vName, vMap] of Object.entries(variantClassMappings)) {
                  for (const [vValue, vClass] of Object.entries(vMap)) {
                    variantStatements.push(
                      t.ifStatement(
                        t.binaryExpression('===', t.memberExpression(t.identifier(propsId), t.identifier(vName)), t.stringLiteral(vValue)),
                        t.blockStatement([
                          // Add variant class
                          t.expressionStatement(
                            t.assignmentExpression('+=', t.identifier(classNameId), t.stringLiteral(' ' + vClass))
                          ),
                          // Delete variant prop from restProps so it doesn't go to the DOM
                          t.expressionStatement(
                            t.unaryExpression('delete', t.memberExpression(t.identifier(restPropsId), t.identifier(vName)))
                          )
                        ])
                      )
                    );
                  }
                }

                // Insert variant logic after the CLASSNAME declaration (index 2)
                fnBody.body.splice(2, 0, ...variantStatements);

                path.replaceWith(exprStmt);

              } catch (err: any) {
                throw path.buildCodeFrameError(err.message);
              }
            }
          }
        });
      }
    }
  };
}