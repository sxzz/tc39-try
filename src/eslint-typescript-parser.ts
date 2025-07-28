import {
  parseForESLint as _parseForESLint,
  type ParserOptions,
} from '@typescript-eslint/parser'
import { replace } from './replace'
import type { SourceFile } from 'typescript'

export {
  clearCaches,
  createProgram,
  meta,
  version,
  withoutProjectParserOptions,
  type ParserOptions,
  type ParserServices,
  type ParserServicesWithoutTypeInformation,
  type ParserServicesWithTypeInformation,
} from '@typescript-eslint/parser'

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
