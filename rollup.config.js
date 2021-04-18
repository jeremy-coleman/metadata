const ts = require("rollup-plugin-ts");
const json = require("@rollup/plugin-json");
const node = require("@rollup/plugin-node-resolve").default;

/**
 * @param {string} input
 * @param {string} output
 * @param {import("rollup").ModuleFormat} format
 * @returns {import("rollup").RollupOptions}
 */
const build = (input, output, format) => ({
  input,
  external: module =>
    !module.startsWith("../") &&
    !module.startsWith("./") &&
    !module.startsWith("/"),
  output: {
    file: output,
    format,
    exports: "auto",
    banner: "/* eslint-disable */",
  },
  plugins: [ts(), json(), node({ extensions: [".js", ".ts", ".json"] })],
});

export default [
  build("./src/plugin.ts", "./lib/plugin.js", "cjs"),
  build("./src/runtime.ts", "./lib/runtime.js", "cjs"),
  build("./src/runtime.ts", "./lib/runtime.mjs", "esm"),
];
