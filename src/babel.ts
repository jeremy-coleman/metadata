import type * as babel from "@babel/core";
import type { PluginPass, PluginObj, ConfigAPI } from "@babel/core";
import type { VisitNode } from "@babel/traverse";
import type { types as t } from "@babel/core";
import type { DesignType } from "./index";
import { ParameterVisitor } from "./parameter/parameterVisitor";
import { MetadataVisitor } from "./metadata/metadataVisitor";
import { name } from "../package.json";

export type BabelAPI = typeof babel & ConfigAPI;

import type * as runtime from "./runtime";
type RuntimeExport = keyof typeof runtime;

type DesignTypeKey = keyof typeof DesignType;
type DesignTypeKeys = {
  [key in DesignTypeKey]: t.MemberExpression;
};

export interface PluginOptions {
  // functions?: boolean;
  /**
   * Only emit metadata for class methods and class properties already
   * having at least one decorator
   */
  decoratedOnly?: boolean;

  /**
   * Emit types for static methods. Default is true
   */
  static?: boolean;

  /**
   * Path to import runtime functions from. Optional.
   */
  importPath?: string;
}

export type { t };
export type types = typeof t;

/**
 * Global transformation context shared across all transform functions
 * @internal
 */
export interface TransformContext extends PluginOptions {
  t: types;
  ids: ReturnType<typeof sharedIds>;
  createMetadataDecorator: (
    key: t.Expression,
    arg: t.Expression
  ) => t.CallExpression;
  $createType: t.Identifier;
  keys: DesignTypeKeys;
  addDecorator(
    node: { decorators?: t.Decorator[] | null },
    ...decorator: (t.Expression | t.Expression[])[]
  ): void;
}

const sharedIds = (t: types) => ({
  Array: t.identifier("Array"),
  Function: t.identifier("Function"),
  Number: t.identifier("Number"),
  Object: t.identifier("Object"),
  String: t.identifier("String"),
  Boolean: t.identifier("Boolean"),
  Symbol: t.identifier("Symbol"),
  undefined: t.identifier("undefined"),

  key: t.identifier("key"),
  target: t.identifier("target"),
  nullable: t.identifier("nullable"),
});

export default (
  { types: t }: BabelAPI,
  options: PluginOptions = {}
): PluginObj => {
  const { identifier: id } = t;
  const ids = sharedIds(t);
  options = { decoratedOnly: false, static: true, ...options };

  const Program: VisitNode<PluginPass, t.Program> = programPath => {
    /**
     * Inserts a named import to the top of the program.
     * @param identifier Importee
     * @param suggestedName Suggested local identifier name
     * @returns An identifier factory that refers to the local import.
     */
    const getNamedImport = (
      identifier: RuntimeExport,
      suggestedName: string = identifier
    ) => {
      const newID = programPath.scope.generateUidIdentifier(suggestedName);
      programPath.node.body.unshift(
        t.importDeclaration(
          [t.importSpecifier(newID, t.identifier(identifier))],
          t.stringLiteral(options.importPath ?? name)
        )
      );
      return () => t.cloneNode(newID);
    };

    const $createType = getNamedImport("createType", "type");
    const $designType = getNamedImport("DesignType");
    const $reflectMetadata = t.memberExpression(id("Reflect"), id("metadata"));

    /**
     * Returns a `Reflect.metadata` call expression
     */
    const createMetadataDecorator = (key: t.Expression, arg: t.Expression) =>
      t.callExpression($reflectMetadata, [key, arg]);

    const keys: DesignTypeKeys = {
      Type: t.memberExpression($designType(), id("Type")),
      ParamType: t.memberExpression($designType(), id("ParamType")),
      ReturnType: t.memberExpression($designType(), id("ReturnType")),
      TypeInfo: t.memberExpression($designType(), id("TypeInfo")),
      PropertyList: t.memberExpression($designType(), id("PropertyList")),
      MethodList: t.memberExpression($designType(), id("MethodList")),
    };

    /**
     * We need to traverse the program right here since
     * `@babel/preset-typescript` removes imports at this level.
     *
     * Since we need to convert some typings into **bindings**, used in
     * `Reflect.metadata` calls, we need to process them **before**
     * the typescript preset.
     */
    programPath.traverse({
      ClassDeclaration(path) {
        const context: TransformContext = {
          get $createType() {
            return $createType();
          },
          createMetadataDecorator,
          keys,
          t,
          ids,
          ...options,
          addDecorator(node, ...decorator) {
            node.decorators ??= [];
            node.decorators.push(
              ...decorator.flat(2).map(dec => t.decorator(dec))
            );
          },
        };

        const fields = {
          ClassMethod: new Set<string>(),
          ClassProperty: new Set<string>(),
        };

        const metadataVisitor = new MetadataVisitor(path, context);
        const parameterVisitor = new ParameterVisitor(path, context);

        const getClassPropertiesFromConstructor = (node: t.ClassMethod) =>
          node.params
            .filter((ƒ): ƒ is t.TSParameterProperty =>
              t.isTSParameterProperty(ƒ)
            )
            .map(ƒ => ƒ.parameter)
            .map(ƒ => (t.isAssignmentPattern(ƒ) ? (ƒ.left as t.Identifier) : ƒ))
            .map(ƒ => ƒ.name);

        const collectProperties = (node: t.ClassMethod | t.ClassProperty) => {
          if (node.key.type !== "Identifier") return;
          if (node.type === "ClassMethod" && node.kind === "constructor") {
            getClassPropertiesFromConstructor(node).forEach(name => {
              fields[node.type].add(name);
            });
          } else {
            fields[node.type].add(node.key.name);
          }
        };

        for (const field of path.get("body").get("body")) {
          if (field.type !== "ClassMethod" && field.type !== "ClassProperty") {
            continue;
          }

          parameterVisitor.visit(field as any);
          metadataVisitor.visit(field as any);

          collectProperties(field.node as t.ClassMethod | t.ClassProperty);
        }

        if (!context.decoratedOnly || path.node.decorators?.length) {
          context.addDecorator(path.node, [
            createMetadataDecorator(
              keys.PropertyList,
              t.arrayExpression(
                Array.from(fields.ClassProperty, _ => t.stringLiteral(_))
              )
            ),
            createMetadataDecorator(
              keys.MethodList,
              t.arrayExpression(
                Array.from(fields.ClassMethod, _ => t.stringLiteral(_))
              )
            ),
          ]);
        }

        /**
         * We need to keep binding in order to let babel know where imports
         * are used as a Value (and not just as a type), so that
         * `babel-transform-typescript` do not strip the import.
         */
        (path.parentPath.scope as any).crawl();
      },
    });
  };

  return { visitor: { Program } };
};
