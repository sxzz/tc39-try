/* eslint-disable unicorn/no-unnecessary-await */
import { expect, test } from 'vitest'
import { Result } from 'try'

test('try runtime', async () => {
  function ok() {
    return 42
  }
  async function okAsync() {
    await 1
    return 42
  }

  function err(arg?: any) {
    throw new Error(`test error: ${arg}`)
  }

  expect(try ok()).toEqual(Result.ok(42))
  expect(try await okAsync()).toEqual(Result.ok(42))
  await expect(try okAsync()).resolves.toEqual(Result.ok(42))
  expect(try (try ok())).toEqual(Result.ok(Result.ok(42)))

  expect(Array.from(try err())).toEqual([
    false,
    new Error('test error: undefined'),
    undefined,
  ])
})
