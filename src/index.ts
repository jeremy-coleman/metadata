import "reflect-metadata";
import { __decorate, __metadata } from "tslib";

/**
 * `metadataKey`s used to denote type information.
 */
export enum DesignType {
  Type = "metadata.type",
  ParamType = "metadata.param_types",
  ReturnType = "metadata.return_type",
  TypeInfo = "metadata.type_info",
  /** List of class property names (excluding symbols) */
  PropertyList = "metadata.property_list",
  /** List of class method names (excluding symbols) */
  MethodList = "metadata.method_list",
}

/** @internal */
export function createType(
  typeFactory: any,
  params?: any[],
  options?: Record<string, any>
) {
  if (!Array.isArray(params)) {
    options = params;
    params = [];
  }

  return {
    get type() {
      return typeFactory();
    },
    typeFactory,
    params,
    ...options,
  };
}

type Type =
  | StringConstructor
  | NumberConstructor
  | ObjectConstructor
  | SymbolConstructor
  | ArrayConstructor
  | BooleanConstructor
  | (new (...args: any[]) => any)
  | Record<string, string | number>; // enum

interface TypeInformation {
  type: Type;
  typeFactory: () => Type;
  params: TypeInformation[];
  nullable?: boolean;
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

/**
 * Returns a list of class method names.
 * @param Class Class constructor
 */
export function getClassMethods(Class: new (...args: any[]) => any): string[] {
  return Reflect.getMetadata(DesignType.MethodList, Class);
}

/**
 * Returns a list of arguments with their types of a
 * given method of a Class.
 * @param Class Class constructor
 * @param key Method name
 */
export function getClassMethodArguments<T = any>(
  Class: new (...args: any[]) => T,
  key: PickKeyBy<T, Function>
): TypeInformation[] {
  return Reflect.getMetadata(
    DesignType.ParamType,
    Class.prototype,
    key as string | symbol
  );
}

/**
 * Returns the return type information of a given method of a Class.
 * @param Class Class constructor
 * @param key Method name
 */
export function getClassMethodReturnType<T = any>(
  Class: new (...args: any[]) => T,
  key: PickKeyBy<T, Function>
): TypeInformation {
  return Reflect.getMetadata(
    DesignType.ReturnType,
    Class.prototype,
    key as string | symbol
  );
}

/**
 * Returns a function that returns the type information of a class property.
 * @param Class Class constructor
 * @param key Property name
 */
export function getClassPropertyType<T = any>(
  Class: new (...args: any[]) => T,
  key: OmitKeyBy<T, Function>
): TypeInformation {
  return Reflect.getMetadata(
    DesignType.Type,
    Class.prototype,
    key as string | symbol
  );
}

const toTSType = (type: TypeInformation) =>
  type.nullable ? Object : type.type;

/**
 * Compatibility layer with `emitDecoratorMetadata`. Class decorated with
 * `emitDecoratorMetadata` will have the same metadata as if compiled by TypeScript
 * with `emitDecoratorMetadata` enabled.
 */
export const emitDecoratorMetadata: ClassDecorator = (Class: any) => {
  for (const method of getClassMethods(Class)) {
    try {
      const type = getClassMethodArguments(Class, method).map(toTSType);
      const returnType = toTSType(getClassMethodReturnType(Class, method));
      __decorate(
        [
          __metadata("design:type", Function),
          __metadata("design:paramtypes", type),
          __metadata("design:returntype", returnType),
        ],
        Class.prototype,
        method,
        null
      );
    } catch {}
  }

  for (const property of getClassProperties(Class)) {
    const type = toTSType(getClassPropertyType(Class, property));
    __decorate(
      [__metadata("design:type", type)],
      Class.prototype,
      property,
      undefined
    );
  }
};
