import { defineAction } from 'astro:actions';
import { date, z } from 'astro:schema';

export const registerUser = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    rememberMe: z.boolean().optional(),
  }),
  handler: async ({ name, email, password,rememberMe }, { cookies }) => {
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
    return { ok: true, msg:'Usuario creado'};
  },
});
