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
  const isJSX = !!options?.ecmaFeatures?.jsx
  const ast = replace(
    src,
    true,
    isJSX,
    'eslint-typescript-parser',
    (src, isExpression) => {
      const ast = _parseForESLint(isExpression ? `(${src})` : src, options)

      if (isExpression) {
        // @ts-expect-error
        return ast.ast.body[0].expression
      }

      return ast
    },
    (start, end, argument) => ({
      type: 'UnaryExpression',
      operator: 'try',
      argument,
      prefix: true,
      start,
      end,
      range: [start, end],
    }),
  )

  return ast
}
