import { rollup } from '@dataden/build'

export default [
  rollup({
    input: 'src/core/index.ts',
    bundle: 'code+workspace'
  }),
  rollup({
    input: 'src/scripts/index.ts',
    bundle: 'code+workspace',
    output: {
      file: 'dist/scripts.js'
    }
  })
]
