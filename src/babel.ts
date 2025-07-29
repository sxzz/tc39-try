import {
  parse as babelParse,
  parseExpression,
  type ParseResult,
  type ParserOptions,
} from '@babel/parser'
import { replace } from './replace'
import type { File } from '@babel/types'

export function parse(src: string, options?: ParserOptions): ParseResult<File> {
  const isTS = !!options?.plugins?.some(
    (plugin) => plugin === 'typescript' || plugin[0] === 'typescript',
  )
  const isJSX = !!options?.plugins?.some(
    (plugin) => plugin === 'jsx' || plugin[0] === 'jsx',
  )

  return replace(
    src,
    isTS,
    isJSX,
    'babel',
    (src, isExpression) => {
      return (isExpression ? parseExpression : babelParse)(src, {
        allowYieldOutsideFunction: true,
        allowAwaitOutsideFunction: true,
        ...options,
      })
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
}
