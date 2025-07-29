import { Parser } from 'acorn'
import jsx from 'acorn-jsx'
import { tsPlugin } from 'acorn-typescript'
import { walk } from 'estree-walker'
import { generateTransform, MagicStringAST } from 'magic-string-ast'
import { createUnplugin, type UnpluginInstance } from 'unplugin'
import { tryExpressionPlugin } from './acorn'

const unplugin: UnpluginInstance<{} | undefined, false> = createUnplugin(() => {
  return {
    name: 'tc39-try',
    enforce: 'pre',
    transform: {
      filter: {
        code: 'try ',
        id: {
          include: /\.[cm]?[jt]sx?$/,
          exclude: /node_modules/,
        },
      },
      handler(code, id) {
        let parser = Parser
        if (/[cm]?tsx?/.test(id)) {
          // @ts-expect-error
          parser = parser.extend(tsPlugin())
        } else if (id.endsWith('.jsx')) {
          parser = parser.extend(jsx())
        }
        parser = parser.extend(tryExpressionPlugin())

        const ast = parser.parse(code, {
          ecmaVersion: 'latest',
          sourceType: 'module',
        })

        const s = new MagicStringAST(code)
        walk(ast as any, {
          enter(node: any) {
            if (node.type === 'TryExpression') {
              let expressionStart = node.expression.start

              const isAwait = node.expression.type === 'AwaitExpression'
              if (isAwait) {
                expressionStart = node.expression.argument.start
              }

              s.overwrite(
                node.start,
                expressionStart,
                `${isAwait ? 'await ' : ''}__t(() => (`,
              )
              if (node.expression.end === node.end) {
                s.appendLeft(node.end, '))')
              } else {
                s.overwrite(node.expression.end, node.end, '))')
              }
            }
          },
        })

        if (s.hasChanged()) {
          s.prepend(`import { __t } from 'tc39-try';\n`)
        }

        return generateTransform(s, id)
      },
    },
  }
})

export default unplugin
