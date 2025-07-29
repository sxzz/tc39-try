import { Parser } from 'acorn'
import jsx from 'acorn-jsx'
import { tsPlugin } from 'acorn-typescript'
import { walk } from 'estree-walker'
import { tryOperatorPlugin } from './acorn'

type NodeInfo = [
  code: string,
  start: number,
  end: number,
  start: number,
  end: number,
]

type ParseFn = (src: string, isExpression: boolean) => any

type BuildFn = (start: number, end: number, argument: any) => any

function getRange(node: any) {
  return node.range || [node.start, node.end]
}

export function replace(
  source: string,
  isTS: boolean,
  isJSX: boolean,
  framework: string,
  parse: ParseFn,
  build: BuildFn,
): any {
  let parser = Parser
  if (isTS) {
    // @ts-expect-error
    parser = parser.extend(tsPlugin())
  } else if (isJSX) {
    parser = parser.extend(jsx())
  }
  parser = parser.extend(tryOperatorPlugin())

  const ast = parser.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  })

  let replacedSource = source
  const sources: NodeInfo[] = []

  walk(ast as any, {
    enter(node: any) {
      if (node.type === 'UnaryExpression' && node.operator === 'try') {
        if (framework === 'eslint-typescript-parser') {
          replacedSource =
            replacedSource.slice(0, node.start) +
            ' '.repeat(node.argument.start - node.start) +
            replacedSource.slice(node.argument.start, node.argument.end) +
            ' '.repeat(node.end - node.argument.end) +
            replacedSource.slice(node.end)
          return
        }

        const valid = source.slice(node.argument.start, node.argument.end)
        sources.push([
          valid,
          node.start,
          node.end,
          node.argument.start,
          node.argument.end,
        ])

        const originalLength = node.end - node.start
        const placeholder = 'x'.repeat(originalLength)

        replacedSource = `${replacedSource.slice(0, node.start)}${placeholder}${replacedSource.slice(node.end)}`
      }
    },
  })

  const finalAST = parse(replacedSource, false)
  walk(finalAST as any, {
    enter(node) {
      if (['File', 'Program', 'ExpressionStatement'].includes(node.type)) {
        return
      }
      const [start, end] = getRange(node)
      const found = sources.find(
        ([, _start, _end]) => start === _start && end === _end,
      )

      if (!found) return

      const newNode = build(start, end, processArgument(sources, found))
      this.replace(newNode)
      this.skip()
    },
  })

  return finalAST

  function processArgument(sources: NodeInfo[], node: NodeInfo): any {
    const [, , , argumentStart, argumentEnd] = node

    const argument = sources.find(
      ([, start, end]) => start >= argumentStart && end <= argumentEnd,
    )
    if (argument) {
      const exprNode = processArgument(sources, argument)
      const fullMatch =
        argument[1] === argumentStart && argument[2] === argumentEnd

      if (fullMatch) {
        return build(argument[1], argument[2], exprNode)
      } else {
        throw new Error('Not supported syntax')
      }
    } else {
      const ast = parse(node[0], true)

      ast.range = [argumentStart, argumentEnd]
      ast.start = argumentStart
      ast.end = argumentEnd

      return ast
    }
  }
}
