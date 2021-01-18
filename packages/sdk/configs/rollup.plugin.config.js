import typescript from '@wessberg/rollup-plugin-ts'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

import tsConfig from './tsconfig.plugin.json'

/** @type {() => import('rollup').RollupOptions} */
export default () => {
  return {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    },
    plugins: [
      typescript({
        tsconfig: tsConfig.compilerOptions,
        exclude: ['node_modules/**/*', '*/**/node_modules/**/*']
      }),
      resolve({}),
      commonjs({
        include: /node_modules/
      }),
      json()
    ],

    // Important when using a `yarn link` version of the package, while developing the sdk against a plugin
    preserveSymlinks: true
  }
}
