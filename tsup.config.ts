import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  sourcemap: true,
  clean: true,
  bundle: true,
  format: ['esm'],
  banner: {
    js: '// esbuild-plugin-i18next-loader',
  },
})