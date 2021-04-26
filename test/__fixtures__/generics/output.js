import {
  createType as _type,
  DesignType as _DesignType,
  ArrayType as _ArrayType,
  NumberType as _NumberType,
  StringType as _StringType,
  SymbolType as _SymbolType,
} from "@proteria/metadata";

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
  @Reflect.metadata(_DesignType.ReturnType, _type(_StringType))
  method(generic, generic2) {}

  @Run
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, [])
  @Reflect.metadata(_DesignType.ReturnType, _type(_NumberType))
  method2() {}

  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, [])
  @Reflect.metadata(
    _DesignType.ReturnType,
    _type(() => Promise, [_type(_StringType)])
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
    _type(_NumberType, {
      nullable: true,
    })
  )
  optional;
  @decoratorOrderTest
  @Reflect.metadata(_DesignType.Type, _type(_SymbolType))
  symbol;
  @Reflect.metadata(_DesignType.Type, _type(_ArrayType, [_type(_NumberType)]))
  arrays;
}

function _decorateArgument(target, key) {
  return Arg()(target, key, 1);
}
