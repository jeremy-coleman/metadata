"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _runtime = require("@proteriax/metadata/runtime");

var _based = _interopRequireDefault(require("based"));

var _decorator = _interopRequireDefault(require("decorator"));

var _some = require("some");

var _graphql = require("@nestjs/graphql");

var _xyz = require("xyz");

@_based.default
@_dec
@_dec2
@Reflect.metadata(_runtime.DesignType.Type, Function)
@Reflect.metadata(_DesignType.ParamType, () => [
  _type(typeof _some.Some === "undefined" ? Object : _some.Some),
  _type(typeof _some.Some === "undefined" ? Object : _some.Some),
])
@Reflect.metadata(_DesignType.PropertyList, ["param", "param2"])
@Reflect.metadata(_DesignType.MethodList, ["methodName"])
class Named {
  constructor(param, param2) {
    this.param = param;
    this.param2 = param2;
  }

  @((0, _based.default)())
  @_dec3
  @_dec4
  @_dec5
  @Reflect.metadata(_runtime.DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, () => [
    (0, _runtime.createType)(
      typeof _graphql.Args === "undefined" ? Object : _graphql.Args
    ),
    _type(typeof _graphql.Context === "undefined" ? Object : _graphql.Context),
    _type(Object),
  ])
  methodName(args, context, xyz) {}
}

function _dec(target, key) {
  return (0, _decorator.default)(_some.Some)(target, undefined, 0);
}

function _dec2(target, key) {
  return (0, _decorator.default)(target, undefined, 1);
}

function _dec3(target, key) {
  return (0, _graphql.Args)()(target, key, 0);
}

function _dec4(target, key) {
  return (0, _graphql.Context)()(target, key, 1);
}

function _dec5(target, key) {
  return (0, _decorator.default)(_xyz.Xyz)(target, key, 2);
}
