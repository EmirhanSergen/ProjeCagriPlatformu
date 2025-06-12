import { defineConfig } from 'vite' // Provides type-safe configuration and IntelliSense
import react from '@vitejs/plugin-react' // Enables React support (JSX, fast refresh)

export default defineConfig({
  plugins: [
    react() // React plugin: transforms JSX and enables HMR (Hot Module Replacement)
  ],
  // Optional: configure development server settings
  // server: {
  //   host: 'localhost',
  //   port: 3000,
  //   proxy: {
  //     '/api': 'http://localhost:8000'
  //   }
  // },
  // Optional: customize build output
  // build: {
  //   outDir: 'dist',
  //   sourcemap: true
  // }
})