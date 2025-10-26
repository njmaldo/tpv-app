// @ts-check
import { defineConfig } from 'astro/config';
import auth from 'auth-astro';
import cloudflare from "@astrojs/cloudflare";


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
  adapter: cloudflare(),
  integrations: [
    auth(),
  ],

});