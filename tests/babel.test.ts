import { expect, test } from 'vitest'
import { parse } from '../src/babel'

test('parse simple try expression', () => {
  const code = 'const a = try something()'
  const ast = parse(code).program

  const declaration = (ast as any).body[0].declarations[0]
  expect(declaration.init.type).toBe('TryExpression')
  expect(declaration.init.expression.type).toBe('CallExpression')
  expect(declaration.init.expression.callee.name).toBe('something')
})

test('parse try expression in array destructuring', () => {
  const code = 'const [[ok, err, val]] = [try something()]'
  const ast = parse(code).program

  const declaration = (ast as any).body[0].declarations[0]
  const arrayExpression = declaration.init.elements[0]
  expect(arrayExpression.type).toBe('TryExpression')
  expect(arrayExpression.expression.type).toBe('CallExpression')
})

test('parse try expression in array literal', () => {
  const code = 'const [ok, err, val] = try something()'
  const ast = parse(code).program

  const declaration = (ast as any).body[0].declarations[0]
  expect(declaration.init.type).toBe('TryExpression')
  expect(declaration.init.expression.type).toBe('CallExpression')
})

test('parse try expression in arrow function', () => {
  const code = 'array.map(fn => try fn())'
  const ast = parse(code).program

  const callExpression = (ast as any).body[0].expression
  const arrowFunction = callExpression.arguments[0]
  expect(arrowFunction.body.type).toBe('TryExpression')
  expect(arrowFunction.body.expression.type).toBe('CallExpression')
})

test('parse try with yield', () => {
  const code = `
    function* gen() {
      return yield try something()
    }
  `
  const ast = parse(code).program

  const functionDecl = (ast as any).body[0]
  const returnStatement = functionDecl.body.body[0]
  const yieldExpression = returnStatement.argument
  expect(yieldExpression.type).toBe('YieldExpression')
  expect(yieldExpression.argument.type).toBe('TryExpression')
})

test('parse try yield', () => {
  const code = `
    function* gen() {
      try yield something()
    }
  `
  const ast = parse(code).program

  const functionDecl = (ast as any).body[0]
  const expressionStatement = functionDecl.body.body[0]
  expect(expressionStatement.expression.type).toBe('TryExpression')
  expect(expressionStatement.expression.expression.type).toBe('YieldExpression')
})

test('parse try await', () => {
  const code = `
    async function test() {
      try await something()
    }
  `
  const ast = parse(code).program

  const functionDecl = (ast as any).body[0]
  const expressionStatement = functionDecl.body.body[0]
  expect(expressionStatement.expression.type).toBe('TryExpression')
  expect(expressionStatement.expression.expression.type).toBe('AwaitExpression')
})

test('parse try with instanceof', () => {
  const code = 'try (a instanceof b)'
  const ast = parse(code).program

  const expressionStatement = (ast as any).body[0]
  expect(expressionStatement.expression.type).toBe('TryExpression')
  expect(expressionStatement.expression.expression.type).toBe(
    'BinaryExpression',
  )
  expect(expressionStatement.expression.expression.operator).toBe('instanceof')
})

test('parse nested try expressions', () => {
  const code = 'const a = try (try (try (try (try 1))))'
  const ast = parse(code).program

  const declaration = (ast as any).body[0].declarations[0]

  let current = declaration.init
  for (let i = 0; i < 5; i++) {
    expect(current.type).toBe('TryExpression')
    current = current.expression
  }
  expect(current.type).toBe('NumericLiteral')
  expect(current.value).toBe(1)
})

test('parse parenthesized try expression with instanceof', () => {
  const code = '(try a) instanceof Result'
  const ast = parse(code).program

  const expressionStatement = (ast as any).body[0]
  expect(expressionStatement.expression.type).toBe('BinaryExpression')
  expect(expressionStatement.expression.operator).toBe('instanceof')
  expect(expressionStatement.expression.left.type).toBe('TryExpression')
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
  const ast = parse(code).program

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
  const ast = parse(code).program

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
  const ast = parse(code).program

  const functionDecl = (ast as any).body[0]
  const tryStatement = functionDecl.body.body[0]
  expect(tryStatement.type).toBe('TryStatement')
  expect(tryStatement.block.type).toBe('BlockStatement')
  expect(tryStatement.handler).toBe(null)
  expect(tryStatement.finalizer.type).toBe('BlockStatement')
})
