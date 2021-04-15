import { create } from './babel-test';
import type { TransformOptions } from '@babel/core';
import { prettier } from '../package.json';

import { toMatchFile } from 'jest-file-snapshot';
expect.extend({ toMatchFile });

export const createTests = (options: TransformOptions) =>
  create({
    prettier: prettier as any,
    ...options,
  });
