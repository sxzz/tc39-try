import { createPlugin, type PluginReturn } from 'ts-macro'
import { transformTryOperator } from './unplugin'

const plugin: PluginReturn<undefined, false> = createPlugin(() => {
  return {
    name: 'tc39-try',
    resolveVirtualCode({ codes, ast, filePath }) {
      if (!/\btry\b/.test(ast.text)) return
      transformTryOperator(ast.text, filePath, codes)
    },
  }
})

export default plugin
