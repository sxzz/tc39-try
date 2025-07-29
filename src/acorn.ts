import { Parser, type Node } from 'acorn'

export function tryOperatorPlugin(): (Parser: any) => any {
  return function (Parser: any) {
    Parser.acorn.tokTypes._try.startsExpr = true
    return class extends Parser {
      parseStatement(context?: any, topLevel?: boolean, exports?: any): Node {
        if ((this as any).type.keyword === 'try') {
          const origPos = (this as any).pos
          const origType = (this as any).type
          const origValue = (this as any).value
          const origStart = (this as any).start
          const origEnd = (this as any).end
          const origStartLoc = (this as any).startLoc
          const origEndLoc = (this as any).endLoc

          try {
            return super.parseStatement(context, topLevel, exports)
          } catch {
            ;(this as any).pos = origPos
            ;(this as any).type = origType
            ;(this as any).value = origValue
            ;(this as any).start = origStart
            ;(this as any).end = origEnd
            ;(this as any).startLoc = origStartLoc
            ;(this as any).endLoc = origEndLoc

            const node = this.startNode()
            node.expression = this.parseTryUnaryExpression()
            ;(this as any).semicolon()
            return (this as any).finishNode(node, 'ExpressionStatement')
          }
        }
        return super.parseStatement(context, topLevel, exports)
      }

      parseTryUnaryExpression(): Node {
        const node = (this as any).startNode()
        ;(this as any).next() // consume 'try'

        node.operator = 'try'
        node.prefix = true
        node.argument = (this as any).parseMaybeAssign()

        return (this as any).finishNode(node, 'UnaryExpression')
      }

      parseExprAtom(refDestructuringErrors?: any): Node {
        if ((this as any).type.keyword === 'try') {
          return this.parseTryUnaryExpression()
        }

        return super.parseExprAtom(refDestructuringErrors)
      }

      parseMaybeUnary(
        refDestructuringErrors?: any,
        sawUnary?: boolean,
        incDec?: boolean,
      ): Node {
        if ((this as any).type.keyword === 'try') {
          return this.parseTryUnaryExpression()
        }

        return super.parseMaybeUnary(refDestructuringErrors, sawUnary, incDec)
      }

      parseYield(noIn?: boolean): Node {
        if ((this as any).type.keyword === 'try') {
          const node = (this as any).startNode()
          ;(this as any).next() // consume 'try'

          node.operator = 'try'
          node.prefix = true
          node.argument = super.parseYield(noIn)

          return (this as any).finishNode(node, 'UnaryExpression')
        }

        return super.parseYield(noIn)
      }

      // Override parseAwait to handle "try await" expressions
      parseAwait(): Node {
        if ((this as any).type.keyword === 'try') {
          const node = (this as any).startNode()
          ;(this as any).next() // consume 'try'

          node.operator = 'try'
          node.prefix = true
          node.argument = super.parseAwait()

          return (this as any).finishNode(node, 'UnaryExpression')
        }

        return super.parseAwait()
      }
    }
  }
}

export const TryOperatorParser: typeof Parser =
  Parser.extend(tryOperatorPlugin())
