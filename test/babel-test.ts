// https://github.com/satya164/babel-test
// (C) Satyajit Sahoo. MIT License
/* istanbul ignore file */
/// <reference path="./shared.ts" />
import "regexp.escape/shim";
import fs from "fs";
import { join, basename, dirname } from "path";
import dedent from "dedent";
import chalk from "chalk";
import stripAnsi from "strip-ansi";
import ErrorStackParser from "error-stack-parser";
import { transformAsync } from "@babel/core";
import { format } from "prettier";
import type { TransformOptions } from "@babel/core";
import type { Options as PrettierOptions } from "prettier";

declare global {
  interface RegExpConstructor {
    escape(source: string): string;
  }
}

type DoneCallback = {
  (...args: any[]): any;
  fail(error?: string | { message: string }): any;
};

type LifecycleCallback = (cb: DoneCallback) => any;

type FixturesOptions = {
  beforeEach?: LifecycleCallback;
  afterEach?: LifecycleCallback;
  beforeAll?: LifecycleCallback;
  afterAll?: LifecycleCallback;
};

export function create({
  prettier,
  ...config
}: TransformOptions & {
  prettier: PrettierOptions;
}) {
  const transform = async (code: string, options?: TransformOptions) => {
    const res = await transformAsync(code, {
      caller: { name: "babel-test" },
      babelrc: false,
      configFile: false,
      ...config,
      ...options,
    });
    return {
      code: format(res.code!, { ...prettier, parser: "babel-ts" }).trim(),
    };
  };

  const runner = (directory: string, options?: FixturesOptions) => () => {
    if (options) {
      const hooks = [
        "before",
        "after",
        "beforeEach",
        "afterEach",
        "beforeAll",
        "afterAll",
      ];

      for (const hook of hooks) {
        if (options[hook] !== undefined) {
          global[hook](options[hook]);
        }
      }
    }

    fs.readdirSync(directory)
      .filter(f => fs.lstatSync(join(directory, f)).isDirectory())
      .forEach(f => {
        // Respect skip. and only. prefixes in folder names
        const t = f.startsWith("skip.")
          ? it.skip
          : f.startsWith("only.")
          ? it.only
          : it;

        t(f.replace(/^(skip|only)\./, "").replace(/(-|_)/g, " "), async () => {
          const filename = join(join(directory, f), "code.js");
          const content = fs.readFileSync(filename, "utf8");

          const output = await callback(content, { filename });
          try {
            if ("expect" in global) {
              // Use `expect` for assertions if available, for example when using Jest
              const expected = expect(output.content);

              if (typeof expected.toMatchFile === "function") {
                expected.toMatchFile(output.filename);
              } else {
                expected.toBe(fs.readFileSync(output.filename, "utf8"));
              }
            } else {
              // If `expect` is not available, use `assert`, for example when using Mocha
              const assert = require("assert");
              const actual = fs.readFileSync(output.filename, "utf8");

              assert.strictEqual(
                actual,
                output.content,
                `Expected output doesn't match ${basename(output.filename)}`
              );
            }
          } catch (e) {
            e.stack = `${e.message}\n${output.stack}`;
            throw e;
          }
        });
      });
  };

  const callback = async (code: string, { filename }) => {
    // We should filter out stack traces from the library
    const stack = ErrorStackParser.parse(new Error())
      .filter(s => s.fileName !== __filename)
      .map(s => s.source)
      .join("\n");

    class TestError extends Error {
      constructor(message: string) {
        super(message);
        this.stack = `\n${stack}`;
      }

      static throw(list: TemplateStringsArray, ...inters: any[]): never {
        throw new TestError(chalk.white(dedent(chalk(list, ...inters))));
      }
    }

    const output = join(dirname(filename), "output.js");
    const error = join(dirname(filename), "error.js");

    if (fs.existsSync(output) && fs.existsSync(error)) {
      // The test should either pass, or throw
      // If the fixture has files for output and error, one needs to be removed

      // By default, Jest will grey out the text and highlight the stack trace
      // We force it to be white for more emphasis on the message
      TestError.throw`
        Both {blue output.js} and {blue error.js} exist for {blue ${basename(
          dirname(filename)
        )}}.
        
        Remove one of them to continue.
      `;
    }

    try {
      const { code: result } = await transform(code, { filename });
      if (fs.existsSync(error)) {
        TestError.throw`
          The test previously failed with an error, but passed for this run.
          
          If this is expected, remove the file {blue error.js} to continue.
        `;
      }
      return {
        filename: output,
        content: result + "\n",
        stack,
      };
    } catch (e) {
      if (fs.existsSync(output)) {
        console.error(e);
        TestError.throw`
          The test previously passed, but failed with an error for this run.
          
          If this is expected, remove the file {blue output.js} to continue.
        `;
      }
      return {
        filename: error,
        // Errors might have ansi colors, for example babel code frame error
        // Strip them so the error is more readable
        // Also replace the current working directory with a placeholder
        // This makes sure that the StackTraces are same across machines
        content:
          stripAnsi(e.stack).replace(
            new RegExp(RegExp.escape(process.cwd()), "g"),
            "<cwd>"
          ) + "\n",
        stack,
      };
    }
  };

  return { createRunner: runner };
}
