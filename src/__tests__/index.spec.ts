import { test, expect } from 'vitest'
import path from 'node:path'
import i18nexPlugin from '../index'
import esbuild from 'esbuild'

test.each([
  { include: ['**/*.json'] },
  { include: ['**/*.yml', '**/*.yaml'] },
  { include: undefined },
])('no module resolution: %s', async ({ include }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nexPlugin({
        include: include,
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
      }),
    ],
  })

  expect(result).toMatchSnapshot()
})

test.each([
  { include: ['**/*.json'] },
  { include: ['**/*.yml', '**/*.yaml'] },
  { include: undefined },
])('basename: %s', async ({ include }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nexPlugin({
        include: include,
        namespaceResolution: 'basename',
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
      }),
    ],
  })

  expect(result).toMatchSnapshot()
})

test.each([
  { include: ['**/*.json'] },
  { include: ['**/*.yml', '**/*.yaml'] },
  { include: undefined },
])('relativePath: %s', async ({ include }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nexPlugin({
        include: include,
        namespaceResolution: 'relativePath',
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
      }),
    ],
  })

  expect(result).toMatchSnapshot()
})
