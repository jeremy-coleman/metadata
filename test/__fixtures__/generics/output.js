@Decorate
@Reflect.metadata('design:type', Function)
@Reflect.metadata('design:paramtypes', [
  typeof Generic === 'undefined' ? Object : Generic,
  typeof Generic === 'undefined' ? Object : Generic,
])
class MyClass {
  constructor(generic, generic2) {
    this.generic = generic;
  }

  @Run
  @_dec
  @Reflect.metadata('design:type', Function)
  @Reflect.metadata('design:paramtypes', [
    typeof Inter === 'undefined' ? Object : Inter,
    typeof InterGen === 'undefined' ? Object : InterGen,
  ])
  method(generic, generic2) {}
}

function _dec(target, key) {
  return Arg()(target, key, 1);
}
