import { DesignType as _DesignType } from "@proteriax/metadata/runtime";
import { createType as _type } from "@proteriax/metadata/runtime";

@Reflect.metadata(_DesignType.PropertyList, [])
@Reflect.metadata(_DesignType.MethodList, [])
class Injected {}

@_dec
@Reflect.metadata(_DesignType.Type, Function)
@Reflect.metadata(_DesignType.ParamType, () => [
  _type(typeof Injected === "undefined" ? Object : Injected),
])
@Reflect.metadata(_DesignType.PropertyList, [])
@Reflect.metadata(_DesignType.MethodList, [])
class MyClass {
  constructor(parameter) {}
}

@_dec2
@_dec3
@Reflect.metadata(_DesignType.Type, Function)
@Reflect.metadata(_DesignType.ParamType, () => [
  _type(typeof Injected === "undefined" ? Object : Injected),
  _type(typeof Injected === "undefined" ? Object : Injected),
])
@Reflect.metadata(_DesignType.PropertyList, ["parameter"])
@Reflect.metadata(_DesignType.MethodList, [
  "methodUndecorated",
  "method",
  "methodWithObjectSpread",
])
class MyOtherClass {
  constructor(parameter, otherParam) {
    this.parameter = parameter;
  }

  @_dec4
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, () => [_type(String), _type(Object)])
  methodUndecorated(param, otherParam) {}

  @decorate("named")
  @_dec5
  @_dec6
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, () => [
    _type(typeof Injected === "undefined" ? Object : Injected),
    _type(typeof Schema === "undefined" ? Object : Schema),
  ])
  method(param, schema) {}

  @_dec7
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, () => [
    _type(
      typeof SchemaObjectSpread === "undefined" ? Object : SchemaObjectSpread
    ),
  ])
  methodWithObjectSpread({ name }) {}
}

@Decorate
@_dec8
@_dec9
@Reflect.metadata(_DesignType.Type, Function)
@Reflect.metadata(_DesignType.ParamType, () => [
  _type(typeof Injected === "undefined" ? Object : Injected),
  _type(typeof Injected === "undefined" ? Object : Injected),
])
@Reflect.metadata(_DesignType.PropertyList, ["module"])
@Reflect.metadata(_DesignType.MethodList, ["method"])
class DecoratedClass {
  constructor(module, otherModule) {
    this.module = module;
  }

  @decorate("example")
  @_dec10
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, () => [_type(String)])
  method(param) {}
}

function _dec(target, key) {
  return inject()(target, undefined, 0);
}

function _dec2(target, key) {
  return inject()(target, undefined, 0);
}

function _dec3(target, key) {
  return inject("KIND")(target, undefined, 1);
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
