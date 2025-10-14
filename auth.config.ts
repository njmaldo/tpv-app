import { defineConfig } from "auth-astro";
import Credentials from "@auth/core/providers/credentials";
import GoogleProvider from "@auth/core/providers/google";
import { db, eq, User } from "astro:db";
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

        // 🔍 Buscar usuario en Turso
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
    async signIn({ user, account, profile }) {
      // Alta automática si viene de Google
      if (account?.provider === "google" && user?.email) {
        const [existingUser] = await db
          .select()
          .from(User)
          .where(eq(User.email, user.email));

        if (!existingUser) {
          await db.insert(User).values({
            id: crypto.randomUUID(),
            name: user.name ?? profile?.name ?? "",
            email: user.email,
            password: "",
            roleId: "user",
            emailVerified: new Date(),
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
