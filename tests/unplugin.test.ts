import path from 'node:path'
import { rollupBuild, testFixtures } from '@sxzz/test-utils'
import { describe } from 'vitest'
import unplugin from '../src/unplugin'

describe('rollup', async () => {
  const { dirname } = import.meta
  await testFixtures(
    '*.ts',
    async (args, id) => {
      const { snapshot } = await rollupBuild(id, [unplugin.rollup()])
      return snapshot
    },
    { cwd: path.resolve(dirname, 'fixtures'), promise: true },
  )
})
