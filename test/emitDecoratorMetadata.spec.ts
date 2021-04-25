import "reflect-metadata";
import * as babel from "@babel/core";

const _module = { exports: {} };

function javascript(code: TemplateStringsArray) {
  const source = babel.transform(code.join(""), {
    presets: [["@babel/preset-typescript", { allExtensions: true }]],
    plugins: [
      [require.resolve("../src/babel"), { importPath: "../src/index" }],
      "@babel/plugin-transform-runtime",
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-transform-modules-commonjs",
    ],
  }).code!;

  eval(/* javascript */ `(function (module, exports) { 
    ${source} 
  })(_module, _module.exports)`);
  return _module.exports as any;
}

describe("emitDecoratorMetadata layer", () => {
  it("extracts correct types", () => {
    const { A } = javascript`

    import { toReflectMetadata } from "../src/index"
    const dec: any = () => {}

    @toReflectMetadata
    export class A {
      @dec
      string!: string;
      @dec
      number!: number;
      @dec
      array!: boolean[];
      @dec
      indecipherable!: { a: string }
      @dec
      method(param1: string, param2: number): string {
        return ""
      }
    }
  `;

    const getMetadata = (
      type: "design:type" | "design:paramtypes" | "design:returntype",
      name: string
    ) => Reflect.getMetadata(type, A.prototype, name);

    expect(getMetadata("design:type", "string")).toBe(String);
    expect(getMetadata("design:type", "number")).toBe(Number);
    expect(getMetadata("design:type", "array")).toBe(Array);
    expect(getMetadata("design:type", "indecipherable")).toBe(Object);
    expect(getMetadata("design:type", "method")).toBe(Function);
    expect(getMetadata("design:paramtypes", "method")).toEqual([
      String,
      Number,
    ]);
    expect(getMetadata("design:returntype", "method")).toBe(String);
  });
});
