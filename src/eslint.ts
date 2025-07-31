import { untsx } from '.'
import type { Linter } from 'eslint'

const { eslint } = untsx
export const jsParser: Linter.Parser = eslint.jsParser
export const tsParser: Linter.Parser = eslint.tsParser
