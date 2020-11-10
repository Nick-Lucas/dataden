import typescript from '@wessberg/rollup-plugin-ts'
import commonjs from '@rollup/plugin-commonjs'
import run from '@rollup/plugin-run'

const useRun = process.env.ROLLUP_RUN === 'true'

/**
 * @type {() => import("rollup").RollupOptions}
 */
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
    }),
    commonjs(),
    useRun && run()
  ].filter(Boolean)
})
