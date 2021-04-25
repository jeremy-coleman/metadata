import type { t, types } from "./babel";

export function addDecorator(
  t: types,
  node: { decorators?: t.Decorator[] | null },
  ...decorator: (t.Expression | t.Expression[])[]
) {
  node.decorators ??= [];
  node.decorators.push(...decorator.flat(2).map(dec => t.decorator(dec)));
}
