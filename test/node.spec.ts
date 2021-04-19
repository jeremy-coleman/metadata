import path from "path";
import { createTests } from "./shared";

const { createRunner } = createTests({
  presets: [
    ["@babel/preset-env", { useBuiltIns: false, targets: { node: true } }],
    ["@babel/preset-typescript", { allExtensions: true }],
  ],
  plugins: [
    require.resolve("../src/plugin"),
    "@babel/plugin-transform-runtime",
    ["@babel/plugin-syntax-decorators", { legacy: true }],
    "@babel/plugin-syntax-class-properties",
  ],
});

describe(
  "emit metadata with node env",
  createRunner(path.join(__dirname, "__node__"))
);
