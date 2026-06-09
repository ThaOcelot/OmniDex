import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// In locale usa './', su GitHub Pages usa '/OmniDex/' (nome del repo)
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/OmniDex/' : './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/functions', 'firebase/auth'],
          'vendor-capacitor': ['@capacitor/core', '@capacitor/android', '@capacitor/app', '@capacitor/filesystem', '@capacitor/haptics', '@capacitor/keyboard', '@capacitor/share']
        }
      }
    }
  }
})
