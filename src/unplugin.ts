import { Parser } from 'acorn'
import jsx from 'acorn-jsx'
import { tsPlugin } from 'acorn-typescript'
import { walk } from 'estree-walker'
import { generateTransform, MagicStringAST } from 'magic-string-ast'
import { createUnplugin, type UnpluginInstance } from 'unplugin'
import { tryOperatorPlugin } from './acorn'
import type { Codes } from 'ts-macro'

const FN_NAME = '__v_try'
const HELPER_IMPORT = `import { t as ${FN_NAME} } from 'tc39-try';\n`

export function transformTryOperator(
  code: string,
  id: string,
  s: MagicStringAST | Codes,
): boolean {
  let parser = Parser
  if (/[cm]?tsx?/.test(id)) {
    // @ts-expect-error
    parser = parser.extend(tsPlugin())
  } else if (id.endsWith('.jsx')) {
    parser = parser.extend(jsx())
  }
  parser = parser.extend(tryOperatorPlugin())

  const ast = parser.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  })

  let changed = false
  walk(ast as any, {
    enter(node: any) {
      if (node.type === 'UnaryExpression' && node.operator === 'try') {
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
        changed = true
      }
    },
  })

  if (changed) {
    s.replaceRange(0, 0, HELPER_IMPORT)
  }

  return changed
}

const unplugin: UnpluginInstance<{} | undefined, false> = createUnplugin(() => {
  return {
    name: 'tc39-try',
    enforce: 'pre',
    transform: {
      filter: {
        code: /\btry\b/,
        id: {
          include: /\.[cm]?[jt]sx?$/,
          exclude: /node_modules/,
        },
      },
      handler(code, id) {
        const s = new MagicStringAST(code)
        transformTryOperator(code, id, s)
        return generateTransform(s, id)
      },
    },
  }
})

export default unplugin
