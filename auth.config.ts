// auth.config.ts

import { defineConfig } from "auth-astro";
import Credentials from "@auth/core/providers/credentials";
import GoogleProvider from "@auth/core/providers/google";
import bcrypt from "bcryptjs";
import tursoClient from "@/lib/turso"; 

export default defineConfig({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials) => {
        if (!credentials) return null;
        const { email, password } = credentials ?? {};
        if (!email || !password) return null;

        // 🔍 Buscar usuario en Turso usando tursoClient
        const result = await tursoClient.execute({
          sql: `
            SELECT id, name, email, password, roleId, emailVerified 
            FROM User 
            WHERE email = ?
          `,
          args: [email as string],
        });

        if (!result.rows || result.rows.length === 0) return null;

        interface UserRow {
          id: string;
          name: string;
          email: string;
          password: string;
          roleId: string;
          emailVerified: string | null;
        }

        const user = result.rows[0] as unknown as UserRow;

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password as string, user.password);
        if (!valid) return null;

        // El casteo final arregla el tipo esperado por Auth.js
        return {
          id: user.id,
          name: user.name ?? "",
          email: user.email,
          role: user.roleId,
          emailVerified: user.emailVerified ?? null,
        } as unknown as import("@auth/core/types").User;
      },
    }),

    GoogleProvider({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    // ✅ Mantienes la lógica del cliente manual, ahora es la única fuente de verdad.
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user?.email) {
        const existing = await tursoClient.execute({
          sql: "SELECT id FROM User WHERE email = ?",
          args: [user.email],
        });

        if (!existing.rows || existing.rows.length === 0) {
          // Usar 'user' para el rol por defecto en la inserción
          await tursoClient.execute({
            sql: `
              INSERT INTO User (id, name, email, password, roleId, emailVerified)
              VALUES (?, ?, ?, ?, ?, ?)
            `,
            args: [
              crypto.randomUUID(),
              user.name ?? profile?.name ?? "",
              user.email,
              "", // Contraseña vacía para usuarios de Google
              "user", 
              new Date().toISOString(),
            ],
          });
        }
      }
      return true;
    },


    jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.name = user.name;
        token.email = user.email;
        token.role = (user as any).role ?? "user";
        token.emailVerified = (user as any).emailVerified ?? null;
      }
      return token;
    },

    session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: (token.name as string) ?? "",
        email: (token.email as string) ?? "",
        role: (token.role as string) ?? "user",
        emailVerified: (token.emailVerified as Date | null) ?? null,
      };
      return session;
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/redirect-by-role`;
    },
  },
});