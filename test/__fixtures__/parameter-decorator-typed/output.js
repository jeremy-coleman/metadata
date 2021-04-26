import {
  createType as _type,
  DesignType as _DesignType,
  StringType as _StringType3,
  ObjectType as _ObjectType3,
  StringType as _StringType4,
} from "@proteria/metadata";

@Reflect.metadata(_DesignType.PropertyList, [])
@Reflect.metadata(_DesignType.MethodList, [])
class Injected {}

@_decorateArgument
@Reflect.metadata(_DesignType.Type, Function)
@Reflect.metadata(_DesignType.ParamType, [
  _type(() => (typeof Injected === "undefined" ? Object : Injected)),
])
@Reflect.metadata(_DesignType.PropertyList, [])
@Reflect.metadata(_DesignType.MethodList, [])
class MyClass {
  constructor(parameter) {}
}

@_decorateArgument2
@_decorateArgument3
@Reflect.metadata(_DesignType.Type, Function)
@Reflect.metadata(_DesignType.ParamType, [
  _type(() => (typeof Injected === "undefined" ? Object : Injected)),
  _type(() => (typeof Injected === "undefined" ? Object : Injected)),
])
@Reflect.metadata(_DesignType.PropertyList, [])
@Reflect.metadata(_DesignType.MethodList, [
  "parameter",
  "methodUndecorated",
  "method",
  "methodWithObjectSpread",
])
class MyOtherClass {
  constructor(parameter, otherParam) {
    this.parameter = parameter;
  }

  @_decorateArgument4
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, [
    _type(_StringType3),
    _type(_ObjectType3),
  ])
  methodUndecorated(param, otherParam) {}

  @decorate("named")
  @_decorateArgument5
  @_decorateArgument6
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, [
    _type(() => (typeof Injected === "undefined" ? Object : Injected)),
    _type(() => (typeof Schema === "undefined" ? Object : Schema)),
  ])
  method(param, schema) {}

  @_decorateArgument7
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, [
    _type(() =>
      typeof SchemaObjectSpread === "undefined" ? Object : SchemaObjectSpread
    ),
  ])
  methodWithObjectSpread({ name }) {}
}

@Decorate
@_decorateArgument8
@_decorateArgument9
@Reflect.metadata(_DesignType.Type, Function)
@Reflect.metadata(_DesignType.ParamType, [
  _type(() => (typeof Injected === "undefined" ? Object : Injected)),
  _type(() => (typeof Injected === "undefined" ? Object : Injected)),
])
@Reflect.metadata(_DesignType.PropertyList, [])
@Reflect.metadata(_DesignType.MethodList, ["module", "method"])
class DecoratedClass {
  constructor(module, otherModule) {
    this.module = module;
  }

  @decorate("example")
  @_decorateArgument10
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, [_type(_StringType4)])
  method(param) {}
}

function _decorateArgument(target, key) {
  return inject()(target, undefined, 0);
}

function _decorateArgument2(target, key) {
  return inject()(target, undefined, 0);
}

function _decorateArgument3(target, key) {
  return inject("KIND")(target, undefined, 1);
}

function _decorateArgument4(target, key) {
  return demo()(target, key, 0);
}

function _decorateArgument5(target, key) {
  return inject()(target, key, 0);
}

function _decorateArgument6(target, key) {
  return arg()(target, key, 1);
}

function _decorateArgument7(target, key) {
  return argObjectSpread()(target, key, 0);
}

function _decorateArgument8(target, key) {
  return inject()(target, undefined, 0);
}

function _decorateArgument9(target, key) {
  return inject()(target, undefined, 1);
}

function _decorateArgument10(target, key) {
  return inject()(target, key, 0);
}
