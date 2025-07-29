import { Parser } from 'acorn'
import { tsPlugin } from 'acorn-typescript'
import { walk } from 'estree-walker'
import { createPlugin, type PluginReturn } from 'ts-macro'
import { tryOperatorPlugin } from './acorn'

const plugin: PluginReturn<undefined, false> = createPlugin(() => {
  // @ts-expect-error
  const parser = Parser.extend(tsPlugin()).extend(tryOperatorPlugin())

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

      let changed = false
      walk(program as any, {
        enter(node: any) {
          if (node.type === 'UnaryExpression' && node.operator === 'try') {
            let argumentStart = node.argument.start

            const isAwait = node.argument.type === 'AwaitExpression'
            if (isAwait) {
              argumentStart = node.argument.argument.start
            }

            codes.replaceRange(
              node.start,
              argumentStart,
              `${isAwait ? 'await ' : ''}__t(() => (`,
            )
            codes.replaceRange(node.argument.end, node.end, '))')
            changed = true
          }
        },
      })

      if (changed) {
        codes.push(`import { __t } from 'tc39-try';\n`)
      }
    },
  }
})

export default plugin
