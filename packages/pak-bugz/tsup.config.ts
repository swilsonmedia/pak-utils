import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    format: ["esm"],
    splitting: true,
    sourcemap: true,
    clean: true,
    dts: true,
    minify: !options.watch
  }
});