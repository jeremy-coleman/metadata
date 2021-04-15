class Injected {}

@_dec
@Reflect.metadata('design:type', Function)
@Reflect.metadata('design:paramtypes', [
  typeof Injected === 'undefined' ? Object : Injected,
])
class MyClass {
  constructor(parameter) {}
}

@_dec2
@_dec3
@Reflect.metadata('design:type', Function)
@Reflect.metadata('design:paramtypes', [
  typeof Injected === 'undefined' ? Object : Injected,
  typeof Injected === 'undefined' ? Object : Injected,
])
class MyOtherClass {
  constructor(parameter, otherParam) {
    this.parameter = parameter;
  }

  @_dec4
  @Reflect.metadata('design:type', Function)
  @Reflect.metadata('design:paramtypes', [String, void 0])
  methodUndecorated(param, otherParam) {}

  @decorate('named')
  @_dec5
  @_dec6
  @Reflect.metadata('design:type', Function)
  @Reflect.metadata('design:paramtypes', [
    typeof Injected === 'undefined' ? Object : Injected,
    typeof Schema === 'undefined' ? Object : Schema,
  ])
  method(param, schema) {}

  @_dec7
  @Reflect.metadata('design:type', Function)
  @Reflect.metadata('design:paramtypes', [
    typeof SchemaObjectSpread === 'undefined' ? Object : SchemaObjectSpread,
  ])
  methodWithObjectSpread({ name }) {}
}

@Decorate
@_dec8
@_dec9
@Reflect.metadata('design:type', Function)
@Reflect.metadata('design:paramtypes', [
  typeof Injected === 'undefined' ? Object : Injected,
  typeof Injected === 'undefined' ? Object : Injected,
])
class DecoratedClass {
  constructor(module, otherModule) {
    this.module = module;
  }

  @decorate('example')
  @_dec10
  @Reflect.metadata('design:type', Function)
  @Reflect.metadata('design:paramtypes', [String])
  method(param) {}
}

function _dec(target, key) {
  return inject()(target, undefined, 0);
}

function _dec2(target, key) {
  return inject()(target, undefined, 0);
}

function _dec3(target, key) {
  return inject('KIND')(target, undefined, 1);
}

function _dec4(target, key) {
  return demo()(target, key, 0);
}

function _dec5(target, key) {
  return inject()(target, key, 0);
}

function _dec6(target, key) {
  return arg()(target, key, 1);
}

function _dec7(target, key) {
  return argObjectSpread()(target, key, 0);
}

function _dec8(target, key) {
  return inject()(target, undefined, 0);
}

function _dec9(target, key) {
  return inject()(target, undefined, 1);
}

function _dec10(target, key) {
  return inject()(target, key, 0);
}
