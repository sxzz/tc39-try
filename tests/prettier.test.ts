import { format } from 'prettier'
import { expect, test } from 'vitest'
import plugin from '../src/prettier'

test('prettier formats try expression', async () => {
  const code = `
    const a  = try  something()
    const [[ok, err, val]] = [try  something()]
    const [ok2, err2, val2] = try  something()
    array.map(fn => try 
    fn())
    try await something()
    try (a instanceof b)
    (try a) instanceof Result
    const b = try (try (try (try (try 1))))

    function* gen() {
      yield try  something()
      try yield something()
    }
  `
  const formatted = await format(code, {
    parser: 'acorn-ex',
    plugins: [plugin],
  })

  expect(formatted).toMatchInlineSnapshot(`
    "const a = try something();
    const [[ok, err, val]] = [try something()];
    const [ok2, err2, val2] = try something();
    array.map((fn) => try fn());
    try await something();
    try (a instanceof b)(try a) instanceof Result;
    const b = try try try try try 1;

    function* gen() {
      yield try something();
      try yield something();
    }
    "
  `)
})
