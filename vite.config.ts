
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // CRITICAL: Makes assets load correctly in the .exe
  server: {
    port: 3000,
    open: false
  }
});
