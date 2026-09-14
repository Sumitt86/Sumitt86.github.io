import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({build:{rollupOptions:{input:{resume:fileURLToPath(new URL('./portfolio/resume.html',import.meta.url)),experience:fileURLToPath(new URL('./experience/index.html',import.meta.url)),portfolio:fileURLToPath(new URL('./portfolio/index.html',import.meta.url)),home:fileURLToPath(new URL('./index.html',import.meta.url))}}}});
