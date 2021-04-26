import "reflect-metadata";

/**
 * `metadataKey`s used to denote type information.
 * @internal
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

/** @hidden */
export const ArrayType = () => Array;
/** @hidden */
export const BooleanType = () => Boolean;
/** @hidden */
export const FunctionType = () => Function;
/** @hidden */
export const NumberType = () => Number;
/** @hidden */
export const ObjectType = () => Object;
/** @hidden */
export const StringType = () => String;
/** @hidden */
export const SymbolType = () => Symbol;

/** @internal */
export function createType(
  typeFactory: any,
  params: any[] = [],
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
