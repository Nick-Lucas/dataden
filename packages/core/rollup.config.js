import typescript from '@rollup/plugin-typescript';
import run from '@rollup/plugin-run';

const dev = process.env.ROLLUP_WATCH === 'true'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [
    typescript(),
    dev && run()
  ].filter(Boolean),
};
