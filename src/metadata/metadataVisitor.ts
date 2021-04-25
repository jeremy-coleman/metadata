import type { NodePath } from "@babel/traverse";
import type { Type } from "./serializeType";
import { SerializeType } from "./serializeType";
import type { TransformContext, t } from "../babel";
import { addDecorator } from "../util";

function assertNever(_type: never) {}

function getTypeAnnotation(parent: {
  typeAnnotation: t.TypeAnnotation | t.TSTypeAnnotation | t.Noop | null;
}): t.TSType | undefined {
  return (
    (parent.typeAnnotation as t.TSTypeAnnotation)?.typeAnnotation ?? undefined
  );
}

function findTypeNode(
  node:
    | t.Identifier
    | t.Pattern
    | t.RestElement
    | t.TSParameterProperty
    | t.ClassProperty
    | t.ClassPrivateProperty
): t.TSType | undefined {
  switch (node.type) {
    case "Identifier":
    case "ObjectPattern":
    case "ArrayPattern":
    case "AssignmentPattern":
    case "RestElement":
    case "ClassProperty":
      return getTypeAnnotation(node);
    case "ClassPrivateProperty":
      return getTypeAnnotation(node as any);
    case "TSParameterProperty":
      return getTypeAnnotation(node.parameter);
    default:
      assertNever(node);
  }
}

function createIsSafeReference(classPath: NodePath<t.ClassDeclaration>) {
  const className = classPath.node.id?.name ?? "";

  /**
   * Checks if node (this should be the result of `serializeReference`) member
   * expression or identifier is a reference to self (class name).
   * In this case, we just emit `Object` in order to avoid ReferenceError.
   */
  return function isClassType(
    node: t.Expression | t.MemberExpression
  ): boolean {
    switch (node.type) {
      case "Identifier":
        return node.name === className;
      case "MemberExpression":
        return isClassType(node.object);
      default:
        return false;
    }
  };
}

export class MetadataVisitor {
  constructor(
    private classPath: NodePath<t.ClassDeclaration>,
    private context: TransformContext,
    private serializer = new SerializeType({
      ...context,
      isSafeReference: createIsSafeReference(classPath),
    })
  ) {}

  private fromType(
    { primary, parameters }: Type,
    optional?: boolean
  ): t.CallExpression {
    const { t, ids } = this.context;
    return t.callExpression(
      this.context.$createType,
      [
        t.arrowFunctionExpression([], primary),
        parameters && t.arrayExpression(parameters.map(t => this.fromType(t))),
        optional &&
          t.objectExpression([
            t.objectProperty(ids.nullable, t.booleanLiteral(true)),
          ]),
      ].filter(Boolean)
    );
  }

  private decorate(type: t.Expression, arg: t.Expression): t.CallExpression {
    const { t, $reflectMetadata } = this.context;
    return t.callExpression($reflectMetadata, [type, arg]);
  }

  private *visitClassMethod(node: t.ClassMethod) {
    const { keys, t, ids } = this.context;

    yield this.decorate(keys.Type, ids.Function);

    const paramTypes = node.params.map(param =>
      this.fromType(
        this.serializer.serializeType(findTypeNode(param)),
        ("optional" in param && param.optional) || false
      )
    );

    yield this.decorate(keys.ParamType, t.arrayExpression(paramTypes));

    if (node.returnType) {
      const returnType = this.fromType(
        this.serializer.serializeType(
          (node.returnType as t.TSTypeAnnotation).typeAnnotation
        )
      );

      yield this.decorate(keys.ReturnType, returnType);
    }
  }

  private *visitClassProperty(field: t.ClassProperty) {
    const { keys } = this.context;

    if (field.typeAnnotation?.type !== "TSTypeAnnotation") {
      return;
    }

    yield this.decorate(
      keys.Type,
      this.fromType(
        this.serializer.serializeType(findTypeNode(field)),
        ("optional" in field && field.optional) || false
      )
    );
  }

  visit(path: NodePath<t.ClassProperty | t.ClassMethod>) {
    const { context } = this;
    const { t, decoratedOnly } = context;
    const field = path.node;
    const classNode = this.classPath.node;

    if (field.static && !context.static) {
      return;
    }

    switch (field.type) {
      case "ClassMethod":
        const target = field.kind === "constructor" ? classNode : field;
        if (!decoratedOnly || target.decorators?.length) {
          addDecorator(t, target, ...this.visitClassMethod(field));
        }
        break;

      case "ClassProperty":
        if (!decoratedOnly || field.decorators?.length) {
          addDecorator(t, field, ...this.visitClassProperty(field));
        }
        break;
    }
  }
}
