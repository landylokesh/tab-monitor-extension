import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, cpSync, readFileSync, writeFileSync } from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      writeBundle() {
        copyFileSync('manifest.json', 'dist/manifest.json')
        copyFileSync('background.js', 'dist/background.js')
        copyFileSync('test-chrome-apis.html', 'dist/test-chrome-apis.html')
        cpSync('icons', 'dist/icons', { recursive: true })

        // Fix absolute paths in index.html to relative paths
        let indexHtml = readFileSync('dist/index.html', 'utf8')
        indexHtml = indexHtml.replace(/src="\/assets\//g, 'src="./assets/')
        writeFileSync('dist/index.html', indexHtml)
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  base: './' // This ensures relative paths in the built files
})
