import fs from 'node:fs'
import path from 'node:path'
import merge from 'ts-deepmerge'
import { setProperty } from 'dot-prop'
import { globSync } from 'fast-glob'
import YAML from 'yaml'
import type { OnLoadResult, PartialMessage } from 'esbuild'
import { name as pluginName } from '../package.json'

export type IncludePattern = '**/*.json' | '**/*.yml' | '**/*.yaml'

export type Options = {
  /**
   * Glob pattern to include files for bundling. Defaults to `['**\/*.json', '**\/*.yml', '**\/*.yaml']`.
   */
  include?: IncludePattern[];

  /**
   * Namespace resolution strategy. Defaults to `'none'`.
   */
  namespaceResolution?: 'basename' | 'relativePath';

  /**
   * Locale top-level directory paths. Ordered from least to most specific.
   */
  paths: string[];
}

type ResourceBundle = { [key: string]: string | object }

const defaultIncludes: IncludePattern[] = [
  '**/*.json',
  '**/*.yml',
  '**/*.yaml',
]
const allowedExtensions = ['.json', '.yml', '.yaml']

const resolvePaths = (paths: string[], cwd: string): string[] =>
  paths.map((p) => (path.isAbsolute(p) ? p : path.resolve(cwd, p)))

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
    .map((g) => globSync(g, { cwd }))
    .reduce((acc, val) => acc.concat(val), [])
}

const enumerateLanguages = (directory: string): string[] =>
  fs
    .readdirSync(directory)
    .filter((f) => fs.statSync(path.join(directory, f)).isDirectory())

export const loadContent = (options: Options): OnLoadResult => {
  const directories = resolvePaths(options.paths, process.cwd())
  const warnings = assertExistence(directories)
  const errors: PartialMessage[] = []
  const uniqueIncludes = Array.from(
    new Set(options.include ?? defaultIncludes)
  )
  const watchedFiles: string[] = []

  if (options.paths.length === 0) {
    warnings.push({
      pluginName,
      text: 'Empty paths passed in the plugin options',
    })
  }

  if (uniqueIncludes.length === 0) {
    warnings.push({
      pluginName,
      text: 'Empty includes passed in the plugin options',
    })
  }

  let allLanguages: Set<string> = new Set()
  let appResourceBundle: ResourceBundle = {}

  for (const directory of directories) {
    const languages = enumerateLanguages(directory)

    allLanguages = new Set([...allLanguages, ...languages])

    for (const language of languages) {
      const resourceBundle: ResourceBundle = {}
      resourceBundle[language] = {}

      const languageDirectory = path.join(directory, language)
      const files = findAllFiles(uniqueIncludes, languageDirectory)

      for (const file of files) {
        const fullPath = path.resolve(directory, language, file)
        const extension = path.extname(file)

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

        if (!allowedExtensions.includes(extension)) {
          warnings.push({
            pluginName,
            text: 'File extension not supported',
            location: {
              file: fullPath,
            },
          })

          continue
        }

        const fileContent = fs.readFileSync(fullPath, 'utf8')

        try {
          const content =
            extension === '.json'
              ? JSON.parse(String(fileContent))
              : YAML.parse(String(fileContent))

          watchedFiles.push(fullPath)

          if (options.namespaceResolution) {
            let namespaceFilePath = file

            if (options.namespaceResolution === 'basename') {
              namespaceFilePath = path.basename(file)
            } else if (options.namespaceResolution === 'relativePath') {
              namespaceFilePath = path.relative(
                path.join(directory, language),
                file
              )
            }

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
        } catch (exception) {
          errors.push({
            pluginName,
            text: (exception as Error).message,
            location: {
              file: fullPath,
            },
            detail: exception,
          })
        }
      }
    }
  }

  return {
    contents: `export default ${JSON.stringify(appResourceBundle)}`,
    warnings: warnings,
    errors: errors,
    watchFiles: watchedFiles,
  }
}
