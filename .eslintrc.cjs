const { resolve } = require('node:path')

const project = resolve(process.cwd(), 'tsconfig.json')

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['eslint:recommended'],
  plugins: ['@stylistic'],
  parser: '@typescript-eslint/parser',
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  globals: {
    __dirname: true,
    __filename: true,
    process: true,
  },
  ignorePatterns: [
    // Ignore dotfiles
    '.*.js',
    '.eslintrc.cjs',
    'node_modules/',
    'dist/',
  ],
  parserOptions: {
    project: true,
  },
  overrides: [
    {
      files: ['*.js?(x)', '*.ts?(x)'],
    },
  ],
  rules: {
    '@stylistic/semi': ['error', 'never'],
    '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
    '@stylistic/comma-dangle': ['error', 'always-multiline'],
    '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
    '@stylistic/newline-per-chained-call': [
      'error',
      { ignoreChainWithDepth: 2 },
    ],
  },
}