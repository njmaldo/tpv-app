
import { defineAction } from "astro:actions";
import { v4 as uuidv4 } from "uuid";
import { z } from "astro/zod";
import tursoClient from "@/lib/turso";
import type { Supplier } from "@/interfaces/Supplier";

// Crear un Proveedor
export const createSupplier = defineAction({
  accept: "form",
  input: z.object({
    name: z.string().min(1),
    productType: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    city: z.string().optional(),
  }),

  handler: async (input, context) => {
    // console.log("👉 Input recibido en crearProveedor:", input);
    try {
      //Validar email 
      if (input.email) {
        const existingEmail = await tursoClient.execute(
          `SELECT id FROM suppliers WHERE email = ?`,
          [input.email]
        );

        if (existingEmail.rows.length > 0) {
          return {
            success: false,
            message: "Ya existe un proveedor con ese email",
          };
        }
      }

      //Validar nombre
      const existingName = await tursoClient.execute(
        `SELECT id FROM suppliers WHERE name = ?`,
        [input.name]
      );

      if (existingName.rows.length > 0) {
        return {
          success: false,
          message: "Ya existe un proveedor con ese nombre",
        };
      }

      // Insertar proveedor
      const id = uuidv4();
      const createdAt = new Date().toISOString();

      await tursoClient.execute(
        `INSERT INTO suppliers (id, name, productType, phone, email, city, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.name,
          input.productType || null,
          input.phone || null,
          input.email || null,
          input.city || null,
          createdAt,
        ]
      );

      return { success: true, message: "Proveedor agregado exitosamente" };
    } catch (e) {
      console.error("❌ Error al crear proveedor:", e);
      return { success: false, message: "Error al crear proveedor" };
    }
  },
});


// Editar proveedor
export const updateSupplier = defineAction({
  accept: "form",
  input: z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    productType: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    city: z.string().optional(),
  }),

  handler: async (input, context) => {
    // console.log("👉 Input recibido en editarProveedor:", input);

    try {
      await tursoClient.execute(
        `UPDATE suppliers 
         SET name = ?, productType = ?, phone = ?, email = ?, city = ?
         WHERE id = ?`,
        [
          input.name,
          input.productType || null,
          input.phone || null,
          input.email || null,
          input.city || null,
          input.id,
        ]
      );

      // Confirmar cambios
      const check = await tursoClient.execute(
        `SELECT * FROM suppliers WHERE id = ?`,
        [input.id]
      );

      if (check.rows.length === 0) {
        return { success: false, message: "Proveedor no encontrado" };
      }

      return { success: true, data: check.rows[0] };
    } catch (e) {
      console.error("❌ Error al editar proveedor:", e);
      return { success: false, message: "Error al editar proveedor" };
    }
  },
});

// Borrar proveedor
export const deleteSupplier = defineAction({
  accept: "form",
  input: z.object({
    id: z.string().uuid(),
  }),

  handler: async (input, context) => {
    console.log("👉 Input recibido en borrarProveedor:", input);

    try {
      // Verificar si existe
      const existing = await tursoClient.execute(
        `SELECT * FROM suppliers WHERE id = ?`,
        [input.id]
      );

      if (existing.rows.length === 0) {
        return { success: false, message: "Proveedor no encontrado" };
      }

      // Borrar
      await tursoClient.execute(
        `DELETE FROM suppliers WHERE id = ?`,
        [input.id]
      );

      return { success: true, message: "Proveedor eliminado exitosamente" };
    } catch (e) {
      console.error("❌ Error al borrar proveedor:", e);
      return { success: false, message: "Error al borrar proveedor" };
    }
  },
});

// Listar Proveedores
export const listSuppliers = defineAction({
  accept: "json",
  input: z.void(),
  
  handler: async (): Promise<Supplier[]> => {
    try {
      const result = await tursoClient.execute(
        `SELECT * FROM suppliers ORDER BY name ASC`
      );

      const suppliers = result.rows.map((r) => ({
        id: r.id as string,
        name: r.name as string,
        productType: r.productType as string | null,
        phone: r.phone as string | null,
        email: r.email as string | null,
        city: r.city as string | null,
        createdAt: r.createdAt as string,
      })) as Supplier[];

      return suppliers;
    } catch (e) {
      console.error("❌ Error al listar proveedores:", e);
      
      return []; 
    }
  },
});
