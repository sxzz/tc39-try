# tc39-try [![npm](https://img.shields.io/npm/v/tc39-try.svg)](https://npmjs.com/package/tc39-try)

[![Unit Test](https://github.com/sxzz/tc39-try/actions/workflows/unit-test.yml/badge.svg)](https://github.com/sxzz/tc39-try/actions/workflows/unit-test.yml)

An implementation of the [ECMAScript Try Operator](https://github.com/arthurfiorette/proposal-try-operator) proposal.

> ⚠️ **For demo and toy-level projects only - not for production use!**

## Demo

For a working demo, visit the [sxzz/tc39-try-demo](https://github.com/sxzz/tc39-try-demo).

## Install

Install the package via npm:

```bash
npm i tc39-try
```

## Features

This demo project showcases full toolchain integration for the try operator:

- ✅ **TypeScript** - Full type support with transformations.
- ✅ **Bundler** - Seamless integration with Vite and other bundlers via `unplugin`.
- ✅ **Prettier** - Code formatting support.
- ✅ **ESLint** - Linting with proper syntax recognition.
- ✅ **Development** - Hot reload and dev server support powered by Vite.

## Configuration

### Vite Integration

To integrate with Vite, configure your `vite.config.ts` as follows:

```typescript
// vite.config.ts
import Try from 'tc39-try/unplugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [Try.vite()],
})
```

### TypeScript Macro

For proper syntax highlighting and IntelliSense support of the try operator, install the [TS Macro extension](https://marketplace.visualstudio.com/items?itemName=zhiyuanzmj.vscode-ts-macro) in VS Code:

```bash
ext install zhiyuanzmj.vscode-ts-macro
```

Alternatively, search for "TS Macro" in the VS Code Extensions marketplace.

Then, configure your `ts-macro.config.ts`:

```typescript
// ts-macro.config.ts
import volar from 'tc39-try/volar'

export default {
  plugins: [volar()],
}
```

### Prettier Configuration

To enable Prettier support for the try operator, configure your `prettier.config.js` as follows:

```js
// prettier.config.js
import { fileURLToPath } from 'node:url'

export default {
  // ...
  plugins: [fileURLToPath(import.meta.resolve('tc39-try/prettier'))],
}
```

### ESLint Configuration

To enable ESLint support for the try operator, configure your `eslint.config.js` as follows:

```js
// eslint.config.js
import { GLOB_JS, GLOB_TS, sxzz } from '@sxzz/eslint-config'
import * as tsParser from 'tc39-try/eslint-typescript-parser'
import * as jsParser from 'tc39-try/espree'

export default sxzz().append(
  {
    files: [GLOB_TS],
    languageOptions: { parser: tsParser },
  },
  {
    files: [GLOB_JS],
    languageOptions: { parser: jsParser },
  },
)
```

## About the Try Operator

The [ECMAScript Try Operator](https://github.com/arthurfiorette/proposal-try-operator) is a stage 0 proposal that introduces a new syntax for error handling. It simplifies error handling by replacing traditional `try-catch` blocks with a more concise `try` operator.

### Example

#### Traditional `try-catch`:

```typescript
let result1
try {
  result1 = riskyFunction()
} catch (error) {
  console.error(error) // Handle error
}
```

#### With the `try` operator:

```typescript
const result2 = try riskyFunction() // Returns Result
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2025 [Kevin Deng](https://github.com/sxzz)
