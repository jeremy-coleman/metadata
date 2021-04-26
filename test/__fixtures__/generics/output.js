import { DesignType as _DesignType } from "@proteria/metadata";
import { createType as _type } from "@proteria/metadata";

@Decorate
@Reflect.metadata(_DesignType.Type, Function)
@Reflect.metadata(_DesignType.ParamType, [
  _type(() => (typeof Generic === "undefined" ? Object : Generic), [
    _type(() => (typeof A === "undefined" ? Object : A)),
  ]),
  _type(() => (typeof Generic === "undefined" ? Object : Generic), [
    _type(() => (typeof A === "undefined" ? Object : A)),
    _type(() => (typeof B === "undefined" ? Object : B)),
  ]),
])
@Reflect.metadata(_DesignType.PropertyList, ["optional", "symbol", "arrays"])
@Reflect.metadata(_DesignType.MethodList, [
  "generic",
  "method",
  "method2",
  "method3",
  "method4",
])
class MyClass {
  constructor(generic, generic2) {
    this.generic = generic;
  }

  @Run
  @_decorateArgument
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, [
    _type(() => (typeof Inter === "undefined" ? Object : Inter), [
      _type(() => (typeof A === "undefined" ? Object : A)),
    ]),
    _type(() => (typeof InterGen === "undefined" ? Object : InterGen), [
      _type(() => (typeof A === "undefined" ? Object : A)),
      _type(() => (typeof B === "undefined" ? Object : B)),
    ]),
  ])
  @Reflect.metadata(_DesignType.ReturnType, _type(() => String))
  method(generic, generic2) {}

  @Run
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, [])
  @Reflect.metadata(_DesignType.ReturnType, _type(() => Number))
  method2() {}

  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, [])
  @Reflect.metadata(
    _DesignType.ReturnType,
    _type(() => Promise, [_type(() => String)])
  )
  method3() {}

  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, [
    _type(
      () => Promise,
      [
        _type(() => (typeof Generic === "undefined" ? Object : Generic), [
          _type(() => (typeof A === "undefined" ? Object : A)),
        ]),
      ],
      {
        nullable: true,
      }
    ),
  ])
  method4(argument) {}

  @Reflect.metadata(
    _DesignType.Type,
    _type(() => Number, {
      nullable: true,
    })
  )
  optional;
  @decoratorOrderTest
  @Reflect.metadata(_DesignType.Type, _type(() => Symbol))
  symbol;
  @Reflect.metadata(_DesignType.Type, _type(() => Array, [_type(() => Number)]))
  arrays;
}

function _decorateArgument(target, key) {
  return Arg()(target, key, 1);
}
