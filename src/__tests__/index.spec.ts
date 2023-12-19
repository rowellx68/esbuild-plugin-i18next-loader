/* eslint-disable no-undef */
import { test, expect } from 'vitest'
import path from 'node:path'
import esbuild from 'esbuild'
import { i18nextPlugin } from '../index'
import { type IncludePattern } from '../utilities'

test.each([
  { include: ['**/*.json'] as IncludePattern[] as IncludePattern[] },
  { include: ['**/*.yml', '**/*.yaml'] as IncludePattern[] as IncludePattern[] },
  { include: undefined },
])('no module resolution: %s', async ({ include }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nextPlugin({
        include: include,
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
      }),
    ],
  })

  expect(result).toMatchSnapshot()
})

test.each([
  { include: ['**/*.json'] as IncludePattern[] },
  { include: ['**/*.yml', '**/*.yaml'] as IncludePattern[] },
  { include: undefined },
])('basename: %s', async ({ include }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nextPlugin({
        include: include,
        namespaceResolution: 'basename',
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
      }),
    ],
  })

  expect(result).toMatchSnapshot()
})

test.each([
  { include: ['**/*.json'] as IncludePattern[] },
  { include: ['**/*.yml', '**/*.yaml'] as IncludePattern[] },
  { include: undefined },
])('relativePath: %s', async ({ include }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nextPlugin({
        include: include,
        namespaceResolution: 'relativePath',
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
      }),
    ],
  })

  expect(result).toMatchSnapshot()
})

test.each([
  { include: ['**/*.json'] as IncludePattern[] },
  { include: ['**/*.yml', '**/*.yaml'] as IncludePattern[] },
  { include: undefined },
])('empty paths: %s', async ({ include }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nextPlugin({
        include: include,
        namespaceResolution: 'relativePath',
        paths: [],
      }),
    ],
  })

  expect(result).toMatchSnapshot()
})

test('empty includes', async () => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nextPlugin({
        include: [],
        namespaceResolution: 'relativePath',
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
      }),
    ],
  })

  expect(result).toMatchSnapshot()
})
