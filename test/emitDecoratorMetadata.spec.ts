import { javascript } from "./shared";

describe("emitDecoratorMetadata layer", () => {
  it("extracts correct types", () => {
    const { A } = javascript`

    import { emitDecoratorMetadata } from "../src/index"
    const dec: any = () => {}

    @emitDecoratorMetadata
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
      nullable?: string;
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
    expect(getMetadata("design:type", "nullable")).toBe(Object);
    expect(getMetadata("design:type", "method")).toBe(Function);
    expect(getMetadata("design:paramtypes", "method")).toEqual([
      String,
      Number,
    ]);
    expect(getMetadata("design:returntype", "method")).toBe(String);
  });
});
