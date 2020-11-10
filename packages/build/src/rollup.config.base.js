const typescript = require('@wessberg/rollup-plugin-ts')
const commonjs = require('@rollup/plugin-commonjs')
const run = require('@rollup/plugin-run')

const dev = process.env.ROLLUP_WATCH === 'true'

/**
 * @type {() => import("rollup").RollupOptions}
 */
module.exports = () => ({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json'
    }),
    commonjs(),
    dev && run()
  ].filter(Boolean)
})
