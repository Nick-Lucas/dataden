import { rollup } from '@dataden/build'

export default [
  rollup({ includeNodeModules: true, runnable: true }),
  rollup({
    input: 'src/api/api-types.ts',
    output: {
      file: 'dist/api-types.js'
    }
  })
]
