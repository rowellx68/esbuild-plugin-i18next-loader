import fs from 'node:fs'
import path from 'node:path'
import merge from 'ts-deepmerge'
import { setProperty } from 'dot-prop'
import { globSync } from 'glob'
import type { OnLoadResult, PartialMessage } from 'esbuild'
import { name as pluginName } from '../package.json'

export type Options = {
  /**
   * Glob pattern to include files for bundling. Defaults to `['**\/*.json']`.
   */
  include?: string[]

  /**
   * Namespace resolution strategy. Defaults to `'none'`.
   */
  namespaceResolution?: 'basename' | 'relativePath'

  /**
   * Locale top-level directory paths. Ordered from least to most specific.
   */
  paths: string[]
}

type ResourceBundle = { [key: string]: string | object }

const resolvePaths = (paths: string[], cwd: string): string[] => paths
  .map((p) => 
    path.isAbsolute(p) 
      ? p 
      : path.resolve(cwd, p)
  )

const assertExistence = (paths: string[]): PartialMessage[] => {
  const messages: PartialMessage[] = []

  paths.forEach((p) => {
    if (!fs.existsSync(p)) {
      messages.push({
        pluginName,
        text: 'Path does not exist',
        location: {
          file: p,
        },
      })
    }
  })

  return messages
}

const findAllFiles = (globs: string | string[], cwd: string): string[] => {
  const globArray = Array.isArray(globs) ? globs : [globs]

  return globArray
    .map((g) => globSync(g, { cwd, realpath: true }))
    .reduce((acc, val) => acc.concat(val), [])
}

const enumerateLanguages = (directory: string): string[] => fs
  .readdirSync(directory)
  .filter((f) => fs.statSync(path.join(directory, f)).isDirectory())

export const loadContent = (options: Options): OnLoadResult => {
  const directories = resolvePaths(options.paths, process.cwd())
  const warnings = assertExistence(directories)

  let allLanguages: Set<string> = new Set()
  let appResourceBundle: ResourceBundle = {}

  for (const directory of directories) {
    const languages = enumerateLanguages(directory)

    allLanguages = new Set([...allLanguages, ...languages])

    for (const language of languages) {
      const resourceBundle: ResourceBundle = {}
      resourceBundle[language] = {}

      const languageDirectory = path.join(directory, language)
      const files = findAllFiles(options.include ?? ['**/*.json'], languageDirectory)

      for (const file of files) {
        const fullPath = path.resolve(__dirname, directory, language, file)

        if (!fs.existsSync(fullPath)) {
          warnings.push({
            pluginName,
            text: 'File does not exist',
            location: {
              file: fullPath,
            },
          })

          continue
        }

        const content = JSON.parse(String(fs.readFileSync(fullPath, 'utf-8')))

        if (options.namespaceResolution) {
          let namespaceFilePath = file

            if (options.namespaceResolution === 'basename') {
              namespaceFilePath = path.basename(file)
            } else if (options.namespaceResolution === 'relativePath') {
              namespaceFilePath = path.relative(path.join(directory, language), file)
            }

            const extension = path.extname(file)
            const nsparts = namespaceFilePath
              .replace(extension, '')
              .split(path.sep)
              .filter((part) => part !== '' && part !== '..')

            const namespace = [language].concat(nsparts).join('.')

            setProperty(resourceBundle, namespace, content)
        } else {
          resourceBundle[language] = content
        }

        appResourceBundle = merge(appResourceBundle, resourceBundle)
      }
    }
  }

  return {
    contents: `export default ${JSON.stringify(appResourceBundle)}`,
    warnings: warnings,
  }
}
