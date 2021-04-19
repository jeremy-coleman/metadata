import { types as t } from "@babel/core";

export const arrowOf = (expression: t.Expression) =>
  t.arrowFunctionExpression([], expression);

export const id = t.identifier;

export function addDecorator(
  node: { decorators?: t.Decorator[] | null },
  decorator: t.Decorator | t.Decorator[]
) {
  node.decorators ??= [];
  if (Array.isArray(decorator)) {
    node.decorators.push(...decorator);
  } else {
    node.decorators.push(decorator);
  }
}
