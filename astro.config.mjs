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
      // entrypoint: 'astro/services/image/noop', 
      entrypoint: 'astro/services/image/passthrough'
    },
  },
  output: 'server',
  adapter: vercel({}),
  integrations: [
    db(), 
    auth(),
  ],
  
});