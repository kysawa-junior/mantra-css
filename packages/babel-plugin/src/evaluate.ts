import type * as t from '@babel/types';

export function evaluateAstNode(node: t.Node): any {
  if (node.type === 'StringLiteral') return node.value;
  if (node.type === 'NumericLiteral') return node.value;
  if (node.type === 'BooleanLiteral') return node.value;
  if (node.type === 'NullLiteral') return null;

  if (node.type === 'ObjectExpression') {
    const obj: Record<string, any> = {};
    for (const prop of node.properties) {
      if (prop.type !== 'ObjectProperty') {
        throw new Error("Mantra Zero-Runtime: Spread properties are not allowed in style objects.");
      }
      let key: string;
      if (prop.key.type === 'Identifier') {
        key = prop.key.name;
      } else if (prop.key.type === 'StringLiteral') {
        key = prop.key.value;
      } else {
        throw new Error("Mantra Zero-Runtime: Only static string/identifier keys are allowed.");
      }
      obj[key] = evaluateAstNode(prop.value);
    }
    return obj;
  }

  throw new Error(`Mantra Zero-Runtime: Cannot evaluate dynamic expression of type ${node.type}. Style objects must be statically analyzable.`);
}
