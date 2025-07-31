import { generateTransform, MagicStringAST } from 'magic-string-ast'
import { createUnplugin, type UnpluginInstance } from 'unplugin'
import { untsx } from '.'
import type { Codes } from 'ts-macro'

export const FN_NAME = '__v_try'
const HELPER_IMPORT = `import { t as ${FN_NAME} } from 'tc39-try/runtime';\n`

export function transformTryOperator(
  code: string,
  id: string,
  s: MagicStringAST | Codes,
): boolean {
  const changed = untsx.transform(code, id, s)
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
