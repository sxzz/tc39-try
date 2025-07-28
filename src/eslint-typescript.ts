import { parse as tsEslintParse } from '@typescript-eslint/typescript-estree'
import { replace } from './replace'

export function parse(src: string, filename: string): any {
  return replace(src, filename, 'eslint-typescript', (
    src,
    isExpression,
    isTS,
    isJSX,
  ) => {
    let ast = tsEslintParse(isExpression ? `(${src})` : src, {
      sourceType: 'module',
      loc: true,
      range: true,
      comment: true,
      tokens: false,
      loggerFn: false,
      project: false,
      jsDocParsingMode: 'none',
      suppressDeprecatedPropertyWarnings: true,
      filePath: filename,
      jsx: isJSX,
    })

    // @ts-expect-error
    if (isExpression) ast = ast.body[0].expression

    return ast
  })
}
