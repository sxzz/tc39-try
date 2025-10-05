import path from 'node:path'
import { createTsMacroProgram, testFixtures } from '@sxzz/test-utils'
import { describe } from 'vitest'
import volar from '../src/volar'

const workspace = path.resolve(import.meta.dirname, './fixtures')
const fixtures = import.meta.glob('./fixtures/*.ts', {
  eager: true,
  query: '?raw',
  import: 'default',
})

describe('volar', async () => {
  const program = await createTsMacroProgram(
    Object.keys(fixtures).map((id) => path.resolve(import.meta.dirname, id)),
    [volar()],
  )

  await testFixtures(
    '*.ts',
    (_, id) => {
      const ast = program.getSourceFile(id)
      return ast?.text.trim()
    },
    { cwd: workspace },
  )
})
