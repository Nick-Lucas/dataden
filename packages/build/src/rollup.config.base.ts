import { RollupOptions, OutputOptions, Plugin } from 'rollup'
import typescript from '@wessberg/rollup-plugin-ts'
import commonjs from '@rollup/plugin-commonjs'
import run from '@rollup/plugin-run'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import path from 'path'

const useRun = process.env.ROLLUP_RUN === 'true'
const isProduction = process.env.NODE_ENV === 'production'

interface CustomOutputOptions {
  file: string
  overrides: OutputOptions
}

interface BuildOptions {
  input?: string
  output?: CustomOutputOptions
  bundle?: 'code' | 'code+workspace' | 'code+node_modules'
  runnable?: boolean
  extraWatches?: RegExp[]
}

const addExtraWatches = (tests: RegExp[]): Plugin => ({
  name: 'additional-watches',
  buildStart() {
    const packageJson = require(path.resolve('package.json'))

    const matchingDepNames = [
      ...Object.keys(packageJson.dependencies),
      ...Object.keys(packageJson.devDependencies)
    ].filter((dep) => tests.some((test) => test.test(dep)))

    for (const depName of matchingDepNames) {
      const depFileName = path.dirname(require.resolve(depName))
      this.addWatchFile(depFileName)
    }
  }
})

export default ({
  input = 'src/index.ts',
  output = {
    file: 'dist/index.js',
    overrides: {}
  },
  bundle = 'code',
  runnable = false,
  extraWatches = [/@dataden\//]
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
        file: getBuildFileName(output.file, 'esm'),
        format: 'esm',
        sourcemap: true,
        ...output.overrides
      },
      {
        file: getBuildFileName(output.file, 'cjs'),
        format: 'cjs',
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
      // When developing we want consumers like core to rebuild whenever their dependencies are rebuilt
      !isProduction && addExtraWatches(extraWatches),

      replace({
        values: {
          'process.env.NODE_ENV': isProduction
            ? '"production"'
            : '"development"'
        }
      }),

      typescript({
        tsconfig: 'tsconfig.json',
        exclude: ['**/node_modules/**/*.*', 'node_modules/**/*.*']
      }),

      // Build a fat bundle of all JS code
      isProduction &&
        bundle === 'code+node_modules' &&
        resolve({
          preferBuiltins: true
        }),
      isProduction &&
        bundle === 'code+node_modules' &&
        commonjs({
          include: /node_modules/
        }),

      // Bundle only @dataden dependencies
      // TODO: this isn't working great, is including certain node_modules deps from commonjs, but errors without
      isProduction &&
        bundle === 'code+workspace' &&
        resolve({
          preferBuiltins: true,
          resolveOnly: [/\@dataden/]
        }),

      commonjs({
        include: /node_modules/
      }),

      json(),

      runnable && useRun && run({})
    ].filter(Boolean)
  }
}
