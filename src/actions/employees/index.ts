
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import tursoClient from "@/lib/turso";
import type { Employee } from "@/interfaces/Employee";

// Crear Empleados
export const createEmployee = defineAction({
  accept: "form",
  input: z.object({
    name: z.string().min(1, "Nombre requerido"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"), 
    roleId: z.string().default("employee"),
    // --- campos UserProfile ---
    lastName: z.string().optional().nullable(),
    shift: z.string().optional().nullable(),
    age: z.coerce.number().optional().nullable(),
    birthDate: z.string().optional().nullable(),
    isActive: z.preprocess(
      (val) => (val === "1" || val === 1 ? true : false),
      z.boolean()
    ),
  }),
  handler: async (input) => {
    console.log("📩 Form recibido en createEmployee:", input);
    const userId = randomUUID();
    const profileId = randomUUID();

    const hashedPassword = await bcrypt.hash(input.password, 12);

    try {
      // Inserción en User
      await tursoClient.execute({
        sql: `
          INSERT INTO "User" (id, name, email, password, createdAt, roleId, emailVerified)
          VALUES (?, ?, ?, ?, datetime('now'), ?, NULL)
        `,
        args: [userId, input.name, input.email, hashedPassword, input.roleId],
      });

      // Inserción en UserProfile
      await tursoClient.execute({
        sql: `
          INSERT INTO "UserProfile" (id, userId, lastName, shift, age, birthDate, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          profileId,
          userId,
          input.lastName ?? null,
          input.shift ?? null,
          input.age ?? null,
          input.birthDate ?? null,
          input.isActive ? 1 : 0,
        ],
      });
      console.log("✅ Empleado creado correctamente:", userId);
      return { success: true, message: "Empleado creado correctamente" };
    } catch (e) {
      console.error("❌ Error al crear empleado:", e);
      return { success: false, message: "Error al crear empleado" };
    }
  },
});


// 🔹 Obtener todos los empleados
export const listEmployees = defineAction({
    accept: "json",
    input: undefined,
    handler: async (): Promise<Employee[]> => {
        const result = await tursoClient.execute({
            sql: `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.password,
          u.createdAt,
          u.roleId,
          u.emailVerified,
          p.id as profileId,
          p.userId,
          p.lastName,
          p.shift,
          p.age,
          p.birthDate,
          p.isActive
        FROM "User" u
        LEFT JOIN "UserProfile" p ON u.id = p.userId
        ORDER BY u.createdAt DESC
      `,
        });
        // console.log("ROW KEYS:", result.rows.length && Object.keys(result.rows[0]));
        // console.log("FIRST ROW:", result.rows[0]);

    const employees = result.rows.map((row) => ({
                // Campos de User
                id: row.id as string,
                name: row.name as string,
                email: row.email as string,
                createdAt: row.createdAt as string,
                roleId: row.roleId as string,
                emailVerified: row.emailVerified as (string | null),
                userId: row.userId as string, 
                // Campos de UserProfile (ya no tienen userId ni profileId)
                lastName: row.lastName as (string | null),
                shift: row.shift as (string | null),
                age: row.age as (number | null),
                birthDate: row.birthDate as (string | null),
                isActive: row.isActive === 1,
            })) as Employee[];
            
        return employees;
  },
});


// IsActive: 1 = activo, 0 = inactivo
export const getEmployeeActive = defineAction({
    accept: "form",
    input: z.object({
        id: z.string(),
    }),
    handler: async ({ id }) => {
        const result = await tursoClient.execute({
            sql: "SELECT isActive FROM User WHERE id = ?",
            args: [id],
        });

        const isActive = result.rows[0]?.isActive === 1;
        return { isActive };
    },
});

// 🔹 Activar / Desactivar empleado
export const toggleEmployeeActive = defineAction({
  accept: "form",
  input: z.object({
    id: z.string().uuid("El ID no es válido"),
    isActive: z.preprocess((val) => {
      if (val === "1" || val === 1 || val === "true" || val === true) return true;
      if (val === "0" || val === 0 || val === "false" || val === false) return false;
      return val;
    }, z.boolean()),
  }),
  handler: async (input) => {
    console.log("ID RECIBIDO:", input.id, "Tipo:", typeof input.id); 
    try {
      const activeNum = input.isActive ? 1 : 0;

      await tursoClient.execute({
        sql: "UPDATE UserProfile SET isActive = ? WHERE userId = ?",
        args: [activeNum, input.id],
      });

      // Devuelvo el estado real como confirmación
      return { success: true, isActive: input.isActive };
    } catch (err: any) {
      console.error("[toggleEmployeeActive] ERROR:", err);
      return { success: false, error: String(err?.message ?? err) };
    }
  },
});


// 🔹 Eliminar empleado
export const deleteEmployee = defineAction({
  accept: "form",
  input: z.object({ id: z.string().uuid() }),
  handler: async (input) => {
    try {
      // Si UserProfile tiene FK ON DELETE CASCADE, borrar User limpiará profile.
      await tursoClient.execute({
        sql: `DELETE FROM "User" WHERE id = ?`,
        args: [input.id],
      });
      return { success: true };
    } catch (err: any) {
      console.error("❌ Error deleteEmployee:", err);
      return { success: false, error: String(err?.message ?? err) };
    }
  },
});


// 🔹 Editar empleado
export const updateEmployee = defineAction({
  accept: "form",
  input: z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().optional(),
    roleId: z.string().optional(),
    lastName: z.string().optional().nullable(),
    shift: z.string().optional().nullable(),
    age: z.coerce.number().optional().nullable(),
    birthDate: z.string().optional().nullable(),
    isActive: z.preprocess((v) => (v === "1" || v === 1 || v === true), z.boolean()),
  }),
  handler: async (input) => {
    try {
      // Update User (si password presente, hashearla)
      if (input.password) {
        const hashed = await bcrypt.hash(input.password, 12);
        await tursoClient.execute({
          sql: `UPDATE "User" SET name = ?, email = ?, password = ?, roleId = ? WHERE id = ?`,
          args: [input.name, input.email, hashed, input.roleId ?? "user", input.id],
        });
      } else {
        await tursoClient.execute({
          sql: `UPDATE "User" SET name = ?, email = ?, roleId = ? WHERE id = ?`,
          args: [input.name, input.email, input.roleId ?? "user", input.id],
        });
      }

      // Upsert UserProfile: insertar si no existe, o actualizar
      await tursoClient.execute({
          sql: `
            INSERT INTO UserProfile (userId, lastName, shift, age, birthDate, isActive)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(userId) DO UPDATE SET
              lastName = excluded.lastName,
              shift = excluded.shift,
              age = excluded.age,
              birthDate = excluded.birthDate,
              isActive = excluded.isActive;
          `,
          args: [
            input.id,
            input.lastName ?? null,
            input.shift ?? null,
            input.age ?? null,
            input.birthDate ?? null,
            input.isActive ? 1 : 0,
          ],
        });

      return { success: true };
    } catch (err: any) {
      console.error("❌ Error updateEmployee:", err);
      return { success: false, error: String(err?.message ?? err) };
    }
  },
});

