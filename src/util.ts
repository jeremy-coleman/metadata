import { types as t } from "@babel/core";

export const arrowOf = (expression: t.Expression) =>
  t.arrowFunctionExpression([], expression);

export const id = t.identifier;
