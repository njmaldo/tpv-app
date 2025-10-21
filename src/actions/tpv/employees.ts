
import { db, eq, User } from "astro:db";

/**
 * Devuelvo todos los empleados (usuarios con rol "user")
 */
export async function getEmployees() {
  const rows = await db
    .select()
    .from(User)
    .where(eq(User.roleId, "user"));

  return rows.map((r) => ({
    id: r.id,
    name: r.name ?? r.email,
    email: r.email,
    role: r.roleId as "user" | "admin",
    emailVerified: r.emailVerified ?? null,
  }));
}
