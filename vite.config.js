import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import path from 'path';

export default defineConfig({
  base: '/quest-craft',
  plugins: [
    svelte({
      preprocess: sveltePreprocess()
    })
  ],
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, './src/lib'),
      $routes: path.resolve(__dirname, './src/routes')
    }
  }
});
