import path from 'node:path'
import { testFixtures } from '@sxzz/test-utils'
import { getLanguagePlugins } from '@ts-macro/language-plugin'
import { proxyCreateProgram } from '@volar/typescript'
import fg from 'fast-glob'
import * as ts from 'typescript'
import { describe } from 'vitest'
import volar from '../src/volar'

const workspace = path.resolve(__dirname, './fixtures')

describe('volar', async () => {
  const compilerOptions: ts.CompilerOptions = {
    rootDir: workspace,
    outDir: workspace,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    allowNonTsExtensions: true,
    skipLibCheck: true,
  }
  const host = ts.createCompilerHost(compilerOptions)
  const createProgram = proxyCreateProgram(ts, ts.createProgram, (
    ts,
    options,
  ) => {
    return getLanguagePlugins(ts, options.options, { plugins: [volar()] })
  })
  const program = createProgram({
    options: compilerOptions,
    host,
    rootNames: await fg(`${workspace}/*.ts`),
  })

  await testFixtures(
    '*.ts',
    (_, id) => {
      const ast = program.getSourceFile(id)
      return ast?.text.trim()
    },
    { cwd: workspace },
  )
})
