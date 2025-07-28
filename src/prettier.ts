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
import type { ParserOptions } from '@babel/parser'
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
      allowImportExportEverywhere: true,
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

const babelOptions: ParserOptions = {
  sourceType: 'module',
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowNewTargetOutsideFunction: true,
  allowSuperOutsideMethod: true,
  allowUndeclaredExports: true,
  errorRecovery: true,
  createParenthesizedExpressions: true,
  createImportExpressions: true,
  attachComment: false,
  plugins: [
    'doExpressions',
    'exportDefaultFrom',
    'functionBind',
    'functionSent',
    'throwExpressions',
    'partialApplication',
    'decorators',
    'moduleBlocks',
    'asyncDoExpressions',
    'destructuringPrivate',
    'decoratorAutoAccessors',
    'sourcePhaseImports',
    'deferredImportEvaluation',
    ['optionalChainingAssign', { version: '2023-07' }],
  ],
  tokens: false,
  ranges: false,
}

const babelParser: Parser = {
  ...babel.babel,
  parse(text) {
    return babelParse(text, babelOptions)
  },
}
const babelTsParser: Parser = {
  ...babel['babel-ts'],
  parse(text) {
    return babelParse(text, {
      ...babelOptions,
      plugins: [...(babelOptions.plugins || []), 'typescript'],
    })
  },
}

const typescriptParser: Parser = {
  ...typescript.typescript,
  parse(text, { filepath }) {
    return eslintTsParse(text, {
      sourceType: 'module',
      loc: true,
      range: true,
      comment: true,
      tokens: false,
      loggerFn: false,
      project: false,
      jsDocParsingMode: 'none',
      suppressDeprecatedPropertyWarnings: true,
      filePath: filepath,
    })
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
          const needParens =
            ['BinaryExpression', 'TryExpression'].includes(
              path.node.expression.type,
            ) || path.node.expression.type === 'ObjectExpression'

          return [
            'try ',
            needParens ? '(' : '',
            path.call(print, 'expression'),
            needParens ? ')' : '',
          ]
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

export default plugin
