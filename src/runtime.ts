import "reflect-metadata";

export enum DesignType {
  Type = "😔.type",
  ParamType = "😔.param_types",
  ReturnType = "😔.return_type",
  TypeInfo = "😔.type_info",
  PropertyList = "😔.property_list",
  MethodList = "😔.method_list",
}

export function createType(
  type: any,
  params?: any[],
  options?: Record<string, any>
) {
  return { type, params, ...options };
}

interface TypeInformation {
  type:
    | StringConstructor
    | NumberConstructor
    | ObjectConstructor
    | SymbolConstructor
    | ArrayConstructor
    | BooleanConstructor
    | (new (...args: any[]) => any)
    | Record<string, string | number>; // enum
  params: TypeInformation[];
  nullable: true;
}

type PickKeyBy<T, Condition> = {
  [key in keyof T]: T[key] extends Condition ? key : never;
}[keyof T];

type OmitKeyBy<T, Condition> = {
  [key in keyof T]: T[key] extends Condition ? never : key;
}[keyof T];

export function getClassProperties(
  Class: new (...args: any[]) => any
): string[] {
  return Reflect.getMetadata(DesignType.PropertyList, Class);
}

export function getClassMethods(Class: new (...args: any[]) => any): string[] {
  return Reflect.getMetadata(DesignType.MethodList, Class);
}

export function getClassMethodArguments<T>(
  Class: new (...args: any[]) => T,
  key: PickKeyBy<T, Function>
): TypeInformation {
  return Reflect.getMetadata(
    DesignType.ParamType,
    Class.prototype,
    key as string | symbol
  )();
}

export function getClassMethodReturnType<T>(
  Class: new (...args: any[]) => T,
  key: PickKeyBy<T, Function>
): TypeInformation {
  return Reflect.getMetadata(
    DesignType.ReturnType,
    Class.prototype,
    key as string | symbol
  )();
}

export function getClassPropertyType<T>(
  Class: new (...args: any[]) => T,
  key: OmitKeyBy<T, Function>
): TypeInformation {
  return Reflect.getMetadata(
    DesignType.Type,
    Class.prototype,
    key as string | symbol
  )();
}
