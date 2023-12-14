import type { Plugin } from 'esbuild'
import { name as pluginName } from '../package.json'
import { type Options, loadContent } from './utilities'
import './types'

export default (options: Options): Plugin => {
  return {
    name: pluginName,
    setup(build) {
      build.onResolve({ filter: /^virtual:i18next-loader$/ }, () => {
        return { path: 'localizations', namespace: 'i18next' }
      })

      build.onLoad({ filter: /^localizations$/, namespace: 'i18next' }, () => {
        const result = loadContent(options)
        return {
          ...result,
          loader: 'js',
        }
      })
    },
  }
}
