import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// Plugin to copy _redirects file to dist
const copyRedirects = () => {
  return {
    name: 'copy-redirects',
    writeBundle() {
      const redirectsPath = path.resolve(__dirname, 'public/_redirects');
      const distPath = path.resolve(__dirname, 'dist/_redirects');
      
      if (fs.existsSync(redirectsPath)) {
        fs.copyFileSync(redirectsPath, distPath);
        console.log('Copied _redirects file to dist folder');
      }
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    copyRedirects(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
