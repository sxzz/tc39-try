import { defineConfig } from 'vitest/config'
import Try from './src/unplugin'

export default defineConfig({
  plugins: [Try.vite()],
})
