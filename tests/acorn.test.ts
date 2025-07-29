import { expect, test } from 'vitest'
import { TryOperatorParser } from '../src/acorn'

test('parse simple try expression', () => {
  const code = 'const a = try something()'
  const ast = TryOperatorParser.parse(code, { ecmaVersion: 'latest' })

  const declaration = (ast as any).body[0].declarations[0]
  expect(declaration.init.type).toBe('UnaryExpression')
  expect(declaration.init.operator).toBe('try')
  expect(declaration.init.prefix).toBe(true)
  expect(declaration.init.argument.type).toBe('CallExpression')
  expect(declaration.init.argument.callee.name).toBe('something')
})

test('parse try expression in array destructuring', () => {
  const code = 'const [[ok, err, val]] = [try something()]'
  const ast = TryOperatorParser.parse(code, { ecmaVersion: 'latest' })

  const declaration = (ast as any).body[0].declarations[0]
  const arrayExpression = declaration.init.elements[0]
  expect(arrayExpression.type).toBe('UnaryExpression')
  expect(arrayExpression.operator).toBe('try')
  expect(arrayExpression.prefix).toBe(true)
  expect(arrayExpression.argument.type).toBe('CallExpression')
})

test('parse try expression in array literal', () => {
  const code = 'const [ok, err, val] = try something()'
  const ast = TryOperatorParser.parse(code, { ecmaVersion: 'latest' })

  const declaration = (ast as any).body[0].declarations[0]
  expect(declaration.init.type).toBe('UnaryExpression')
  expect(declaration.init.operator).toBe('try')
  expect(declaration.init.prefix).toBe(true)
  expect(declaration.init.argument.type).toBe('CallExpression')
})

test('parse try expression in arrow function', () => {
  const code = 'array.map(fn => try fn())'
  const ast = TryOperatorParser.parse(code, { ecmaVersion: 'latest' })

  const callExpression = (ast as any).body[0].expression
  const arrowFunction = callExpression.arguments[0]
  expect(arrowFunction.body.type).toBe('UnaryExpression')
  expect(arrowFunction.body.operator).toBe('try')
  expect(arrowFunction.body.prefix).toBe(true)
  expect(arrowFunction.body.argument.type).toBe('CallExpression')
})

test('parse try with yield', () => {
  const code = `
    function* gen() {
      return yield try something()
    }
  `
  const ast = TryOperatorParser.parse(code, { ecmaVersion: 'latest' })

  const functionDecl = (ast as any).body[0]
  const returnStatement = functionDecl.body.body[0]
  const yieldExpression = returnStatement.argument
  expect(yieldExpression.type).toBe('YieldExpression')
  expect(yieldExpression.argument.type).toBe('UnaryExpression')
  expect(yieldExpression.argument.operator).toBe('try')
  expect(yieldExpression.argument.prefix).toBe(true)
})

test('parse try yield', () => {
  const code = `
    function* gen() {
      try yield something()
    }
  `
  const ast = TryOperatorParser.parse(code, { ecmaVersion: 'latest' })

  const functionDecl = (ast as any).body[0]
  const expressionStatement = functionDecl.body.body[0]
  expect(expressionStatement.expression.type).toBe('UnaryExpression')
  expect(expressionStatement.expression.operator).toBe('try')
  expect(expressionStatement.expression.prefix).toBe(true)
  expect(expressionStatement.expression.argument.type).toBe('YieldExpression')
})

test('parse try await', () => {
  const code = `
    async function test() {
      try await something()
    }
  `
  const ast = TryOperatorParser.parse(code, { ecmaVersion: 'latest' })

  const functionDecl = (ast as any).body[0]
  const expressionStatement = functionDecl.body.body[0]
  expect(expressionStatement.expression.type).toBe('UnaryExpression')
  expect(expressionStatement.expression.operator).toBe('try')
  expect(expressionStatement.expression.prefix).toBe(true)
  expect(expressionStatement.expression.argument.type).toBe('AwaitExpression')
})

test('parse try with instanceof', () => {
  const code = 'try (a instanceof b)'
  const ast = TryOperatorParser.parse(code, { ecmaVersion: 'latest' })

  const expressionStatement = (ast as any).body[0]
  expect(expressionStatement.expression.type).toBe('UnaryExpression')
  expect(expressionStatement.expression.operator).toBe('try')
  expect(expressionStatement.expression.prefix).toBe(true)
  expect(expressionStatement.expression.argument.type).toBe('BinaryExpression')
  expect(expressionStatement.expression.argument.operator).toBe('instanceof')
})

test('parse nested try expressions', () => {
  const code = 'const a = try (try (try (try (try 1))))'
  const ast = TryOperatorParser.parse(code, { ecmaVersion: 'latest' })

  const declaration = (ast as any).body[0].declarations[0]

  let current = declaration.init
  for (let i = 0; i < 5; i++) {
    expect(current.type).toBe('UnaryExpression')
    expect(current.operator).toBe('try')
    expect(current.prefix).toBe(true)
    current = current.argument
  }
  expect(current.type).toBe('Literal')
  expect(current.value).toBe(1)
})

test('parse parenthesized try expression with instanceof', () => {
  const code = '(try a) instanceof Result'
  const ast = TryOperatorParser.parse(code, { ecmaVersion: 'latest' })

  const expressionStatement = (ast as any).body[0]
  expect(expressionStatement.expression.type).toBe('BinaryExpression')
  expect(expressionStatement.expression.operator).toBe('instanceof')
  expect(expressionStatement.expression.left.type).toBe('UnaryExpression')
  expect(expressionStatement.expression.left.operator).toBe('try')
  expect(expressionStatement.expression.left.prefix).toBe(true)
  expect(expressionStatement.expression.right.name).toBe('Result')
})

test('parse traditional try catch blocks', () => {
  const code = `
    function test() {
      try {
        something()
      } catch (error) {
        console.error(error)
      }
    }
  `
  const ast = TryOperatorParser.parse(code, { ecmaVersion: 'latest' })

  const functionDecl = (ast as any).body[0]
  const tryStatement = functionDecl.body.body[0]
  expect(tryStatement.type).toBe('TryStatement')
  expect(tryStatement.block.type).toBe('BlockStatement')
  expect(tryStatement.handler.type).toBe('CatchClause')
  expect(tryStatement.handler.param.name).toBe('error')
})

test('parse try catch finally blocks', () => {
  const code = `
    function test() {
      try {
        something()
      } catch (error) {
        console.error(error)
      } finally {
        cleanup()
      }
    }
  `
  const ast = TryOperatorParser.parse(code, { ecmaVersion: 'latest' })

  const functionDecl = (ast as any).body[0]
  const tryStatement = functionDecl.body.body[0]
  expect(tryStatement.type).toBe('TryStatement')
  expect(tryStatement.block.type).toBe('BlockStatement')
  expect(tryStatement.handler.type).toBe('CatchClause')
  expect(tryStatement.finalizer.type).toBe('BlockStatement')
})

test('parse try finally without catch', () => {
  const code = `
    function test() {
      try {
        something()
      } finally {
        cleanup()
      }
    }
  `
  const ast = TryOperatorParser.parse(code, { ecmaVersion: 'latest' })

  const functionDecl = (ast as any).body[0]
  const tryStatement = functionDecl.body.body[0]
  expect(tryStatement.type).toBe('TryStatement')
  expect(tryStatement.block.type).toBe('BlockStatement')
  expect(tryStatement.handler).toBe(null)
  expect(tryStatement.finalizer.type).toBe('BlockStatement')
})
