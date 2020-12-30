import { rollup } from '@dataden/build'

export default [
  rollup({ includeNodeModules: true, runnable: true }),
  rollup({
    input: 'src/api/api-types.ts',
    output: {
      sourcemap: true,
      file: 'dist/api-types.js',
      format: 'cjs'
    }
  })
]
