// @ts-expect-error
import { parsers as espree } from 'prettier/plugins/acorn.mjs'
// @ts-expect-error
import { parsers as babel } from 'prettier/plugins/babel.mjs'
// @ts-expect-error
import { printers } from 'prettier/plugins/estree.mjs'
// @ts-expect-error
import { parsers as typescript } from 'prettier/plugins/typescript.mjs'
import { TryParser } from './acorn'
import { parse as babelParse } from './babel'
import { parse as eslintTsParse } from './eslint-typescript'
import type { Comment } from 'acorn'
import type { Parser, Plugin } from 'prettier'

const acornParser: Parser = {
  ...espree.acorn,
  parse(text) {
    const comments: Comment[] = []
    const ast = TryParser.parse(text, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      onComment: comments,
      allowReserved: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      checkPrivateFields: false,
      locations: false,
      ranges: true,
      preserveParens: true,
    })
    // @ts-expect-error -- expected
    ast.comments = comments
    return ast
  },
}

const babelParser: Parser = {
  ...babel.babel,
  parse(text, { filepath }) {
    return babelParse(text, filepath)
  },
}
const babelTsParser: Parser = {
  ...babel['babel-ts'],
  parse(text, { filepath }) {
    return babelParse(text, filepath)
  },
}

const typescriptParser: Parser = {
  ...typescript.typescript,
  parse(text, { filepath }) {
    return eslintTsParse(text, filepath)
  },
}

const plugin: Plugin = {
  parsers: {
    acorn: acornParser,
    babel: babelParser,
    'babel-ts': babelTsParser,
    typescript: typescriptParser,
  },
  printers: {
    estree: {
      ...printers.estree,
      print(path, options, print) {
        if (path.node.type === 'TryExpression') {
          return ['try ', path.call(print, 'expression')]
        }
        return printers.estree.print(path, options, print)
      },
      getVisitorKeys(node: any): string[] {
        if (node.type === 'TryExpression') {
          return ['expression']
        }
        return printers.estree.getVisitorKeys(node)
      },
    },
  },
}
// eslint-disable-next-line import/no-default-export
export default plugin
