function fn() {
  return 10
}
async function fn2() {
  await 10
  return 42
}

const x = try fn()
const x2 = try await fn2()
