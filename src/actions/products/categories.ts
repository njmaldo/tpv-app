import { defineAction } from "astro:actions";
import tursoClient from "@/lib/turso";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { Category } from "@/interfaces/BakeryItem";

const CategoryRow = z.object({
  id: z.string(),
  name: z.string(),
});


// 1. Listar categorías
export const listCategories = defineAction({
  accept: "json",
  handler: async () => {
    const result = await tursoClient.execute(
      `SELECT id, name
       FROM categories
       ORDER BY name ASC`
    );

    const rows = result.rows.map((r) => CategoryRow.parse(r));
    return { success: true, data: rows };
  },
});

// 2. Crear categoría
export const createCategory = defineAction({
  accept: "form",
  input: z.object({
    name: z.string().min(1),
  }),
  handler: async ({ name }) => {
    const id = randomUUID();

    await tursoClient.execute({
      sql: "INSERT INTO categories (id, name) VALUES (?, ?)",
      args: [id, name],
    });

    return { success: true, id };
  },
});


// 3. Eliminar categoría
export const deleteCategory = defineAction({
  accept: "form",
  input: z.object({
    id: z.string(),
  }),
  handler: async ({ id }) => {
    await tursoClient.execute({
      sql: "DELETE FROM categories WHERE id = ?",
      args: [id],
    });
    return { success: true };
  },
});
