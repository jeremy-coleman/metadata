"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _metadata = require("@proteria/metadata");

var _based = _interopRequireDefault(require("based"));

var _decorator = _interopRequireDefault(require("decorator"));

var _some = require("some");

var _graphql = require("@nestjs/graphql");

var _xyz = require("xyz");

@_based.default
@_decorateArgument
@_decorateArgument2
@Reflect.metadata(_metadata.DesignType.Type, Function)
@Reflect.metadata(_metadata.DesignType.ParamType, [
  (0, _metadata.createType)(() =>
    typeof _some.Some === "undefined" ? Object : _some.Some
  ),
  (0, _metadata.createType)(() =>
    typeof _some.Some === "undefined" ? Object : _some.Some
  ),
])
@Reflect.metadata(_metadata.DesignType.PropertyList, [])
@Reflect.metadata(_metadata.DesignType.MethodList, [
  "param",
  "param2",
  "methodName",
])
class Named {
  constructor(param, param2) {
    this.param = param;
    this.param2 = param2;
  }

  @((0, _based.default)())
  @_decorateArgument3
  @_decorateArgument4
  @_decorateArgument5
  @Reflect.metadata(_metadata.DesignType.Type, Function)
  @Reflect.metadata(_metadata.DesignType.ParamType, [
    (0, _metadata.createType)(() =>
      typeof _graphql.Args === "undefined" ? Object : _graphql.Args
    ),
    (0, _metadata.createType)(() =>
      typeof _graphql.Context === "undefined" ? Object : _graphql.Context
    ),
    (0, _metadata.createType)(_metadata.ObjectType),
  ])
  methodName(args, context, xyz) {}
}

function _decorateArgument(target, key) {
  return (0, _decorator.default)(_some.Some)(target, undefined, 0);
}

function _decorateArgument2(target, key) {
  return (0, _decorator.default)(target, undefined, 1);
}

function _decorateArgument3(target, key) {
  return (0, _graphql.Args)()(target, key, 0);
}

function _decorateArgument4(target, key) {
  return (0, _graphql.Context)()(target, key, 1);
}

function _decorateArgument5(target, key) {
  return (0, _decorator.default)(_xyz.Xyz)(target, key, 2);
}
