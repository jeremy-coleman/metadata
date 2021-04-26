import { mergeDecorators } from "../src/index";

describe("mergeDecorators", () => {
  it("merges decorators correctly", () => {
    const classRecord: number[] = [];

    const add = <T>(array: T[], value: T) => () => array.push(value);

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
});
