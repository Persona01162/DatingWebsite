import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    'import.meta.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'import.meta.env.AUTH_DOMAIN': JSON.stringify(process.env.AUTH_DOMAIN),
    'import.meta.env.PROJECT_ID': JSON.stringify(process.env.PROJECT_ID),
    'import.meta.env.MESSAGING_SENDER_ID': JSON.stringify(process.env.MESSAGING_SENDER_ID),
    'import.meta.env.APP_ID': JSON.stringify(process.env.APP_ID),
  },
});
