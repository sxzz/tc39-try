// eslint-disable-next-line unused-imports/no-unused-vars

import { Result } from 'tc39-try'

// @ts-expect-error
let unused
function fn(): number {
  return 42
}

const [ok, error, value] = try fn()
console.info(ok, error, value)

export let x: Result<{ a: number }> = try ({ a: 10 })

if (try fn()) {
}
