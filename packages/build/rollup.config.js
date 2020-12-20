import typescript from '@wessberg/rollup-plugin-ts'

export default () => ({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
      exclude: ['node_modules/**/*', '*/**/node_modules/**/*']
    })
  ].filter(Boolean)
})
