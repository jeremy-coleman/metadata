import path from "path";
import { createTests } from "./shared";

const { createRunner } = createTests({
  presets: [["@babel/preset-typescript", { allExtensions: true }]],
  plugins: [
    require.resolve("../src/babel"),
    "@babel/plugin-transform-runtime",
    ["@babel/plugin-syntax-decorators", { legacy: true }],
    "@babel/plugin-syntax-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
  ],
});

describe("emit metadata", createRunner(path.join(__dirname, "__fixtures__")));
