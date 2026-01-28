import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  
    port: 5173,
    proxy: {
      '/uploads': 'http://localhost:5000',
      '/videos': 'http://localhost:5000', 
      
    }
  }
})