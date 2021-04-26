import {
  createType as _type,
  DesignType as _DesignType,
  ArrayType as _ArrayType,
  NumberType as _NumberType,
  StringType as _StringType,
  BooleanType as _BooleanType,
  ObjectType as _ObjectType,
  FunctionType as _FunctionType,
} from "@proteria/metadata";
import { Decorate } from "./Decorate";
const sym = Symbol();

@Decorate()
@Reflect.metadata(_DesignType.Type, Function)
@Reflect.metadata(_DesignType.ParamType, [
  _type(() => String),
  _type(() => Number),
  _type(_NumberType),
  _type(_StringType),
  _type(_BooleanType),
  _type(_StringType),
  _type(_NumberType),
  _type(() => Object),
  _type(_FunctionType),
  _type(_ObjectType),
  _type(_ObjectType),
  _type(() => Function),
  _type(() => undefined),
  _type(() => undefined),
  _type(_ObjectType),
  _type(_FunctionType),
  _type(_BooleanType),
  _type(_BooleanType),
  _type(_ObjectType),
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
    _type(_ObjectType),
    _type(_StringType),
    _type(() => undefined),
    _type(_StringType),
    _type(_StringType),
    _type(() => (typeof Maybe === "undefined" ? Object : Maybe), [
      _type(_StringType),
    ]),
    _type(_ObjectType),
    _type(_ObjectType),
    _type(_ArrayType, [_type(_StringType)]),
    _type(_ArrayType),
    _type(() => undefined),
    _type(_BooleanType),
    _type(() => undefined),
    _type(_ObjectType),
    _type(() => Object),
    _type(_ObjectType),
    _type(_NumberType),
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
    _type(_ObjectType),
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
  @Reflect.metadata(_DesignType.ParamType, [_type(_ObjectType)])
  assignments(p0 = "abc") {}
}

function _decorateArgument(target, key) {
  return Arg()(target, key, 0);
}
