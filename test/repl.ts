#!/usr/bin/env ts-node-transpile-only
import { transformSync } from "@babel/core";
import { highlight } from "cli-highlight";
import plugin from "../src/babel";

const { code } = transformSync(
  /* javascript */ `
  @Decorate
  class MyClass {
    constructor(parameter: Generic<A>) {}
  }
`,
  {
    babelrc: false,
    presets: [["@babel/preset-typescript", { allExtensions: true }]],
    plugins: [plugin, ["@babel/plugin-syntax-decorators", { legacy: true }]],
  }
);

console.log(highlight(code, { language: "javascript" }));
