import {
  createType as _type,
  DesignType as _DesignType,
  NumberType as _NumberType,
  StringType as _StringType,
  BooleanType as _BooleanType,
} from "@proteria/metadata";

@Reflect.metadata(_DesignType.PropertyList, [
  "defaultString",
  "defaultNumber",
  "defaultBoolean",
  "defaultBigInt",
  "defaultArray",
])
@Reflect.metadata(_DesignType.MethodList, [])
class Value {
  @Reflect.metadata(
    _DesignType.Type,
    _type(_StringType, {
      value: "",
    })
  )
  defaultString = "";
  @Reflect.metadata(
    _DesignType.Type,
    _type(_NumberType, {
      value: 0,
    })
  )
  defaultNumber = 0;
  @Reflect.metadata(
    _DesignType.Type,
    _type(_BooleanType, {
      value: false,
    })
  )
  defaultBoolean = false;
  @Reflect.metadata(
    _DesignType.Type,
    _type(() => (typeof BigInt === "undefined" ? Object : BigInt), {
      value: 12n,
    })
  )
  defaultBigInt = 12n;
  @Reflect.metadata(_DesignType.Type, _type(() => Array))
  defaultArray = [];
}
