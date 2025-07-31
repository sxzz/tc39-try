import type { Result } from 'tc39-try/runtime'

// @ts-expect-error
// eslint-disable-next-line unused-imports/no-unused-vars
let unused
function fn(): number {
  return 42
}

const [ok, error, value] = try fn()
console.info(ok, error, value)

export const x: Result<{ a: number }> = try ({ a: 10 })

if ((try fn()).ok) {
  console.info('ok')
}
