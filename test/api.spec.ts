import { mergeDecorators, getClassPropertyType } from "../src/index";
import { javascript } from "./shared";

describe("API specification", () => {
  it("merges decorators correctly", () => {
    const classRecord: number[] = [];

    const add = <T>(array: T[], value: T) => () => {
      array.push(value);
    };

    @mergeDecorators<ClassDecorator>(
      add(classRecord, 1),
      add(classRecord, 2),
      false,
      add(classRecord, 3)
    )
    class Class {}

    Object(Class);

    expect(classRecord).toEqual([3, 2, 1]);
  });

  it("accepts either an instance or class constructor", () => {
    const { Class } = javascript`
      export class Class {
        field!: string;
      }
      export const instance = new Class();
    `;
    expect(getClassPropertyType(Class.prototype, "field").type).toBe(String);
    expect(getClassPropertyType(Class, "field").type).toBe(String);
  });
});
