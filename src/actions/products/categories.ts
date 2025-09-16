
import tursoClient from "@/lib/turso";
import { z } from "zod";
import type { Category } from "@/interfaces/BakeryItem";

const CategoryRow = z.object({
  id: z.string(),
  name: z.string(),
});

// Obtener todas las categorías
export async function getCategories(): Promise<Category[]> {
  const result = await tursoClient.execute(
    `SELECT id, name
     FROM categories
     ORDER BY name ASC`
  );
  
  return result.rows.map((r) => CategoryRow.parse(r));
}

// Crear una categoría

export async function createCategory(data: Omit<Category, "id">): Promise<Category> {
  const id = crypto.randomUUID();

  try {
    await tursoClient.execute(
      `INSERT INTO categories (id, name) VALUES (?, ?)`,
      [id, data.name.trim()]
    );

    return { id, name: data.name.trim() };
  } catch (error: any) {
    console.error("Error al crear categoría:", error);
    throw new Error("No se pudo crear la categoría");
  }
}

// Eliminar una categoría
export async function deleteCategory(id: string): Promise<{ success: boolean }> {
  try {
    const result = await tursoClient.execute(
      `DELETE FROM categories WHERE id = ?`,
      [id]
    );

    return { success: result.rowsAffected > 0 };
  } catch (error: any) {
    console.error("Error al eliminar categoría:", error);
    throw new Error("No se pudo eliminar la categoría");
  }
}

