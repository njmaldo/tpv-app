import { defineAction} from 'astro:actions';
import { z } from 'astro:schema';
import { v4 as uuidv4 } from 'uuid';
import tursoClient from '../../lib/turso';
import { getSession } from 'auth-astro/server';
import type { BakeryItem } from '@/interfaces/BakeryItem';
import { navigate } from 'astro:transitions/client';

// Crear producto
export const addBakeryItem = defineAction({
    accept: "form",
    input: z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.preprocess((val) => Number(val), z.number().min(0.01)),
        imageUrl: z.string().url().optional(),
        isActive: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
        categoryId: z.string().min(1),
        stock: z.preprocess((val) => Number(val), z.number().int().min(0, "El stock no puede ser negativo")),
    }),

    handler: async (input, context) => {
    // ✅ Depuración global: Muestra el objeto de entrada antes de cualquier validación
        console.log("👉 Input recibido en addBakeryItem:", input);
        
        const session = await getSession(context.request);
        if (!session || session.user.role !== "admin") {
            return { success: false, message: "No autorizado" };
        }

        try {
            // Verificar duplicado
            const existing = await tursoClient.execute(
                `SELECT id FROM bakery_items WHERE name = ?`,
                [input.name]
            );

            if (existing.rows.length > 0) {
                return {
                    success: false,
                    message: "Ya existe un producto con ese nombre",
                };
            }

            const id = uuidv4();
            const createdAt = new Date().toISOString();

            const values = [
                id,
                input.name,
                input.description || null,
                input.price,
                input.imageUrl || null,
                createdAt,
                input.isActive ? 1 : 0,
                input.categoryId,
                input.stock,
            ];

            const result = await tursoClient.execute(
                `INSERT INTO bakery_items 
                 (id, name, description, price, imageUrl, createdAt, isActive, categoryId, stock)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                values
            );

            // Confirmamo con SELECT
            const check = await tursoClient.execute(
                `SELECT * FROM bakery_items WHERE id = ?`,
                [id]
            );

            return { success: true, message: "Producto agregado exitosamente" };

        } catch (e) {
            console.error("❌ Error al agregar producto:", e);
            return { success: false, message: "Error al agregar producto" };
        }
    }

});

// Actualizar producto
export const updateBakeryItem = defineAction({
    accept: "form",
    input: z.object({
        id: z.string().uuid("El ID no es válido"),
        name: z.string().min(1, "El nombre es obligatorio"),
        description: z.string().optional().or(z.literal("")),
        price: z.preprocess(
            (val) => Number(val),
            z.number().min(0.01, "El precio debe ser mayor a 0")
        ),
        imageUrl: z
            .string()
            .url("La URL de la imagen no es válida")
            .optional()
            .or(z.literal(""))
            .or(z.null()),
        isActive: z.preprocess(
            (val) => val === "true" || val === true,
            z.boolean()
        ),
        categoryId: z.string().min(1),
        stock: z.preprocess((val) => Number(val), z.number().int().min(0, "El stock no puede ser negativo")),
    }),
    handler: async (input, context) => {

        const session = await getSession(context.request);
        if (!session || session.user.role !== "admin") {
            return { success: false, message: "Lo siento, no eres un administrador." };
        }

        try {
            const test = await tursoClient.execute("SELECT COUNT(*) as total FROM bakery_items");
            console.log("📊 Total productos antes del insert:", test.rows);
            await tursoClient.execute(
                `UPDATE bakery_items
                 SET name = ?, description = ?, price = ?, imageUrl = ?, isActive = ?, categoryId = ?, stock = ?
                 WHERE id = ?`, 
                [
                    input.name,
                    input.description ?? null,
                    input.price,
                    input.imageUrl ?? null,
                    input.isActive ? 1 : 0,
                    input.categoryId,
                    input.stock, 
                    input.id,
                ]
            );

            // redirige al listado
            return { success: true, redirectTo: "/admin/products" };

        } catch (e) {
            console.error("Error al actualizar producto:", e);
            return { success: false, message: "Error al actualizar el producto" };
        }
    },
});


// Eliminar producto
export const deleteBakeryItem = defineAction({
    accept: 'form',
    input: z.object({
        id: z.string().uuid("El ID no es válido"),
    }),
    handler: async (input, context) => { 
        const session = await getSession(context.request);
        if (!session || session.user.role !== 'admin') {
            return { success: false, message: "Lo siento, no eres un administrador." };
        }

        try {
            await tursoClient.execute({
                sql: `DELETE FROM bakery_items WHERE id = ?`,
                args: [input.id], 
            });
            return { success: true, message: 'Producto eliminado exitosamente' };
        } catch (e) {
            console.error("Error al eliminar producto:", e);
            return { success: false, message: "Error al eliminar el producto" };
        }
    },
});

// Obtener todos los productos activos
export const getActiveProducts = defineAction({
    accept: "json",
    handler: async (): Promise<{ success: boolean; products: BakeryItem[] }> => {
        try {
            const result = await tursoClient.execute(
                `SELECT id, name, description, price, imageUrl, createdAt, 
                  CAST(isActive AS INT) as isActive, categoryId, stock
           FROM bakery_items 
           WHERE isActive = 1 
           ORDER BY name ASC`
            );

            const products: BakeryItem[] = result.rows.map(({ id, name, description, price, imageUrl, createdAt, isActive, categoryId, stock }: any) => ({
                id,
                name,
                description,
                price: Number(price),
                imageUrl,
                createdAt,
                isActive: Boolean(isActive),
                categoryId,
                stock: Number(stock)
            }));

            return { success: true, products };
        } catch (err) {
            console.error("Error getting products:", err);
            return { success: false, products: [] };
        }
    },
});

// Traer productos por categoría 
export const getProductsByCategory = defineAction({
    accept: "json",
    input: z.object({
        categoryId: z.string().uuid("El ID de categoría no es válido").optional(),
    }),
    handler: async ({ categoryId }) => {
        try {
            const sql = categoryId
                ? `SELECT id, name, description, price, imageUrl, createdAt, 
                    CAST(isActive AS INT) as isActive, categoryId, stock
               FROM bakery_items 
               WHERE categoryId = ? AND isActive = 1 
               ORDER BY name ASC`
                : `SELECT id, name, description, price, imageUrl, createdAt, 
                    CAST(isActive AS INT) as isActive, categoryId, stock
               FROM bakery_items 
               WHERE isActive = 1 
               ORDER BY name ASC`;

            const result = await tursoClient.execute({
                sql,
                args: categoryId ? [categoryId] : [],
            });

            const products: BakeryItem[] = result.rows.map(({ id, name, description, price, imageUrl, createdAt, isActive, categoryId, stock }: any) => ({
                id,
                name,
                description,
                price: Number(price),
                imageUrl,
                createdAt,
                isActive: Boolean(isActive),
                categoryId,
                stock: Number(stock),
            }));

            return { success: true, products };
        } catch (err) {
            console.error("Error getting products by category:", err);
            return { success: false, error: "No se pudieron cargar los productos" };
        }
    },
})


// Cambiar estado activo/inactivo
export const toggleActive = defineAction({
    accept: "form",
    input: z.object({
        id: z.string().uuid("El ID no es válido"),
        isActive: z.preprocess((val) => {
            // Solución: Convierte '1' a true y '0' a false.
            if (val === '1' || val === 1) return true;
            if (val === '0' || val === 0) return false;
            return val; // Devuelve el valor original si no es 1 o 0
        }, z.boolean()),
    }),
    handler: async (input, context) => {
        const session = await getSession(context.request);
        if (!session || session.user.role !== 'admin') {
            return { success: false, message: "Lo siento, no eres un administrador." };
        }

        try {
            await tursoClient.execute({
                sql: `UPDATE bakery_items SET isActive = ? WHERE id = ?`,
                args: [input.isActive ? 1 : 0, input.id],
            });
            return { success: true, message: "Estado actualizado correctamente" };
              
        } catch (e) {
            console.error("Error al cambiar estado:", e);
            return { success: false, message: "Error al cambiar estado" };
        }
    },
})

