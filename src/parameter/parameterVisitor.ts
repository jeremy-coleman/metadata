import type { NodePath } from "@babel/traverse";
import { addDecorator } from "../util";
import type { TransformContext, t } from "../babel";

/**
 * Creates field/class decorators from parameter decorators.
 *
 * Field/class decorators get three arguments: the class, the name of the method
 * (or `undefined` in the case of the constructor) and the position index of the
 * parameter in the argument list.
 * Some of this information, the index, is only available at transform time, and
 * has to be stored. The other arguments are part of the decorator signature and
 * will be passed to the decorator anyway. But the decorator has to be called
 * with all three arguments at runtime, so this creates a function wrapper, which
 * takes the target and the key, and adds the index to it.
 *
 * `Inject()` becomes `function (target, key) { return Inject()(target, key, 0) }`
 */
export class ParameterVisitor {
  constructor(
    private classPath: NodePath<t.ClassDeclaration>,
    private context: TransformContext
  ) {}

  // eslint-disable-next-line class-methods-use-this
  public visit(path: NodePath<t.ClassMethod> | NodePath<t.ClassProperty>) {
    const { t, ids } = this.context;

    if (path.type !== "ClassMethod") return;
    if (path.node.key.type !== "Identifier") return;

    const { scope, container } = this.classPath.getStatementParent()!;

    const params = path.get("params") || [];

    for (const param of params) {
      const identifier =
        param.node.type === "Identifier" || param.node.type === "ObjectPattern"
          ? param.node
          : param.node.type === "TSParameterProperty" &&
            param.node.parameter.type === "Identifier"
          ? param.node.parameter
          : null;

      if (identifier == null) continue;

      const decorators =
        ("decorators" in param.node && param.node.decorators) || [];
      if (!decorators.length) continue;

      const isConstructor = path.node.kind === "constructor";
      const target = isConstructor ? this.classPath.node : path.node;

      for (const decorator of decorators) {
        const dec = scope.generateUidIdentifier("decorateArgument");

        (container as any[]).push(
          t.functionDeclaration(
            /* id     */ dec,
            /* params */ [ids.target, ids.key],
            /* body   */ t.blockStatement([
              t.returnStatement(
                t.callExpression(decorator.expression, [
                  ids.target,
                  isConstructor ? ids.undefined : ids.key,
                  t.numericLiteral(param.key as number),
                ])
              ),
            ])
          )
        );

        addDecorator(t, target, dec);
      }

      (param.node as t.Identifier).decorators = null;
    }
  }
}
