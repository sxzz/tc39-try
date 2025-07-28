// @ts-expect-error
// eslint-disable-next-line unused-imports/no-unused-vars
let unused
function fn(): number {
  return 42
}

const [ok, error, value] = try fn()
console.info(ok, error, value)
