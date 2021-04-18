import type * as babel from "@babel/core";
import type { NodePath, types as t } from "@babel/core";
import { addNamed } from "@babel/helper-module-imports";
import { parameterVisitor } from "./parameter/parameterVisitor";
import { MetadataVisitor } from "./metadata/metadataVisitor";
import { id } from "./util";
import type { DesignType } from "./runtime";
import { name } from "../package.json";

export type BabelAPI = typeof babel & babel.ConfigAPI;

import type * as runtime from "./runtime";
type RuntimeExport = keyof typeof runtime;

type DesignTypeKey = keyof typeof DesignType;
type DesignTypeKeys = {
  [key in DesignTypeKey]: t.MemberExpression;
};

export interface TransformContext {
  createMetadataDecorator(type: t.Expression, arg: t.Expression): t.Decorator;
  $createType: t.Identifier;
  $keys: DesignTypeKeys;
}

const getNamedImport = (
  path: NodePath<t.Program>,
  identifier: RuntimeExport,
  suggestedName: string = identifier
) => addNamed(path, identifier, `${name}/runtime`, { nameHint: suggestedName });

export default ({ types: t }: BabelAPI): babel.PluginObj => ({
  visitor: {
    Program(programPath) {
      const $createType = getNamedImport(programPath, "createType", "type");
      const $designType = getNamedImport(programPath, "DesignType");
      const createMetadataDecorator = (
        key: t.Expression,
        arg: t.Expression
      ): t.Decorator =>
        t.decorator(
          t.callExpression(t.memberExpression(id("Reflect"), id("metadata")), [
            key,
            arg,
          ])
        );

      const $keys: DesignTypeKeys = {
        Type: t.memberExpression($designType, id("Type")),
        ParamType: t.memberExpression($designType, id("ParamType")),
        ReturnType: t.memberExpression($designType, id("ReturnType")),
        TypeInfo: t.memberExpression($designType, id("TypeInfo")),
        PropertyList: t.memberExpression($designType, id("PropertyList")),
        MethodList: t.memberExpression($designType, id("MethodList")),
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
            $createType,
            $keys,
            createMetadataDecorator,
          };
          const fields = {
            ClassMethod: new Set<string>(),
            ClassProperty: new Set<string>(),
          };

          const metadataVisitor = new MetadataVisitor(path, context);

          for (const field of path.get("body").get("body")) {
            if (
              field.type !== "ClassMethod" &&
              field.type !== "ClassProperty"
            ) {
              continue;
            }

            parameterVisitor(path, field as any, context);
            metadataVisitor.visit(field as any);

            const node = field.node as t.ClassMethod | t.ClassProperty;
            if (node.key.type !== "Identifier") continue;

            if (node.type === "ClassMethod" && node.kind === "constructor") {
              node.params
                .filter((x): x is t.TSParameterProperty =>
                  t.isTSParameterProperty(x)
                )
                .map(x => x.parameter)
                .map(x =>
                  t.isAssignmentPattern(x)
                    ? (x.left as t.Identifier)
                    : (x as t.Identifier)
                )
                .map(x => x.name)
                .forEach(name => {
                  fields.ClassProperty.add(name);
                });
              continue;
            }

            fields[field.type].add(node.key.name);
          }

          path.node.decorators ??= [];
          path.node.decorators.push(
            createMetadataDecorator(
              $keys.PropertyList,
              t.arrayExpression(
                Array.from(fields.ClassProperty, _ => t.stringLiteral(_))
              )
            ),
            createMetadataDecorator(
              $keys.MethodList,
              t.arrayExpression(
                Array.from(fields.ClassMethod, _ => t.stringLiteral(_))
              )
            )
          );

          /**
           * We need to keep binding in order to let babel know where imports
           * are used as a Value (and not just as a type), so that
           * `babel-transform-typescript` do not strip the import.
           */
          (path.parentPath.scope as any).crawl();
        },
      });
    },
  },
});
