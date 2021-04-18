import { types as t } from "@babel/core";
import type { NodePath } from "@babel/traverse";
import { id } from "../util";

type InferArray<T> = T extends Array<infer A> ? A : never;

type SerializedType =
  | t.Identifier
  | t.UnaryExpression
  | t.ConditionalExpression
  | t.ObjectExpression;

export type Parameter = InferArray<t.ClassMethod["params"]> | t.ClassProperty;

export interface Type {
  primary: SerializedType;
  parameters?: Type[];
}

function Type(primary: SerializedType, parameters?: Type[]): Type {
  if (parameters && !parameters.length) parameters = undefined;
  return { primary, parameters } as any;
}

interface SerializationContext {
  classPath: NodePath<t.ClassDeclaration>;
}

const $undefined = t.identifier("undefined");

function isSafeReference(reference: t.Identifier | t.MemberExpression) {
  return (
    t.isIdentifier(reference) &&
    [
      "Array",
      "Boolean",
      "Function",
      "Number",
      "Object",
      "Promise",
      "String",
      "Symbol",
      "Uint8Array",
    ].includes(reference.name)
  );
}

export class SerializeType {
  private className!: string;

  constructor(private readonly context: SerializationContext) {
    this.className = this.context.classPath.node.id?.name ?? "";
  }

  private serializeTypeReferenceNode(node: t.TSTypeReference): Type {
    /**
     * We need to save references to this type since it is going
     * to be used as a Value (and not just as a Type) here.
     *
     * This is resolved in main plugin method, calling
     * `path.scope.crawl()` which updates the bindings.
     */
    const reference = this.serializeReference(node.typeName);

    const typeParams = node.typeParameters?.params.map(param =>
      this.serializeType(param)
    );

    /**
     * We should omit references to self (class) since it will throw a
     * ReferenceError at runtime due to babel transpile output.
     */
    if (this.isClassType(reference)) {
      return Type(reference as t.Identifier, typeParams);
    }

    if (isSafeReference(reference)) {
      return Type(reference as t.Identifier, typeParams);
    }

    /**
     * We don't know if type is just a type (interface, etc.) or a concrete
     * value (class, etc.).
     * `typeof` operator allows us to use the expression even if it is not
     * defined, fallback is just `Object`.
     */
    return Type(
      t.conditionalExpression(
        t.binaryExpression(
          "===",
          t.unaryExpression("typeof", reference),
          t.stringLiteral("undefined")
        ),
        id("Object"),
        t.cloneDeep(reference)
      ),
      typeParams
    );
  }

  /**
   * Checks if node (this should be the result of `serializeReference`) member
   * expression or identifier is a reference to self (class name).
   * In this case, we just emit `Object` in order to avoid ReferenceError.
   */
  private isClassType(node: t.Expression): boolean {
    switch (node.type) {
      case "Identifier":
        return node.name === this.className;
      case "MemberExpression":
        return this.isClassType(node.object);
      default:
        throw new Error(
          `The property expression at ${node.start} is not valid as a Type to be used in Reflect.metadata`
        );
    }
  }

  private serializeReference(
    typeName: t.Identifier | t.TSQualifiedName
  ): t.Identifier | t.MemberExpression {
    if (typeName.type === "Identifier") {
      return id(typeName.name);
    }
    return t.memberExpression(
      this.serializeReference(typeName.left),
      typeName.right
    );
  }

  /**
   * Actual serialization given the TS Type annotation.
   * Result tries to get the best match given the information available.
   *
   * Implementation is adapted from original TSC compiler source as
   * available here:
   *  https://github.com/Microsoft/TypeScript/blob/2932421370df720f0ccfea63aaf628e32e881429/src/compiler/transformers/ts.ts
   */
  public serializeType(node?: t.TSType): Type {
    if (node === undefined) {
      return Type(id("Object"));
    }

    switch (node.type) {
      case "TSVoidKeyword":
      case "TSUndefinedKeyword":
      case "TSNullKeyword":
      case "TSNeverKeyword":
        return Type($undefined);

      case "TSParenthesizedType":
        return this.serializeType(node.typeAnnotation);

      case "TSFunctionType":
      case "TSConstructorType":
        return Type(id("Function"));

      case "TSArrayType":
      case "TSTupleType":
        return Type(id("Array"));

      case "TSTypePredicate":
      case "TSBooleanKeyword":
        return Type(id("Boolean"));

      case "TSStringKeyword":
        return Type(id("String"));

      case "TSObjectKeyword":
        return Type(id("Object"));

      case "TSLiteralType":
        switch (node.literal.type) {
          case "StringLiteral":
            return Type(id("String"));

          case "NumericLiteral":
            return Type(id("Number"));

          case "BooleanLiteral":
            return Type(id("Boolean"));

          default:
            /**
             * @todo Use `path` error building method.
             */
            throw new Error("Bad type for decorator" + node.literal);
        }

      case "TSNumberKeyword":
      case "TSBigIntKeyword" as any: // Still not in ``@babel/core` typings
        return Type(id("Number"));

      case "TSSymbolKeyword":
        return Type(id("Symbol"));

      case "TSTypeReference":
        return this.serializeTypeReferenceNode(node);

      case "TSIntersectionType":
      case "TSUnionType":
        return Type(this.serializeTypeList(node.types));

      case "TSConditionalType":
        return Type(this.serializeTypeList([node.trueType, node.falseType]));

      case "TSTypeQuery":
      case "TSTypeOperator":
      case "TSIndexedAccessType":
      case "TSMappedType":
      case "TSTypeLiteral":
      case "TSAnyKeyword":
      case "TSUnknownKeyword":
      case "TSThisType":
        // case SyntaxKind.ImportType:
        break;

      default:
        throw new Error("Bad type for decorator");
    }

    return Type(t.identifier("Object"));
  }

  /**
   * Type lists need some refining. Even here, implementation is slightly
   * adapted from original TSC compiler:
   *
   *  https://github.com/Microsoft/TypeScript/blob/2932421370df720f0ccfea63aaf628e32e881429/src/compiler/transformers/ts.ts
   */
  private serializeTypeList(types: ReadonlyArray<t.TSType>): SerializedType {
    let serializedUnion: SerializedType | undefined;

    for (let typeNode of types) {
      while (typeNode.type === "TSParenthesizedType") {
        typeNode = typeNode.typeAnnotation; // Skip parens if need be
      }
      if (typeNode.type === "TSNeverKeyword") {
        continue; // Always elide `never` from the union/intersection if possible
      }
      if (
        typeNode.type === "TSNullKeyword" ||
        typeNode.type === "TSUndefinedKeyword"
      ) {
        continue; // Elide null and undefined from unions for metadata, just like what we did prior to the implementation of strict null checks
      }
      const serializedIndividual = this.serializeType(typeNode);

      if (
        t.isIdentifier(serializedIndividual) &&
        serializedIndividual.name === "Object"
      ) {
        // One of the individual is global object, return immediately
        return serializedIndividual;
      }
      // If there exists union that is not void 0 expression, check if the the common type is identifier.
      // anything more complex and we will just default to Object
      else if (serializedUnion) {
        // Different types
        if (
          !t.isIdentifier(serializedUnion) ||
          !t.isIdentifier(serializedIndividual) ||
          serializedUnion.name !== serializedIndividual.name
        ) {
          return t.identifier("Object");
        }
      } else {
        // Initialize the union type
        serializedUnion = serializedIndividual.primary;
      }
    }

    // If we were able to find common type, use it
    return serializedUnion || $undefined; // Fallback is only hit if all union constituients are null/undefined/never
  }
}
