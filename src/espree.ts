import { parse as _parse, type Options } from 'espree'
import { buildTryOperator, replace } from './replace'

export function parse(code: string, options?: Options): any {
  return replace(
    code,
    false,
    !!options?.ecmaFeatures?.jsx,
    'espree',
    (src, isExpression) => {
      const ast = _parse(isExpression ? `(${src})` : src, options)
      if (isExpression) {
        // @ts-expect-error
        return ast.body[0].expression
      }
      return ast
    },
    buildTryOperator,
  )
}
export * from 'espree'
