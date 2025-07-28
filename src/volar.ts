import { createPlugin, type PluginReturn } from 'ts-macro'

const plugin: PluginReturn<never, false> = createPlugin(({ ts }) => {
  return {
    name: 'tc39-try',
    resolveVirtualCode({ codes, ast }) {
      let index = 0
      ast.forEachChild(function walk(node) {
        if (ts.isTryStatement(node) && node.getText(ast) === 'try') {
          codes.replaceRange(
            node.getStart(ast),
            node.end,
            `({}) as ([true, never, typeof _tmp${index}] | [false, unknown, unknown])\n, _tmp${index++} = `,
          )
        }
        node.forEachChild(walk)
      })
    },
  }
})

// eslint-disable-next-line import/no-default-export
export default plugin
