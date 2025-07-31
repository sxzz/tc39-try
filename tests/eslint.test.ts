import { ESLint } from 'eslint'
import { expect, test } from 'vitest'
import { untsx } from '../src'

const { eslint } = untsx

test('eslint', async () => {
  const linter = new ESLint({
    overrideConfigFile: true,
    baseConfig: [
      {
        files: ['**/*.js'],
        languageOptions: { parser: eslint.jsParser },
      },
      {
        files: ['**/*.ts'],
        languageOptions: { parser: eslint.tsParser },
      },
    ],
  })
  {
    const results = await linter.lintText('const a = try something()', {
      filePath: 'test.js',
    })
    expect(results[0].messages).toHaveLength(0)
  }
  {
    const results = await linter.lintText('const a: any = try something()', {
      filePath: 'test.ts',
    })
    expect(results[0].messages).toHaveLength(0)
  }
})
