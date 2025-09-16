import { defineConfig } from 'auth-astro';
import Credentials from '@auth/core/providers/credentials';
import GoogleProvider from "@auth/core/providers/google";
import { eq, db, User } from 'astro:db';
import bcrypt from 'bcryptjs';

export default defineConfig({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async ({ email, password }) => {
        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        const [user] = await db.select().from(User).where(eq(User.email, email as string));
        if (!user) throw new Error("User not found");

        const validPassword = await bcrypt.compare(password as string, user.password);
        if (!validPassword) throw new Error("Invalid password");

        const { password: _, ...rest } = user;
        return rest;
      },
    }),

    GoogleProvider({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Si el usuario no existe en la DB, crearlo
      const [existingUser] = await db.select().from(User).where(eq(User.email, user.email ?? ''));
      if (!existingUser) {
        await db.insert(User).values({
          name: user.name ?? '',
          email: user.email ?? '',
          password: '',
          role: 'user',
        });
      }
      return true; 
    },

    async redirect({ url, baseUrl }) {
      // Redirigir siempre a esta ruta después del login
      return `${baseUrl}/redirect-by-role`;
    },

    jwt: ({ token, user }) => {
      if (user) token.user = user;
      return token;
    },

    session: async ({ session, token }) => {
      let role = "user";
      if (session.user?.email) {
        const [dbUser] = await db.select().from(User).where(eq(User.email, session.user.email));
        if (dbUser?.role) {
          role = dbUser.role;
        }
      }

      if (token.user) {
        session.user = {
          ...session.user,
          ...(token.user as { role?: string }),
          role,
        };
      }
      return session;
    },
  },
});
