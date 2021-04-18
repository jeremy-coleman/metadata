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
