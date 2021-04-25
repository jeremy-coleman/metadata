"use strict";

var _metadata = require("@proteria/metadata");

var _lib = require("lib");

@injectable()
@Reflect.metadata(_metadata.DesignType.PropertyList, ["child"])
@Reflect.metadata(_metadata.DesignType.MethodList, [])
class Self {
  @((0, _lib.inject)())
  @Reflect.metadata(
    _metadata.DesignType.Type,
    (0, _metadata.createType)(() => Self)
  )
  child;
}
