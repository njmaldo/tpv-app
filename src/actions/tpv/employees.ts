

import tursoClient from "@/lib/turso";

export async function getEmployees() {
  const result = await tursoClient.execute({
    sql: `SELECT id, name, email, roleId, emailVerified FROM User WHERE roleId = ?`,
    args: ["user"],
  });

  const rows = result.rows ?? [];

  return rows.map((r: any) => ({
    id: r.id,
    name: r.name ?? r.email,
    email: r.email,
    role: r.roleId as "user" | "admin",
    emailVerified: r.emailVerified ?? null,
  }));
}

