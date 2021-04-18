import { DesignType as _DesignType } from "@proteriax/metadata/runtime";
import { createType as _type } from "@proteriax/metadata/runtime";

@Decorate
@Reflect.metadata(_DesignType.Type, Function)
@Reflect.metadata(_DesignType.ParamType, () => [
  _type(typeof Generic === "undefined" ? Object : Generic, [
    _type(typeof A === "undefined" ? Object : A),
  ]),
  _type(typeof Generic === "undefined" ? Object : Generic, [
    _type(typeof A === "undefined" ? Object : A),
    _type(typeof B === "undefined" ? Object : B),
  ]),
])
@Reflect.metadata(_DesignType.PropertyList, ["generic"])
@Reflect.metadata(_DesignType.MethodList, [
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
  @_dec
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, () => [
    _type(typeof Inter === "undefined" ? Object : Inter, [
      _type(typeof A === "undefined" ? Object : A),
    ]),
    _type(typeof InterGen === "undefined" ? Object : InterGen, [
      _type(typeof A === "undefined" ? Object : A),
      _type(typeof B === "undefined" ? Object : B),
    ]),
  ])
  @Reflect.metadata(_DesignType.ReturnType, () => _type(String))
  method(generic, generic2) {}

  @Run
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, () => [])
  @Reflect.metadata(_DesignType.ReturnType, () => _type(Number))
  method2() {}

  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, () => [])
  @Reflect.metadata(_DesignType.ReturnType, () =>
    _type(Promise, [_type(String)])
  )
  method3() {}

  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, () => [
    _type(
      Promise,
      [
        _type(typeof Generic === "undefined" ? Object : Generic, [
          _type(typeof A === "undefined" ? Object : A),
        ]),
      ],
      {
        optional: true,
      }
    ),
  ])
  method4(argument) {}
}

function _dec(target, key) {
  return Arg()(target, key, 1);
}
