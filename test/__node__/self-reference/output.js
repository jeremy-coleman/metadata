"use strict";

var _runtime = require("@proteriax/metadata/runtime");

var _lib = require("lib");

@injectable()
@Reflect.metadata(_DesignType.PropertyList, ["child"])
@Reflect.metadata(_DesignType.MethodList, [])
class Self {
  @((0, _lib.inject)())
  @Reflect.metadata(_runtime.DesignType.Type, () =>
    (0, _runtime.createType)(Self)
  )
  child;
}
