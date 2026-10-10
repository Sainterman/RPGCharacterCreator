import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { emeraldStore } from './vite-plugins/emeraldStore'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), emeraldStore()],
})
