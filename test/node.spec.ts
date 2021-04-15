import path from 'path';
import { createTests } from './shared';

const { fixtures } = createTests({
  presets: [
    ['@babel/preset-env', { useBuiltIns: false, targets: { node: true } }],
    ['@babel/preset-typescript', { allExtensions: true }],
  ],
  plugins: [
    require.resolve('../src/plugin'),
    '@babel/plugin-transform-runtime',
    ['@babel/plugin-syntax-decorators', { legacy: true }],
    '@babel/plugin-syntax-class-properties',
  ],
});

fixtures('emit metadata with node env', path.join(__dirname, '__node__'));
