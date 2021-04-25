# babel-annotate

Babel plugin to emit decorator extensive metadata information like TypeScript
compiler, but works with lazy initialization, circular dependencies, generics
and optional types.

## Getting Started

In your `.babelrc` or other Babel configuration file, add the following:

```json
{
  "plugins": [
    "PENDING_PACKAGE_NAME",
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }]
  ]
}
```

## Example

```ts
import { __decorate } from "tslib";
import { Column } from "typeorm";
import { getClassProperties, getClassPropertyType } from "PENDING_PACKAGE_NAME";

@annotate
class DataTable {
  name: string;
}

function annotate(Class: new (...args: any[]) => any) {
  for (const propertyName of getClassProperties(Class)) {
    const { typeFactory, nullable } = getClassPropertyType(Class, propertyName);
    const options = nullable && { nullable };
    __decorate([Column(typeFactory, options)], Class.prototype, propertyName);
  }
}
```
