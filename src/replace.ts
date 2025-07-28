import { Parser } from 'acorn'
import jsx from 'acorn-jsx'
import { tsPlugin } from 'acorn-typescript'
import { walk } from 'estree-walker'
import { tryExpressionPlugin } from './acorn'

export function replace(
  source: string,
  filename: string,
  framework: string,
  parse: (
    src: string,
    isExpression: boolean,
    isTS: boolean,
    isJSX: boolean,
  ) => any,
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
  const PREFIX = '_try_'
  const sources: string[] = []
  ;(walk as any)(ast, {
    leave(node: any) {
      if (node.type === 'TryExpression') {
        if (framework === 'eslint-typescript-parser') {
          replacedSource =
            replacedSource.slice(0, node.start) +
            ' '.repeat(node.expression.start - node.start) +
            replacedSource.slice(node.expression.start)
        } else {
          sources.push(source.slice(node.expression.start, node.expression.end))
          const replace = `${PREFIX}${sources.length - 1}`
          if (node.end - node.start < replace.length) {
            throw new Error(
              `The replacement string "${replace}" is longer than the original expression at ${node.start}-${node.end} in ${filename}`,
            )
          }

          replacedSource = `${replacedSource.slice(0, node.start)}${replace}${' '.repeat(
            node.end - node.start - replace.length,
          )}${replacedSource.slice(node.end)}`
        }
      }
    },
  })

  const finalAST = parse(replacedSource, false, isTS, isJSX)
  ;(walk as any)(finalAST, {
    leave(node: any, parent: any, key: any) {
      if (node?.type === 'Identifier' && node.name?.startsWith(PREFIX)) {
        const index = +node.name.slice(PREFIX.length)
        const expression = parse(sources[index], true, isTS, isJSX)
        const newNode: any = {
          type: 'TryExpression',
          expression,
        }

        if ('range' in node) newNode.range = node.range

        if ('loc' in node) newNode.loc = node.loc
        if (node?.loc?.identifierName) newNode.loc.identifierName = undefined

        if ('start' in node) newNode.start = node.start
        if ('end' in node) newNode.end = node.end

        parent[key] = newNode
      }
    },
  })

  return finalAST
}
