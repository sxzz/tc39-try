import { Parser } from 'acorn'
import { tsPlugin } from 'acorn-typescript'
import { walk } from 'estree-walker'
import { createPlugin, type PluginReturn } from 'ts-macro'
import { tryExpressionPlugin } from './acorn'

const plugin: PluginReturn<never, false> = createPlugin(() => {
  // @ts-expect-error
  const parser = Parser.extend(tsPlugin()).extend(tryExpressionPlugin())

  return {
    name: 'tc39-try',
    resolveVirtualCode({ codes, ast }) {
      if (!ast.text.includes('try ')) return

      const program = parser.parse(ast.text, {
        ecmaVersion: 'latest',
        sourceType: 'module',
        allowAwaitOutsideFunction: true,
        allowHashBang: true,
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        allowSuperOutsideMethod: true,
      })

      let index = 0
      walk(program as any, {
        leave(node: any) {
          if (node.type === 'TryExpression') {
            codes.replaceRange(
              node.start,
              node.expression.start,
              `({}) as ([true, never, typeof _tmp${index}] | [false, unknown, unknown])\n, _tmp${index++} = `,
            )
            codes.replaceRange(node.expression.end, node.end, '')
          }
        },
      })
    },
  }
})

export default plugin
