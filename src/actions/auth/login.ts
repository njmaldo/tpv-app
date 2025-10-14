
// src/actions/auth/login.ts
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const login = defineAction({
  accept: "form",
  input: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    rememberMe: z
      .union([z.literal("on"), z.literal("true"), z.boolean()])
      .optional(),
  }),

  handler: async ({ email, password, rememberMe }, { cookies }) => {
    // Convertir rememberMe si llega como string del form
    const remember = rememberMe === "on" || rememberMe === "true" || rememberMe === true;

    if (remember) {
      cookies.set("email", email, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 días
      });
    } else {
      cookies.delete("email", { path: "/" });
    }

    return { success: true };
  },
});
