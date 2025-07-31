import { createUntsx, type UntsxInstance } from 'untsx'
import { tryOperatorPlugin } from './acorn'
import { FN_NAME } from './unplugin'
import type { MagicStringAST } from 'magic-string-ast'
import type { AstPath, Doc, ParserOptions } from 'prettier'
import type { Codes } from 'ts-macro'

export const untsx: UntsxInstance = createUntsx({
  baseParser: {
    name: 'acorn',
    customParser: (parser) => {
      return parser.extend(tryOperatorPlugin())
    },
  },

  isTarget(node: any): boolean {
    return node.type === 'UnaryExpression' && node.operator === 'try'
  },

  build(parserName: string, start: number, end: number, argument: any) {
    return {
      type: 'UnaryExpression',
      operator: 'try',
      argument,
      prefix: true,
      start,
      end,
      range: [start, end],
    }
  },

  shouldTransform: (code) => /\btry\b/.test(code),
  transform(
    code: string,
    id: string,
    s: MagicStringAST | Codes,
    node: any,
  ): boolean {
    let argumentStart = node.argument.start

    const isAwait = node.argument.type === 'AwaitExpression'
    if (isAwait) {
      argumentStart = node.argument.argument.start
    }

    s.replaceRange(
      node.start,
      argumentStart,
      `${isAwait ? 'await ' : ''}${FN_NAME}(() => (`,
    )
    s.replaceRange(node.argument.end, node.end, '))')

    return true
  },

  format(
    path: AstPath<any>,
    options: ParserOptions<any>,
    print: (path: AstPath<any>) => Doc,
  ): Doc {
    const needsRootParens = path.parent.type === 'MemberExpression'
    const needParens = ['UnaryExpression', 'ObjectExpression'].includes(
      path.node.argument.type,
    )
    return [
      needsRootParens ? '(' : '',
      'try ',
      needParens ? '(' : '',
      path.call(print, 'argument'),
      needParens ? ')' : '',
      needsRootParens ? ')' : '',
    ]
  },
})
