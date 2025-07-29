import { Parser } from 'acorn'
import { tsPlugin } from 'acorn-typescript'
import { walk } from 'estree-walker'
import { createPlugin, type PluginReturn } from 'ts-macro'
import { tryExpressionPlugin } from './acorn'

const plugin: PluginReturn<undefined, false> = createPlugin(() => {
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

      let changed = false
      walk(program as any, {
        enter(node: any) {
          if (node.type === 'TryExpression') {
            let expressionStart = node.expression.start

            const isAwait = node.expression.type === 'AwaitExpression'
            if (isAwait) {
              expressionStart = node.expression.argument.start
            }

            codes.replaceRange(
              node.start,
              expressionStart,
              `${isAwait ? 'await ' : ''}__t(() => (`,
            )
            codes.replaceRange(node.expression.end, node.end, '))')
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
