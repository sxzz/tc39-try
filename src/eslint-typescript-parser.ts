import {
  parseForESLint as _parseForESLint,
  type ParserOptions,
} from '@typescript-eslint/parser'
import { version } from '../package.json'
import { replace } from './replace'
import type { SourceFile } from 'typescript'
export {
  clearCaches,
  createProgram,
  withoutProjectParserOptions,
  type ParserServices,
  type ParserServicesWithoutTypeInformation,
  type ParserServicesWithTypeInformation,
} from '@typescript-eslint/typescript-estree'

export function parseForESLint(
  code: string | SourceFile,
  options?: ParserOptions,
): any {
  const src = typeof code === 'string' ? code : code.text
  const ast = replace(
    src,
    options?.filePath || 'example.js',
    'eslint-typescript-parser',
    (src, isExpression) => {
      const ast = _parseForESLint(isExpression ? `(${src})` : src, {
        ...options,
      })

      if (isExpression) {
        // @ts-expect-error
        return ast.ast.body[0].expression
      }

      return ast
    },
  )

  return ast
}

export const meta: { name: string; version: string } = {
  name: 'typescript-eslint/parser',
  version,
}

export { version, type ParserOptions }
