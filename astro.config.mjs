// @ts-check
import { defineConfig } from 'astro/config';
import db from '@astrojs/db';
import auth from 'auth-astro';
import netlify from '@astrojs/netlify';

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
      entrypoint: 'astro/services/image/noop', 
    },
  },

  output: 'server',
  adapter: netlify(),

  integrations: [
    db(), 
    auth(),
  ],

});