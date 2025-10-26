import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import tursoClient from "@/lib/turso";

export const register = defineAction({
  accept: "form",
  input: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    rememberMe: z.boolean().optional(),
  }),
  handler: async ({ name, email, password, rememberMe }, { cookies }) => {
    try {
      // 1. Verificar si el email ya existe
      const existing = await tursoClient.execute({
        sql: `SELECT id FROM User WHERE email = ? LIMIT 1`,
        args: [email],
      });

      if (existing.rows?.length) {
        return { success: false, error: "El email ya está registrado" };
      }

      // 2. Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = randomUUID();

      // 3. Crear el usuario principal
      await tursoClient.execute({
        sql: `
          INSERT INTO User (id, email, name, password, createdAt, roleId)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [userId, email, name, hashedPassword, new Date().toISOString(), "user"],
      });

      // 4. Crear el perfil asociado
      await tursoClient.execute({
        sql: `
          INSERT INTO UserProfile (id, userId, email, lastName, birthDate, shift, age)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          randomUUID(),
          userId,
          email,
          null, // lastName
          null, // birthDate
          null, // shift
          null, // age
        ],
      });

      // 5. Manejar cookie "rememberMe"
      if (rememberMe) {
        cookies.set("email", email, {
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
          path: "/",
        });
      } else {
        cookies.delete("email", { path: "/" });
      }

      return { success: true };
    } catch (err: any) {
      console.error("❌ Error en registro:", err);
      return { success: false, error: "Error al crear usuario" };
    }
  },
});
