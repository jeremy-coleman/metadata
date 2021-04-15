import path from 'path';
import { createTests } from './shared';

const { fixtures } = createTests({
  presets: [
    ['@babel/preset-env', { useBuiltIns: false, targets: { node: true } }],
    ['@babel/preset-typescript', { allExtensions: true }],
  ],
  plugins: [
    require.resolve('../src/plugin'),
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
});

fixtures('emit metadata with node env', path.join(__dirname, '__node__'));
