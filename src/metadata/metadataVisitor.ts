import type { NodePath } from "@babel/traverse";
import type { TransformContext, t } from "../babel";

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

export class MetadataVisitor {
  constructor(
    private classPath: NodePath<t.ClassDeclaration>,
    private context: TransformContext
  ) {}

  private *visitClassMethod(node: t.ClassMethod) {
    const { keys, t, ids, decorate, serializer } = this.context;

    yield decorate(keys.Type, ids.Function);

    const paramTypes = node.params.map(param =>
      serializer.fromType(
        serializer.serializeType(findTypeNode(param)),
        ("optional" in param && param.optional) || false
      )
    );

    yield decorate(keys.ParamType, t.arrayExpression(paramTypes));

    if (node.returnType) {
      const returnType = serializer.fromType(
        serializer.serializeType(
          (node.returnType as t.TSTypeAnnotation).typeAnnotation
        )
      );

      yield decorate(keys.ReturnType, returnType);
    }
  }

  private *visitClassProperty(field: t.ClassProperty) {
    const { keys, decorate, t, serializer } = this.context;

    let typeNode: t.TSType | undefined;
    if (field.typeAnnotation) {
      typeNode = findTypeNode(field);
    } else {
      // No explicit type annotation but there is a value assignment,
      // we try to deduct the type from the value.
      switch (field.value?.type) {
        case "StringLiteral":
          typeNode = t.tsStringKeyword();
          break;
        case "NumericLiteral":
          typeNode = t.tsNumberKeyword();
          break;
        case "BooleanLiteral":
          typeNode = t.tsBooleanKeyword();
          break;
        case "BigIntLiteral":
          typeNode = t.tsTypeReference(t.identifier("BigInt"));
          break;
        case "ArrayExpression":
          typeNode = t.tsTypeReference(t.identifier("Array"));
          break;
        default:
          return;
      }
    }

    yield decorate(
      keys.Type,
      serializer.fromType(
        serializer.serializeType(typeNode),
        ("optional" in field && field.optional) || false,
        t.isLiteral(field.value) && field.value
      )
    );
  }

  visit(path: NodePath<t.ClassProperty | t.ClassMethod>) {
    const { context } = this;
    const { decoratedOnly, addDecorator } = context;
    const field = path.node;
    const classNode = this.classPath.node;

    if (field.static && !context.static) {
      return;
    }

    switch (field.type) {
      case "ClassMethod":
        const target = field.kind === "constructor" ? classNode : field;
        if (!decoratedOnly || target.decorators?.length) {
          addDecorator(target, ...this.visitClassMethod(field));
        }
        break;

      case "ClassProperty":
        if (!decoratedOnly || field.decorators?.length) {
          addDecorator(field, ...this.visitClassProperty(field));
        }
        break;
    }
  }
}
