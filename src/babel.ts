import type * as babel from "@babel/core";
import type { PluginPass, PluginObj, ConfigAPI } from "@babel/core";
import type { VisitNode } from "@babel/traverse";
import type { NodePath, types as t } from "@babel/core";
import { ParameterVisitor } from "./parameter/parameterVisitor";
import { MetadataVisitor } from "./metadata/metadataVisitor";
import { addDecorator } from "./util";
import type { DesignType } from "./index";
import { name } from "../package.json";

export type BabelAPI = typeof babel & ConfigAPI;

import type * as runtime from "./index";
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

/** @internal */
export interface TransformContext extends PluginOptions {
  t: types;
  ids: ReturnType<typeof sharedIds>;
  $reflectMetadata: t.MemberExpression;
  $createType: t.Identifier;
  keys: DesignTypeKeys;
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

  const getNamedImport = (
    t: types,
    path: NodePath<t.Program>,
    identifier: RuntimeExport,
    suggestedName: string = identifier
  ) => {
    const newID = path.scope.generateUidIdentifier(suggestedName);
    path.node.body.unshift(
      t.importDeclaration(
        [t.importSpecifier(newID, t.identifier(identifier))],
        t.stringLiteral(options.importPath ?? name)
      )
    );
    return () => t.cloneNode(newID);
  };

  const Program: VisitNode<PluginPass, t.Program> = programPath => {
    const $createType = getNamedImport(t, programPath, "createType", "type");
    const $designType = getNamedImport(t, programPath, "DesignType");
    const $reflectMetadata = t.memberExpression(id("Reflect"), id("metadata"));

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
          $reflectMetadata,
          keys,
          t,
          ids,
          ...options,
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
          addDecorator(t, path.node, [
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
