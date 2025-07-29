import {
  parse as tsEslintParse,
  type TSESTreeOptions,
} from '@typescript-eslint/typescript-estree'
import { buildTryOperator, replace } from './replace'

export function parse(src: string, options?: TSESTreeOptions): any {
  return replace(
    src,
    true,
    !!options?.jsx,
    'eslint-typescript',
    (src, isExpression) => {
      let ast = tsEslintParse(isExpression ? `(${src})` : src, options)

      // @ts-expect-error
      if (isExpression) ast = ast.body[0].expression

      return ast
    },
    buildTryOperator,
  )
}
