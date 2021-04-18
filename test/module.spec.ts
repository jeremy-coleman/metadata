import path from "path";
import { createTests } from "./shared";

const { fixtures } = createTests({
  presets: [["@babel/preset-typescript", { allExtensions: true }]],
  plugins: [
    require.resolve("../src/plugin"),
    "@babel/plugin-transform-runtime",
    ["@babel/plugin-syntax-decorators", { legacy: true }],
    "@babel/plugin-syntax-class-properties",
    "@babel/plugin-transform-modules-commonjs",
  ],
});

fixtures("emit metadata", path.join(__dirname, "__modules__"));
