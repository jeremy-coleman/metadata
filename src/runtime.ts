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
