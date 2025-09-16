import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const loginUser = defineAction({
  accept: 'form',
  input: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    rememberMe: z.boolean().optional(),
  }),
  handler: async ({ email, password, rememberMe }, { cookies }) => {
    
    if (rememberMe) {
      cookies.set('email', email, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        path: '/'
      })
    } else {
      cookies.delete('email', {
        path: '/'
      })
    }
    return { ok: true };
  },
});
