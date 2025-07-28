import { expect, test } from 'vitest'
import { __t } from '../src/index'

test('try runtime', async () => {
  function fn() {
    return 10
  }
  async function fn2() {
    // eslint-disable-next-line unicorn/no-unnecessary-await
    await 10
    return 42
  }

  const x = __t(fn())
  const x2 = await __t(fn2())

  expect(Array.from(x)).toEqual([true, undefined, 10])
  expect(Array.from(x2)).toEqual([true, undefined, 42])
})
