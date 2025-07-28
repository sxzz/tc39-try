import {
  parse as tsEslintParse,
  type TSESTreeOptions,
} from '@typescript-eslint/typescript-estree'
import { replace } from './replace'

export function parse(
  src: string,
  filename: string,
  options?: TSESTreeOptions,
): any {
  return replace(src, filename, 'eslint-typescript', (
    src,
    isExpression,
    isTS,
    isJSX,
  ) => {
    let ast = tsEslintParse(isExpression ? `(${src})` : src, {
      jsx: isJSX,
      ...options,
    })

    // @ts-expect-error
    if (isExpression) ast = ast.body[0].expression

    return ast
  })
}
