import type { TransformOptions } from "@babel/core";
import { toMatchFile } from "jest-file-snapshot";
import { create } from "./babel-test";
import { prettier } from "../package.json";

expect.extend({ toMatchFile });

export const createTests = (options: TransformOptions) =>
  create({
    prettier: prettier as any,
    parserOpts: {
      plugins: ["typescript", "classProperties", "decorators-legacy"],
    },
    ...options,
  });
