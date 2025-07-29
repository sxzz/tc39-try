import path from 'node:path'
import { rollupBuild, testFixtures } from '@sxzz/test-utils'
import UnpluginOxc from 'unplugin-oxc/vite'
import { describe } from 'vitest'
import unplugin from '../src/unplugin'

const { dirname } = import.meta

describe('unplugin', async () => {
  await testFixtures(
    '*.ts',
    async (args, id) => {
      const { snapshot } = await rollupBuild(id, [
        unplugin.rollup(),
        UnpluginOxc(),
      ])
      return snapshot
    },
    { cwd: path.resolve(dirname, 'fixtures'), promise: true },
  )
})
