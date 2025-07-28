import { GLOB_JS, GLOB_TS, sxzz } from '@sxzz/eslint-config'
import * as tsParser from './dist/eslint-typescript-parser.js'
import * as jsParser from './dist/espree.js'

export default sxzz().append(
  {
    files: [GLOB_TS],
    languageOptions: { parser: tsParser },
  },
  {
    files: [GLOB_JS],
    languageOptions: { parser: jsParser },
  },
  {
    rules: {
      'import/no-default-export': 'off',
    },
  },
)
