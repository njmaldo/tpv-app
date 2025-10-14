import { defineAction } from 'astro:actions';
import { signOut } from 'auth-astro/client';


export const logout = defineAction({
  accept: 'json',
  handler: async (_, cookies) => {
    // La función signOut de Auth.js se encarga de invalidar la sesión
    await signOut();
    return { ok: true };
  },
});
