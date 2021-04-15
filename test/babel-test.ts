// https://github.com/satya164/babel-test
// (C) Satyajit Sahoo. MIT License
/* istanbul ignore file */
/// <reference path="./shared.ts" />
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import escapeRegexp from 'escape-string-regexp';
import ErrorStackParser from 'error-stack-parser';
import { transformAsync } from '@babel/core';
import { format } from 'prettier';
import type { TransformOptions } from '@babel/core';
import type { Options as PrettierOptions } from 'prettier';

type TransformCallback = (
  code: string,
  options?: TransformOptions
) => Promise<{ code: string }>;

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

type TestRunnerCallback = (args: { transform: TransformCallback }) => void;

const SUPPORTED_RUNNERS_TEXT =
  'Are you using a supported test runner such as Jest (https://jestjs.io) or Mocha (https://mochajs.org)?';

export function create({
  prettier,
  ...config
}: TransformOptions & {
  prettier: PrettierOptions;
}) {
  // Check if `describe` and `it` globals are available and throw if not
  // This avoids confusion with unsupported test runners and incorrect usage
  if (!('describe' in global && 'it' in global)) {
    throw new Error(
      `Couldn't find ${chalk.blue('describe')} and ${chalk.blue(
        'it'
      )} in the global scope. ${SUPPORTED_RUNNERS_TEXT}\n`
    );
  }

  const transform = async (code: string, options?: TransformOptions) => {
    const res = await transformAsync(code, {
      caller: { name: 'babel-test' },
      babelrc: false,
      configFile: false,
      ...config,
      ...options,
    });
    return {
      code: format(res.code!, { ...prettier, parser: 'babel-ts' }).trim(),
    };
  };

  const runner = (
    directory: string,
    options?: FixturesOptions,
    callback?: FixturesCallback
  ) => () => {
    if (options) {
      const hooks = [
        'before',
        'after',
        'beforeEach',
        'afterEach',
        'beforeAll',
        'afterAll',
      ];

      for (const hook of hooks) {
        if (options[hook] !== undefined) {
          if (global[hook] !== undefined) {
            global[hook](options[hook]);
          } else {
            throw Error(
              `Couldn't find ${chalk.blue(
                hook
              )} in the global scope. ${SUPPORTED_RUNNERS_TEXT}\n`
            );
          }
        }
      }
    }

    fs.readdirSync(directory)
      .filter(f => fs.lstatSync(path.join(directory, f)).isDirectory())
      .forEach(f => {
        // Respect skip. and only. prefixes in folder names
        const t = f.startsWith('skip.')
          ? it.skip
          : f.startsWith('only.')
          ? it.only
          : it;

        t(f.replace(/^(skip|only)\./, '').replace(/(-|_)/g, ' '), () => {
          const filename = path.join(path.join(directory, f), 'code.js');
          const content = fs.readFileSync(filename, 'utf8');

          return Promise.resolve(callback(content, { filename })).then(
            output => {
              try {
                if ('expect' in global) {
                  // Use `expect` for assertions if available, for example when using Jest
                  const expected = expect(output.content);

                  if (typeof expected.toMatchFile === 'function') {
                    expected.toMatchFile(output.filename);
                  } else {
                    expected.toBe(fs.readFileSync(output.filename, 'utf8'));
                  }
                } else {
                  // If `expect` is not available, use `assert`, for example when using Mocha
                  const assert = require('assert');
                  const actual = fs.readFileSync(output.filename, 'utf8');

                  assert.strictEqual(
                    actual,
                    output.content,
                    `Expected output doesn't match ${path.basename(
                      output.filename
                    )}`
                  );
                }
              } catch (e) {
                e.stack = `${e.message}\n${output.stack}`;
                throw e;
              }
            }
          );
        });
      });
  };

  type FixturesCallback = ReturnType<typeof helper>;

  const helper = (e: Error) => async (code: string, { filename }) => {
    // We should filter out stack traces from the library
    const stack = ErrorStackParser.parse(e)
      .filter(s => s.fileName !== __filename)
      .map(s => s.source)
      .join('\n');

    class TestError extends Error {
      constructor(message: string) {
        super(message);
        this.stack = `\n${stack}`;
      }
    }

    const output = path.join(path.dirname(filename), 'output.js');
    const error = path.join(path.dirname(filename), 'error.js');

    if (fs.existsSync(output) && fs.existsSync(error)) {
      // The test should either pass, or throw
      // If the fixture has files for output and error, one needs to be removed
      throw new TestError(
        // By default, Jest will grey out the text and highlight the stack trace
        // We force it to be white for more emphasis on the message
        chalk.white(
          `Both ${chalk.blue(path.basename(output))} and ${chalk.blue(
            path.basename(error)
          )} exist for ${chalk.blue(
            path.basename(path.dirname(filename))
          )}.\n\nRemove one of them to continue.`
        )
      );
    }

    try {
      const { code: code_2 } = await transform(code, { filename });
      if (fs.existsSync(error)) {
        throw new TestError(
          chalk.white(
            `The test previously failed with an error, but passed for this run.\n\nIf this is expected, remove the file ${chalk.blue(
              path.basename(error)
            )} to continue.`
          )
        );
      }
      return {
        filename: output,
        content: code_2 + '\n',
        stack,
      };
    } catch (e) {
      if (fs.existsSync(output)) {
        throw new TestError(
          chalk.white(
            `The test previously passed, but failed with an error for this run.\n\nIf this is expected, remove the file ${chalk.blue(
              path.basename(output)
            )} to continue.`
          )
        );
      }
      return {
        filename: error,
        // Errors might have ansi colors, for example babel codeframe error
        // Strip them so the error is more readable
        // Also replace the current working directory with a placeholder
        // This makes sure that the stacktraces are same across machines
        content:
          stripAnsi(e.stack).replace(
            new RegExp(escapeRegexp(process.cwd()), 'g'),
            '<cwd>'
          ) + '\n',
        stack,
      };
    }
  };

  // We create a new error here so we can point to user's file in stack trace
  // Otherwise stack traces will point to the library code
  function fixtures(
    title: string,
    directory: string,
    options?: FixturesOptions,
    callback: FixturesCallback = helper(new Error())
  ) {
    describe(title, runner(directory, options, callback));
  }

  fixtures.skip = (
    title: string,
    directory: string,
    options?: FixturesOptions,
    callback: FixturesCallback = helper(new Error())
  ) => describe.skip(title, runner(directory, options, callback));

  fixtures.only = (
    title: string,
    directory: string,
    options?: FixturesOptions,
    callback: FixturesCallback = helper(new Error())
  ) => describe.only(title, runner(directory, options, callback));

  return { transform, fixtures };
}
