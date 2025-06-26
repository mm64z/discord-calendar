import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repo = 'discord-calendar';

export default defineConfig({
  base: `/${repo}/`,
  plugins: [react()],
});