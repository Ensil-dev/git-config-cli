import { resolve } from 'path';
import { defineConfig } from 'vite';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  build: {
    target: 'node14', // Node.js 타겟팅
    ssr: true, // SSR/Node.js 빌드
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'git-config-manager',
      fileName: 'index',
      formats: ['es'], // ESM만 사용
    },
    rollupOptions: {
      output: {
        banner: '#!/usr/bin/env node\n', // shebang 추가
      },
      external: [
        'commander',
        'chalk',
        '@supabase/supabase-js',
        'dotenv',
        'open',
        'express',
        'inquirer',
        'node-fetch',
        'simple-git',
      ],
    },
  },
});
