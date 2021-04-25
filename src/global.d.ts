interface Array<T> {
  filter(fn: BooleanConstructor): Exclude<T, null | undefined | 0 | false>[];
}
