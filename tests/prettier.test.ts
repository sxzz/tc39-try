import { format } from 'prettier'
import { expect, test } from 'vitest'
import plugin from '../src/prettier'

test.each(['acorn', 'babel', 'babel-ts'])(
  'prettier formats try expression with parser %s',
  async (parser) => {
    const code = `
    const a  = try  something()
    const [[ok, err, val]] = [try  something()]
    const [ok2, err2, val2] = try  something()
    array.map(fn => try 
    fn())
    try await something()
    try (a instanceof b)
    ;(try aa) instanceof Result
    const b = try (try (try (try (try 111))))
    const result = try ({ data: work() })

    function* gen() {
      yield try  something()
      try yield something()
    }
  `

    const formatted = await format(code, {
      parser,
      plugins: [plugin],
      semi: false,
    })

    expect(formatted).toBe(
      `const a = try something()
const [[ok, err, val]] = [try something()]
const [ok2, err2, val2] = try something()
array.map((fn) => try fn())
try (await something())
try (a instanceof b)
;(try aa) instanceof Result
const b = try (try (try (try (try 111))))
const result = try ({ data: work() })

function* gen() {
  yield try something()
  try (yield something())
}
`,
    )
  },
)
