import type { TransformContext, t } from "../babel";

type InferArray<T> = T extends Array<infer A> ? A : never;

type SerializedType =
  | t.Identifier
  | t.UnaryExpression
  | t.ConditionalExpression
  | t.ObjectExpression
  | t.ArrowFunctionExpression;

export type Parameter = InferArray<t.ClassMethod["params"]> | t.ClassProperty;

export interface Type {
  primary: SerializedType;
  parameters?: Type[];
}

interface SerializationContext extends TransformContext {
  isSafeReference(reference: t.Identifier | t.MemberExpression): boolean;
}

function isSafeReference(reference: t.Identifier | t.MemberExpression) {
  return (
    reference.type === "Identifier" &&
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
  constructor(private readonly context: SerializationContext) {}

  private type = (primary: SerializedType, parameters?: Type[]): Type => {
    if (parameters && !parameters.length) parameters = undefined;
    return { primary, parameters } as any;
  };

  public fromType = (
    { primary, parameters }: Type,
    optional?: boolean,
    value?: any
  ): t.CallExpression => {
    const { t, ids, fixedTypes } = this.context;
    const options = [
      optional && t.objectProperty(ids.nullable, t.booleanLiteral(true)),
      value && t.objectProperty(ids.value, value),
    ].filter(Boolean);

    const mainType = (() => {
      switch (primary) {
        case ids.Array:
          return fixedTypes.array();
        case ids.Boolean:
          return fixedTypes.boolean();
        case ids.Function:
          return fixedTypes.function();
        case ids.Number:
          return fixedTypes.number();
        case ids.Object:
          return fixedTypes.object();
        case ids.String:
          return fixedTypes.string();
        case ids.Symbol:
          return fixedTypes.symbol();
        default:
          return t.arrowFunctionExpression([], primary);
      }
    })();

    return t.callExpression(
      this.context.$createType(),
      [
        mainType,
        parameters && t.arrayExpression(parameters.map(t => this.fromType(t))),
        options.length && t.objectExpression(options),
      ].filter(Boolean)
    );
  };

  private serializeReference(
    node: t.Identifier | t.TSQualifiedName
  ): t.Identifier | t.MemberExpression {
    const { t } = this.context;
    if (node.type === "Identifier") {
      return t.identifier(node.name);
    }
    return t.memberExpression(this.serializeReference(node.left), node.right);
  }

  private serializeTypeReferenceNode(node: t.TSTypeReference): Type {
    const { t, ids } = this.context;

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

    if (this.context.isSafeReference(reference) || isSafeReference(reference)) {
      return this.type(reference as t.Identifier, typeParams);
    }

    /**
     * We don't know if type is just a type (interface, etc.) or a concrete
     * value (class, etc.).
     * `typeof` operator allows us to use the expression even if it is not
     * defined, fallback is just `Object`.
     */
    return this.type(
      t.conditionalExpression(
        t.binaryExpression(
          "===",
          t.unaryExpression("typeof", reference),
          t.stringLiteral("undefined")
        ),
        ids.Object,
        t.cloneDeep(reference)
      ),
      typeParams
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
    const { type } = this;
    const { ids } = this.context;

    if (node === undefined) {
      return type(ids.Object);
    }

    switch (node.type) {
      case "TSVoidKeyword":
      case "TSUndefinedKeyword":
      case "TSNullKeyword":
      case "TSNeverKeyword":
        return type(ids.undefined);

      case "TSParenthesizedType":
        return this.serializeType(node.typeAnnotation);

      case "TSFunctionType":
      case "TSConstructorType":
        return type(ids.Function);

      case "TSArrayType":
        return type(ids.Array, [this.serializeType(node.elementType)]);

      case "TSTupleType":
        return type(ids.Array);

      case "TSTypePredicate":
      case "TSBooleanKeyword":
        return type(ids.Boolean);

      case "TSStringKeyword":
        return type(ids.String);

      case "TSObjectKeyword":
        return type(ids.Object);

      case "TSLiteralType":
        switch (node.literal.type) {
          case "StringLiteral":
            return type(ids.String);

          case "NumericLiteral":
            return type(ids.Number);

          case "BooleanLiteral":
            return type(ids.Boolean);

          default:
            /**
             * @todo Use `path` error building method.
             */
            throw new Error("Bad type for decorator " + node.literal);
        }

      case "TSNumberKeyword":
      case "TSBigIntKeyword" as any: // Still not in ``@babel/core` typings
        return type(ids.Number);

      case "TSSymbolKeyword":
        return type(ids.Symbol);

      case "TSTypeReference":
        return this.serializeTypeReferenceNode(node);

      case "TSIntersectionType":
      case "TSUnionType":
        return type(this.serializeTypeList(node.types));

      case "TSConditionalType":
        return type(this.serializeTypeList([node.trueType, node.falseType]));

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

    return type(ids.Object);
  }

  /**
   * Type lists need some refining. Even here, implementation is slightly
   * adapted from original TSC compiler:
   *
   *  https://github.com/Microsoft/TypeScript/blob/2932421370df720f0ccfea63aaf628e32e881429/src/compiler/transformers/ts.ts
   */
  private serializeTypeList(types: readonly t.TSType[]): SerializedType {
    const { t, ids } = this.context;
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
          return ids.Object;
        }
      } else {
        // Initialize the union type
        serializedUnion = serializedIndividual.primary;
      }
    }

    // If we were able to find common type, use it
    return serializedUnion || ids.undefined; // Fallback is only hit if all union constituents are null/undefined/never
  }
}
