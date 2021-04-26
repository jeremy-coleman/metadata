import "reflect-metadata";
import * as babel from "@babel/core";
import type { TransformOptions } from "@babel/core";
import { toMatchFile } from "jest-file-snapshot";
import { create } from "./babel-test";
import { prettier } from "../package.json";

expect.extend({ toMatchFile });

export const createTests = (options: TransformOptions) =>
  create({
    prettier: prettier as any,
    parserOpts: {
      plugins: ["typescript", "classProperties", "decorators-legacy"],
    },
    ...options,
  });

const _module = { exports: {} };

export function javascript(code: TemplateStringsArray) {
  const source = babel.transform(code.join(""), {
    presets: [["@babel/preset-typescript", { allExtensions: true }]],
    plugins: [
      [require.resolve("../src/babel"), { importPath: "../src/runtime" }],
      "@babel/plugin-transform-runtime",
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-transform-modules-commonjs",
    ],
  })!.code!;

  eval(/* javascript */ `(function (module, exports) { 
      ${source} 
    })(_module, _module.exports)`);
  return _module.exports as any;
}
