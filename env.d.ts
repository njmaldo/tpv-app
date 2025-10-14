
/// <reference path="../.astro/types.d.ts" />
/// <reference path="../.astro/db-types.d.ts" />
/// <reference path="../.astro/actions.d.ts" />
/// <reference types="astro/client" />

interface User {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
  emailVerified?: Date | null;
}

declare namespace App {
  interface Locals {
    isLoggedIn: boolean;
    isAdmin: boolean;
    user: import("@auth/core/types").User | null;
    session: import("@auth/core/types").Session | null;
  }
}
