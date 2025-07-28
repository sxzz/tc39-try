import { Parser } from 'acorn'
import jsx from 'acorn-jsx'
import { tsPlugin } from 'acorn-typescript'
import { walk } from 'estree-walker'
import { tryExpressionPlugin } from './acorn'

type NodeInfo = [
  code: string,
  start: number,
  end: number,
  start: number,
  end: number,
]

type ParseFn = (
  src: string,
  isExpression: boolean,
  isTS: boolean,
  isJSX: boolean,
) => any

type BuildFn = (start: number, end: number, expression: any) => any

export function replace(
  source: string,
  filename: string,
  framework: string,
  parse: ParseFn,
  build: BuildFn,
): any {
  const isTS =
    filename.endsWith('.ts') ||
    filename.endsWith('.tsx') ||
    filename.endsWith('.mts') ||
    filename.endsWith('.cts')
  const isJSX = filename.endsWith('.jsx') || filename.endsWith('.tsx')

  let parser = Parser
  if (isTS) {
    // @ts-expect-error
    parser = parser.extend(tsPlugin())
  }
  if (isJSX) {
    parser = parser.extend(jsx())
  }
  parser = parser.extend(tryExpressionPlugin())

  const ast = parser.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  })

  let replacedSource = source
  const sources: NodeInfo[] = []
  ;(walk as any)(ast, {
    enter(node: any) {
      if (node.type === 'TryExpression') {
        if (framework === 'eslint-typescript-parser') {
          replacedSource =
            replacedSource.slice(0, node.start) +
            ' '.repeat(node.expression.start - node.start) +
            replacedSource.slice(node.expression.start)

          return
        }

        const valid = source.slice(node.expression.start, node.expression.end)
        sources.push([
          valid,
          node.start,
          node.end,
          node.expression.start,
          node.expression.end,
        ])

        const originalLength = node.end - node.start
        const placeholder = 'x'.repeat(originalLength)

        if (node.end - node.start < placeholder.length) {
          throw new Error(
            `The replacement string is longer than the original expression in ${filename}`,
          )
        }

        replacedSource = `${replacedSource.slice(0, node.start)}${placeholder}${replacedSource.slice(node.end)}`
      }
    },
  })

  const finalAST = parse(replacedSource, false, isTS, isJSX)
  ;(walk as any)(finalAST, {
    enter(node: any) {
      const found = sources.find(
        ([, start, end]) => node.start === start && node.end === end,
      )
      if (!found) return

      const newNode = build(
        node.start,
        node.end,
        processExpression(sources, found),
      )
      this.replace(newNode)
      this.skip()
    },
  })

  return finalAST

  function processExpression(sources: NodeInfo[], node: NodeInfo): any {
    const expressionStart = node[3]
    const expressionEnd = node[4]

    const expression = sources.find(
      ([, start, end]) => start >= expressionStart && end <= expressionEnd,
    )
    if (expression) {
      const exprNode = processExpression(sources, expression)
      const fullMatch =
        expression[1] === expressionStart && expression[2] === expressionEnd

      if (fullMatch) {
        return build(expression[1], expression[2], exprNode)
      } else {
        throw new Error('Not supported expression structure')
      }
    } else {
      const ast = parse(node[0], true, isTS, isJSX)

      ast.range = [node[1], node[2]]
      ast.start = node[1]
      ast.end = node[2]

      return ast
    }
  }
}
