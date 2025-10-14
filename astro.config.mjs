// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import db from '@astrojs/db';
import auth from 'auth-astro';

// https://astro.build/config
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
  image: {
    service: {
      entrypoint: 'astro/services/image/noop', // Desactiva el servicio en runtime
    },
  },
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    db(), 
    auth(),
  ]
});