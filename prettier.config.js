import { fileURLToPath } from 'node:url'
import config from '@sxzz/prettier-config'

/** @type {import('prettier').Config} */
export default {
  ...config,
  plugins: [fileURLToPath(import.meta.resolve('./dist/prettier.js'))],
  overrides: config.overrides.slice(0, 1),
}
