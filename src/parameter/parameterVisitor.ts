import { NodePath } from '@babel/traverse';
import { types as t } from '@babel/core';

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
 * Inject() becomes function(target, key) { return Inject()(target, key, 0) }
 *
 * @param paramIndex the index of the parameter inside the function call
 * @param decoratorExpression the decorator expression, the return object of SomeParameterDecorator()
 * @param isConstructor indicates if the key should be set to 'undefined'
 */
function createParamDecorator(
  paramIndex: number,
  decoratorExpression: t.Expression,
  isConstructor: boolean = false,
  statementParent: NodePath<t.Statement>
) {
  const id = statementParent.scope.generateUidIdentifier('dec');
  (statementParent.container as any[]).push(
    t.functionDeclaration(
      id,
      [t.identifier('target'), t.identifier('key')],
      t.blockStatement([
        t.returnStatement(
          t.callExpression(decoratorExpression, [
            t.identifier('target'),
            t.identifier(isConstructor ? 'undefined' : 'key'),
            t.numericLiteral(paramIndex),
          ])
        ),
      ])
    )
  );

  return t.decorator(id);
}

export function parameterVisitor(
  classPath: NodePath<t.ClassDeclaration>,
  path: NodePath<t.ClassMethod> | NodePath<t.ClassProperty>
) {
  if (path.type !== 'ClassMethod') return;
  if (path.node.type !== 'ClassMethod') return;
  if (path.node.key.type !== 'Identifier') return;

  const statementParent = classPath.getStatementParent()!;

  const methodPath = path as NodePath<t.ClassMethod>;
  const params = methodPath.get('params') || [];

  params.slice().forEach(param => {
    let identifier =
      param.node.type === 'Identifier' || param.node.type === 'ObjectPattern'
        ? param.node
        : param.node.type === 'TSParameterProperty' &&
          param.node.parameter.type === 'Identifier'
        ? param.node.parameter
        : null;

    if (identifier == null) return;

    let resultantDecorator: t.Decorator | undefined;

    ((param.node as t.Identifier).decorators || [])
      .slice()
      .forEach(decorator => {
        if (methodPath.node.kind === 'constructor') {
          resultantDecorator = createParamDecorator(
            param.key as number,
            decorator.expression,
            true,
            statementParent
          );
          if (!classPath.node.decorators) {
            classPath.node.decorators = [];
          }
          classPath.node.decorators.push(resultantDecorator);
        } else {
          resultantDecorator = createParamDecorator(
            param.key as number,
            decorator.expression,
            false,
            statementParent
          );
          if (!methodPath.node.decorators) {
            methodPath.node.decorators = [];
          }
          methodPath.node.decorators.push(resultantDecorator);
        }
      });

    if (resultantDecorator) {
      (param.node as t.Identifier).decorators = null;
    }
  });
}
