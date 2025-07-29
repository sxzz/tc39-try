/// <reference types="vite/client" />

import path from 'node:path'
import { testFixtures } from '@sxzz/test-utils'
import { getLanguagePlugins } from '@ts-macro/language-plugin'
import { proxyCreateProgram } from '@volar/typescript'
import * as ts from 'typescript'
import { describe } from 'vitest'
import volar from '../src/volar'

const workspace = path.resolve(import.meta.dirname, './fixtures')
const fixtures = import.meta.glob('./fixtures/*.ts', {
  eager: true,
  query: '?raw',
  import: 'default',
})

describe('volar', async () => {
  const compilerOptions: ts.CompilerOptions = {}
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
    rootNames: Object.keys(fixtures).map((id) =>
      path.resolve(import.meta.dirname, id)),
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
