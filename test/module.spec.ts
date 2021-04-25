import path from "path";
import { createTests } from "./shared";

const { createRunner } = createTests({
  presets: [["@babel/preset-typescript", { allExtensions: true }]],
  plugins: [
    require.resolve("../src/babel"),
    "@babel/plugin-transform-runtime",
    "@babel/plugin-transform-modules-commonjs",
  ],
});

describe("emit metadata", createRunner(path.join(__dirname, "__modules__")));
