import { DesignType as _DesignType } from "@proteria/metadata";
import { createType as _type } from "@proteria/metadata";
import { Decorate } from "./Decorate";
const sym = Symbol();

@Decorate()
@Reflect.metadata(_DesignType.Type, Function)
@Reflect.metadata(_DesignType.ParamType, [
  _type(() => String),
  _type(() => Number),
  _type(() => Number),
  _type(() => String),
  _type(() => Boolean),
  _type(() => String),
  _type(() => Number),
  _type(() => Object),
  _type(() => Function),
  _type(() => Object),
  _type(() => Object),
  _type(() => Function),
  _type(() => undefined),
  _type(() => undefined),
  _type(() => Object),
  _type(() => Function),
  _type(() => Boolean),
  _type(() => Boolean),
  _type(() => Object),
])
@Reflect.metadata(_DesignType.PropertyList, [])
@Reflect.metadata(_DesignType.MethodList, [
  "p0",
  "method",
  "method2",
  "assignments",
])
class Sample {
  constructor(
    p0,
    p1,
    p2,
    p3,
    p4,
    p5,
    p6,
    p7,
    p8,
    p9,
    p10,
    p11,
    p12,
    p13,
    p14,
    p15,
    p16,
    p17,
    p18 = "abc"
  ) {
    this.p0 = p0;
  }

  @Decorate
  @_decorateArgument
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, [
    _type(() => Symbol),
    _type(() => Object),
    _type(() => String),
    _type(() => undefined),
    _type(() => String),
    _type(() => String),
    _type(() => (typeof Maybe === "undefined" ? Object : Maybe), [
      _type(() => String),
    ]),
    _type(() => Object),
    _type(() => Object),
    _type(() => Array, [_type(() => String)]),
    _type(() => Array),
    _type(() => undefined),
    _type(() => Boolean),
    _type(() => undefined),
    _type(() => Object),
    _type(() => Object),
    _type(() => Object),
    _type(() => Number),
  ])
  method(
    p0,
    p1,
    p2,
    p3,
    p4,
    p5,
    p6,
    p7,
    p8,
    p9,
    p10,
    p11,
    p12,
    p13,
    p14,
    p15,
    p16,
    p17
  ) {}
  /**
   * Member Expression
   */

  @Decorate()
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, [
    _type(() => Object),
    _type(() =>
      typeof Decorate.Name === "undefined" ? Object : Decorate.Name
    ),
  ])
  method2(p0 = "abc", p1) {}
  /**
   * Assignments
   */

  @Decorate()
  @Reflect.metadata(_DesignType.Type, Function)
  @Reflect.metadata(_DesignType.ParamType, [_type(() => Object)])
  assignments(p0 = "abc") {}
}

function _decorateArgument(target, key) {
  return Arg()(target, key, 0);
}
