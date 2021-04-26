# metadata

Babel plugin to emit decorator extensive metadata information, similar to TypeScript
compiler, but supports lazy initialization, circular dependencies, generics
and optional types.

## Getting Started

In your `.babelrc` or other Babel configuration file, add the following:

```json
{
  "plugins": [
    "@proteria/metadata/babel",
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }]
  ]
}
```

## Example

To generate field decorators automatically with `typeorm`:

```ts
import { __decorate } from "tslib";
import { Column } from "typeorm";
import { getClassProperties, getClassPropertyType } from "@proteria/metadata";

@annotate
class DataTable {
  name: string;
  id: number;
}

function annotate(Class: new (...args: any[]) => any) {
  for (const propertyName of getClassProperties(Class)) {
    const { typeFactory, nullable } = getClassPropertyType(Class, propertyName);
    const options = nullable && { nullable };
    __decorate([Column(typeFactory, options)], Class.prototype, propertyName);
  }
}
```

### Working with libraries that use TypeScript metadata

You can decorate classes with `emitDecoratorMetadata` to enable interop
with libraries that use TypeScript emitted metadata.

```ts
import { emitDecoratorMetadata } from "PENDING_PACKAGE_NAME";

@emitDecoratorMetadata
class Person {
  firstName: string;
  middleName?: string;
  lastName: string;

  getName() {
    return this.firstName + " " + this.lastName;
  }
}
```
