import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => {
  return {
    plugins: [react(), tailwindcss()],
    // Use '/' when running locally (serve), and use '/Catiee-Accessories/' when building for deployment
    base: command === 'serve' ? '/' : '/Catiee-Accessories/',
  };
});