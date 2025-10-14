// src/auth.d.ts
import { DefaultSession, DefaultUser } from "@auth/core/types";

declare module "@auth/core/types" {
  // Extiende el User que maneja Auth.js
  interface User extends DefaultUser {
    id: string;
    role: string;
    emailVerified?: Date | null;
  }

  // La sesión siempre expone nuestro User extendido
  interface Session extends DefaultSession {
    user: User;
  }
}

// Extensión de tipos para el cliente de auth-astro

declare module "auth-astro/client" {
    interface AstroSignInOptions {
    redirect?: boolean;
    callbackUrl?: string;
    email?: string;
    password?: string;
  }

  interface SignInResponse {
    error?: string;
    ok: boolean;
    status: number;
    url?: string;
  }

  // Sobrecarga de signIn para que TS devuelva nuestro tipo
  function signIn(
    provider: string,
    options?: AstroSignInOptions
  ): Promise<SignInResponse | undefined>;
}
