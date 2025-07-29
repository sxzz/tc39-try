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
  if (framework === 'eslint-typescript-parser') {
    return finalAST
  }

  walk(finalAST as any, {
    enter(node) {
      if (['File', 'Program', 'ExpressionStatement'].includes(node.type)) {
        return
      }

      const [start, end] = getRange(node)
      const valid = sources.find(
        ([, _start, _end]) => start === _start && end === _end,
      )
      if (!valid) return

      const newNode = build(start, end, processValid(valid))
      this.replace(newNode)
      this.skip()
    },
  })

  return finalAST

  function processValid(node: NodeInfo): any {
    const [, , , validStart, validEnd] = node

    const valid = sources.find(
      ([, start, end]) => start >= validStart && end <= validEnd,
    )
    if (valid) {
      const validNode = processValid(valid)
      const fullMatch = valid[1] === validStart && valid[2] === validEnd

      if (fullMatch) {
        return build(valid[1], valid[2], validNode)
      } else {
        throw new Error('Unsupported syntax')
      }
    } else {
      const ast = parse(node[0], true)

      ast.range = [validStart, validEnd]
      ast.start = validStart
      ast.end = validEnd

      return ast
    }
  }
}

export function buildTryOperator(
  start: number,
  end: number,
  argument: any,
): any {
  return {
    type: 'UnaryExpression',
    operator: 'try',
    argument,
    prefix: true,
    start,
    end,
    range: [start, end],
  }
}
