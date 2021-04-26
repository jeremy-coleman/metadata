# metadata

[![GitHub](https://img.shields.io/badge/GitHub-Repo-green.svg)](https://github.com/proteriax/metadata) ![Test](https://github.com/proteriax/metadata/actions/workflows/test.yml/badge.svg)

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

## API

[Documentation](https://proteriax.github.io/metadata)

## Example

To generate field decorators automatically with `typeorm`:

```ts
import { Column } from "typeorm";
import { __decorate as decorate } from "tslib";
import { getClassProperties, getClassPropertyType } from "@proteria/metadata";

@annotate
class DataTable {
  name: string;
  id: number;
}

function annotate(Class: new (...args: any[]) => any) {
  for (const propertyName of getClassProperties(Class)) {
    const { typeFactory, nullable, value } = getClassPropertyType(
      Class,
      propertyName
    );
    decorate(
      [
        Column(typeFactory, {
          ...(nullable && { nullable }),
          ...(value && { default: value }),
        }),
      ],
      Class.prototype,
      propertyName
    );
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
