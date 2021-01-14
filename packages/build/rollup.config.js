import typescript from '@wessberg/rollup-plugin-ts'

/** @type {() => import('rollup').RollupOptions} */
export default () => ({
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
      exclude: ['node_modules/**/*', '*/**/node_modules/**/*']
    })
  ].filter(Boolean)
})
