import { Result } from 'try'
function fn() {
  return 10
}
async function fn2() {
  await 10
  return 42
}

export const x: Result<number> = try fn()
export const x2: Result<number> = try (await fn2())
