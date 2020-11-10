import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import run from '@rollup/plugin-run';

const dev = process.env.ROLLUP_WATCH === 'true'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    typescript(),
    commonjs(),
    dev && run()
  ].filter(Boolean),
};
