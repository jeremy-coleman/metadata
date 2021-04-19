import type { NodePath } from "@babel/traverse";
import { types as t } from "@babel/core";
import type { Type } from "./serializeType";
import { SerializeType } from "./serializeType";
import { arrowOf, id } from "../util";
import type { TransformContext } from "../plugin";

function assertNever(type: never) {}

function getTypeAnnotation(parent: {
  typeAnnotation: t.TypeAnnotation | t.TSTypeAnnotation | t.Noop | null;
}): t.TSType | undefined {
  return (
    (parent.typeAnnotation as t.TSTypeAnnotation | null)?.typeAnnotation ??
    undefined
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
        throw new Error(
          `The property expression at ${node.start} is not valid as a Type to be used in Reflect.metadata`
        );
    }
  };
}

export class MetadataVisitor {
  constructor(
    private classPath: NodePath<t.ClassDeclaration>,
    private context: TransformContext,
    private serializer = new SerializeType({
      isSafeReference: createIsSafeReference(classPath),
    })
  ) {}

  private fromAdvancedType(type: Type, optional?: boolean): t.CallExpression {
    return t.callExpression(
      this.context.$createType,
      [
        type.primary,
        type.parameters &&
          t.arrayExpression(type.parameters.map(t => this.fromAdvancedType(t))),
        optional &&
          t.objectExpression([
            t.objectProperty(id("optional"), t.booleanLiteral(true)),
          ]),
      ].filter(Boolean)
    );
  }

  private *visitClassMethod(node: t.ClassMethod) {
    const { createMetadataDecorator: create, $keys } = this.context;

    yield create($keys.Type, id("Function"));
    yield create(
      $keys.ParamType,
      arrowOf(
        t.arrayExpression(
          node.params.map(param =>
            this.fromAdvancedType(
              this.serializer.serializeType(findTypeNode(param)),
              ("optional" in param && param.optional) || false
            )
          )
        )
      )
    );

    if (node.returnType) {
      yield create(
        $keys.ReturnType,
        arrowOf(
          this.fromAdvancedType(
            this.serializer.serializeType(
              (node.returnType as t.TSTypeAnnotation).typeAnnotation
            )
          )
        )
      );
    }
  }

  private *visitClassProperty(field: t.ClassProperty) {
    const { createMetadataDecorator: create, $keys } = this.context;

    if (field.typeAnnotation?.type !== "TSTypeAnnotation") {
      return;
    }

    yield create(
      $keys.Type,
      arrowOf(
        this.fromAdvancedType(
          this.serializer.serializeType(findTypeNode(field))
        )
      )
    );
  }

  visit(path: NodePath<t.ClassProperty | t.ClassMethod>) {
    const field = path.node;
    const classNode = this.classPath.node;

    switch (field.type) {
      case "ClassMethod":
        const decorators =
          field.kind === "constructor"
            ? (classNode.decorators ??= [])
            : (field.decorators ??= []);

        decorators.push(...this.visitClassMethod(field));
        break;

      case "ClassProperty":
        field.decorators ??= [];
        field.decorators!.push(...this.visitClassProperty(field));
        break;
    }
  }
}
