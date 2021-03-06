import { __decorate, __metadata } from "tslib";
import { DesignType } from "./runtime";

export * from "./runtime";

type Type =
  | StringConstructor
  | NumberConstructor
  | ObjectConstructor
  | SymbolConstructor
  | ArrayConstructor
  | BooleanConstructor
  | (new (...args: any[]) => any)
  | Record<string, string | number>; // enum

/**
 * Runtime type information containing the type constructor, and optionally type
 * parameters plus its nullability.
 */
export interface TypeInformation {
  /**
   * Class constructor for the main type. A `string` type is represented
   * by the global `StringConstructor`, and an `array` is represented
   * by the global `ArrayConstructor`, etc.
   *
   * This is a getter property and will trigger a `ReferenceError` if the
   * class is in [temporal dead zone](https://2ality.com/2015/10/why-tdz.html).
   */
  type: Type;

  /**
   * Function that returns the class constructor. Most libraries that use
   * decorator metadata accept a type factory function, which is provided here.
   * @see [[TypeInformation.type]]
   */
  typeFactory: () => Type;

  /**
   * Type parameters if this type is generic. For example, `string[]` will be
   * represented by `{ type: Array, params: [{ type: String }] }`. This can be
   * an empty array if there is no type parameter.
   */
  params: TypeInformation[];

  /**
   * True if this type can also be `undefined`, and false or undefined if otherwise.
   */
  nullable?: boolean;

  /**
   * Initial value. Only available for class properties that are immediately assigned
   * a literal value.
   */
  value?: any;
}

/** Returns a list of keys where the value `extends Condition` */
type PickKeyBy<T, Condition> = {
  [key in keyof T]: T[key] extends Condition ? key : never;
}[keyof T];

/** Returns a list of keys where the value does not `extends Condition` */
type OmitKeyBy<T, Condition> = {
  [key in keyof T]: T[key] extends Condition ? never : key;
}[keyof T];

const getPrototype = <T>(target: (new (...args: any[]) => T) | T): T =>
  typeof target === "function" ? target.prototype : target;

/**
 * Returns a list of class property names.
 * @param Class Class constructor
 */
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
 * Returns a list of arguments with their types of a given method of a Class.
 * @param target Prototype object or class constructor
 * @param key Method name
 */
export function getClassMethodArguments<T = any>(
  target: (new (...args: any[]) => T) | T,
  key: PickKeyBy<T, Function>
): TypeInformation[] {
  return Reflect.getMetadata(
    DesignType.ParamType,
    getPrototype(target),
    key as string | symbol
  );
}

/**
 * Returns the return type information of a given method of a Class.
 * @param target Prototype object or class constructor
 * @param key Method name
 */
export function getClassMethodReturnType<T = any>(
  target: (new (...args: any[]) => T) | T,
  key: PickKeyBy<T, Function>
): TypeInformation {
  return Reflect.getMetadata(
    DesignType.ReturnType,
    getPrototype(target),
    key as string | symbol
  );
}

/**
 * Returns the type information of a class property.
 * @param target Prototype object or class constructor
 * @param key Property name
 */
export function getClassPropertyType<T = any>(
  target: (new (...args: any[]) => T) | T,
  key: OmitKeyBy<T, Function>
): TypeInformation {
  return Reflect.getMetadata(
    DesignType.Type,
    getPrototype(target),
    key as string | symbol
  );
}

/**
 * Utility function that combines multiple decorators into one.
 * Decorators will be executed from right to left.
 */
export function mergeDecorators<
  T extends ClassDecorator | PropertyDecorator | MethodDecorator
>(...decorators: (null | undefined | false | T)[]): T {
  return ((...args: any[]) =>
    decorators
      .filter(Boolean)
      .reduceRight((accum, cur: any) => cur(...args), null)) as any;
}

/** Compatibility: TypeScript compiler converts nullable types to `Object`. */
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
    try {
      const type = toTSType(getClassPropertyType(Class, property));
      __decorate(
        [__metadata("design:type", type)],
        Class.prototype,
        property,
        undefined
      );
    } catch {
      __decorate(
        [__metadata("design:type", Object)],
        Class.prototype,
        property,
        undefined
      );
    }
  }
};
