import { RollupOptions, OutputOptions } from 'rollup'
import typescript from '@wessberg/rollup-plugin-ts'
import commonjs from '@rollup/plugin-commonjs'
import run from '@rollup/plugin-run'

const useRun = process.env.ROLLUP_RUN === 'true'

interface BuildOptions {
  input?: string
  output?: OutputOptions | OutputOptions[]
  includeNodeModules?: boolean
  runnable?: boolean
}

export default ({
  input = 'src/index.ts',
  output = {
    dir: 'dist',
    format: 'cjs',
    sourcemap: true
  },
  includeNodeModules = false,
  runnable = false
}: BuildOptions = {}): RollupOptions => ({
  input: input,
  output: output,
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
      exclude: ['node_modules/**/*', '*/**/node_modules/**/*']
    }),
    includeNodeModules && commonjs(),
    runnable && useRun && run()
  ].filter(Boolean)
})
