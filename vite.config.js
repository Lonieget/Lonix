import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'clint-unwatermarked-bridger.ngrok-free.dev' // 這裡貼上報錯訊息中的主機名稱
    ]
  }
})