interface Array<T> {
  filter(fn: BooleanConstructor): Exclude<T, null | undefined | 0 | false>[];
}
declare module "@babel/helper-module-imports";
