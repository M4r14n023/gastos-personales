import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    host: '0.0.0.0', // Permitir que escuche en todas las interfaces
    port: Number(process.env.PORT) || 4173, // Usa el puerto proporcionado por Render o 4173 como predeterminado
  },
});
