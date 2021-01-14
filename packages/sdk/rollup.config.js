import { rollup } from '@dataden/build'

export default [
  rollup({
    input: 'src/core/index.ts',
    includeNodeModules: false
  }),
  rollup({
    input: 'src/scripts/index.ts',
    output: {
      file: 'dist/scripts.js'
    },
    includeNodeModules: false
  })
]
