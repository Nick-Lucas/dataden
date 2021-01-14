import { RollupOptions, OutputOptions } from 'rollup'
import typescript from '@wessberg/rollup-plugin-ts'
import commonjs from '@rollup/plugin-commonjs'
import run from '@rollup/plugin-run'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

const useRun = process.env.ROLLUP_RUN === 'true'

interface CustomOutputOptions {
  file: string
  overrides: OutputOptions
}

interface BuildOptions {
  input?: string
  output?: CustomOutputOptions
  includeNodeModules?: boolean
  runnable?: boolean
}

export default ({
  input = 'src/index.ts',
  output = {
    file: 'dist/index.js',
    overrides: {}
  },
  includeNodeModules = false,
  runnable = false
}: BuildOptions = {}): RollupOptions => {
  output.file = output.file ?? 'dist/index.js'
  output.overrides = output.overrides ?? {}

  const getBuildFileName = (outputFile: string, type: 'esm' | 'cjs') => {
    const parts = outputFile.split('.')
    if (parts[parts.length - 1] !== 'js') {
      throw 'Output file must end in .js'
    }

    parts.splice(parts.length - 1, 0, type)

    return parts.join('.')
  }

  return {
    input: input,
    output: [
      {
        file: getBuildFileName(output.file, 'cjs'),
        format: 'cjs',
        sourcemap: true,
        ...output.overrides
      },
      {
        file: getBuildFileName(output.file, 'esm'),
        format: 'esm',
        sourcemap: true,
        ...output.overrides
      }
    ],

    // Important when using a `yarn link` version of the package, like in workspaces,
    //  otherwise symlinks get normalised away and typescript tries to build workspace packages
    preserveSymlinks: true,

    // Hide warnings from node_modules files as there's really nothing we can do about these
    onwarn: (warning, defaultHandler) => {
      if (
        /node_modules/.test(warning.id) ||
        /node_modules/.test(warning.importer)
      ) {
        return
      }
      defaultHandler(warning)
    },

    plugins: [
      typescript({
        tsconfig: 'tsconfig.json',
        exclude: ['**/node_modules/**', 'node_modules/*']
      }),
      includeNodeModules &&
        resolve({
          preferBuiltins: true
        }),
      includeNodeModules &&
        commonjs({
          include: /node_modules/
        }),
      json(),
      runnable && useRun && run()
    ].filter(Boolean)
  }
}
