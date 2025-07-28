import {
  parse as babelParse,
  parseExpression,
  type ParseResult,
  type ParserOptions,
} from '@babel/parser'
import { replace } from './replace'
import type { File } from '@babel/types'

export function parse(
  src: string,
  filename: string = 'example.js',
  options?: ParserOptions,
): ParseResult<File> {
  return replace(
    src,
    filename,
    'babel',
    (src, isExpression, isTS, isJSX) => {
      const plugins = [
        ...(isTS ? (['typescript'] as const) : []),
        ...(isJSX ? (['jsx'] as const) : []),
      ]
      return (isExpression ? parseExpression : babelParse)(src, {
        sourceType: 'module',
        plugins,
        allowYieldOutsideFunction: true,
        ...options,
      })
    },
    (start, end, expression) => {
      return {
        type: 'TryExpression',
        expression,
        start,
        end,
      }
    },
  )
}
