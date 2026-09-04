import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build em modo "lib": o resultado é um único <script> clássico (IIFE) +
// um único .css, pensados para serem colados no <head>/<body> do portfólio
// vanilla via duas tags simples — sem bundler nenhum do lado do site.
// Isso é intencional: o site continua 100% HTML/CSS/JS puro, e o React
// só existe dentro deste artefato isolado ("ilha" de interatividade).
export default defineConfig({
  plugins: [react()],
  // Necessário porque o build é IIFE (roda direto no navegador, sem outro
  // bundler por cima): sem isso, o React embutido deixa uma referência a
  // `process.env.NODE_ENV` sobrando no bundle, e `process` não existe no
  // navegador — é a causa do "process is not defined" em runtime.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist',
    cssCodeSplit: false,
    lib: {
      entry: 'src/main.jsx',
      name: 'NixxLeadWidget',
      formats: ['iife'],
      fileName: () => 'lead-widget.js',
    },
    rollupOptions: {
      output: {
        // garante nome previsível para o CSS extraído (lead-widget.css)
        assetFileNames: 'lead-widget.[ext]',
      },
    },
  },
});
