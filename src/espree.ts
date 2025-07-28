import { parse as _parse, type Options } from 'espree'
import { replace } from './replace'

export function parse(code: string, options?: Options): any {
  return replace(
    code,
    options?.ecmaFeatures?.jsx ? 'example.jsx' : 'example.js',
    'espree',
    (src, isExpression) => {
      const ast = _parse(isExpression ? `(${src})` : src, options)
      if (isExpression) {
        // @ts-expect-error
        return ast.body[0].expression
      }
      return ast
    },
  )
}
export * from 'espree'
