import { types as t } from "@babel/core";
import type { NodePath } from "@babel/traverse";
import { addDecorator, id } from "../util";
import type { TransformContext } from "../plugin";

/**
 * Helper function to create a field/class decorator from a parameter decorator.
 * Field/class decorators get three arguments: the class, the name of the method
 * (or 'undefined' in the case of the constructor) and the position index of the
 * parameter in the argument list.
 * Some of this information, the index, is only available at transform time, and
 * has to be stored. The other arguments are part of the decorator signature and
 * will be passed to the decorator anyway. But the decorator has to be called
 * with all three arguments at runtime, so this creates a function wrapper, which
 * takes the target and the key, and adds the index to it.
 *
 * Inject() becomes function (target, key) { return Inject()(target, key, 0) }
 *
 * @param paramIndex the index of the parameter inside the function call
 * @param decoratorExpression the decorator expression, the return object of SomeParameterDecorator()
 * @param isConstructor indicates if the key should be set to 'undefined'
 */
function createParamDecorator(
  paramIndex: number,
  decoratorExpression: t.Expression,
  isConstructor = false,
  statementParent: NodePath<t.Statement>
) {
  const dec = statementParent.scope.generateUidIdentifier("decorateArgument");
  (statementParent.container as any[]).push(
    t.functionDeclaration(
      /* id     */ dec,
      /* params */ [id("target"), id("key")],
      /* body   */ t.blockStatement([
        t.returnStatement(
          t.callExpression(decoratorExpression, [
            id("target"),
            id(isConstructor ? "undefined" : "key"),
            t.numericLiteral(paramIndex),
          ])
        ),
      ])
    )
  );

  return t.decorator(dec);
}

export function parameterVisitor(
  classPath: NodePath<t.ClassDeclaration>,
  path: NodePath<t.ClassMethod> | NodePath<t.ClassProperty>,
  context: TransformContext
) {
  if (path.type !== "ClassMethod") return;
  if (path.node.key.type !== "Identifier") return;

  const statementParent = classPath.getStatementParent()!;

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
    const target = isConstructor ? classPath.node : path.node;

    for (const decorator of decorators) {
      addDecorator(
        target,
        createParamDecorator(
          param.key as number,
          decorator.expression,
          isConstructor,
          statementParent
        )
      );
    }

    (param.node as t.Identifier).decorators = null;
  }
}
