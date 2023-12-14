import { test, expect } from 'vitest'
import path from 'node:path'
import i18nexPlugin from '../index'
import esbuild from 'esbuild'

test('no module resolution', async () => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nexPlugin({
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
      }),
    ],
  })

  expect(result).toMatchSnapshot()
})

test('basename', async () => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nexPlugin({
        namespaceResolution: 'basename',
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
      }),
    ],
  })

  expect(result).toMatchSnapshot()
})

test('relativePath', async () => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nexPlugin({
        namespaceResolution: 'relativePath',
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
      }),
    ],
  })

  expect(result).toMatchSnapshot()
})