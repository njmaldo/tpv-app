// @ts-check
import { defineConfig } from 'astro/config';
import db from '@astrojs/db';
import auth from 'auth-astro';
import vercel from "@astrojs/vercel/serverless";

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
  adapter: vercel({}),
  integrations: [
    db(), 
    auth(),
  ],
  
});