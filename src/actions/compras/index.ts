import { z } from "astro:schema";
import { defineAction } from "astro:actions";
import { v4 as uuidv4 } from "uuid";
import tursoClient from "@/lib/turso";
import type { Purchase, PurchaseWithSupplier } from "@/interfaces/Purchase";


// Crear una compra
export const createPurchase = defineAction({
  accept: "form",
  input: z.object({
    productName: z.string(),
    supplierId: z.string().min(1, "Proveedor obligatorio"),
    quantity: z.preprocess(
      (val) => Number(val),
      z.number().int().min(1, "Cantidad mínima 1")
    ),
    unitPrice: z.preprocess(
      (val) => Number(val),
      z.number().positive("Precio unitario debe ser mayor a 0")
    ),
    purchaseDate: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.union([z.string().transform((val) => new Date(val)), z.literal("")]).optional()
    ),
  }),

  handler: async (input) => {
    console.log("👉 Input recibido en addBakeryItem:", input);
    try {
      const id = uuidv4();
      
      const purchaseDate = input.purchaseDate
        ? input.purchaseDate.toISOString().split("T")[0] // YYYY-MM-DD
        : null; // Si no hay fecha, pasa null

      await tursoClient.execute({
        sql: `
          INSERT INTO purchases (id, productName, supplierId, quantity, unitPrice, purchaseDate)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
          id,
          input.productName,
          input.supplierId,
          input.quantity,
          input.unitPrice,
          purchaseDate, 
        ],
      });

      return { success: true, id };
    } catch (err) {
      console.error("❌ Error en createPurchase:", err);
      return { success: false, message: "No se pudo crear la compra" };
    }
  },
});

// Editar una compra existente
export const updatePurchase = defineAction({
  accept: "form",
  handler: async (formData) => {
    try {
      const id = formData.get("id") as string;
      const supplierId = formData.get("supplierId") as string;
      const purchaseDate = formData.get("purchaseDate") as string;
      const productName = formData.get("productName") as string;
      const quantity = Number(formData.get("quantity"));
      const unitPrice = Number(formData.get("unitPrice"));

      await tursoClient.execute({
        sql: `
          UPDATE purchases
          SET supplierId = ?, purchaseDate = ?, productName = ?, quantity = ?, unitPrice = ?
          WHERE id = ?
        `,
        args: [supplierId, purchaseDate, productName, quantity, unitPrice, id],
      });

      return { success: true };
    } catch (err) {
      console.error("Error en updatePurchase:", err);
      return { success: false, message: "No se pudo actualizar la compra" };
    }
  },
});

// Eliminar una compra
export const deletePurchase = defineAction({
  accept: "form",
  handler: async (formData) => {
    try {
      const id = formData.get("id") as string;

      await tursoClient.execute({
        sql: `DELETE FROM purchases WHERE id = ?`,
        args: [id],
      });

      return { success: true };
    } catch (err) {
      console.error("Error en deleteCompra:", err);
      return { success: false, message: "No se pudo eliminar la compra" };
    }
  },
});

// Listar Compras
export const listPurchases = defineAction({
  accept: "json",
  input: z.void(),
  handler: async (): Promise<PurchaseWithSupplier[]> => {
    try {
      const result = await tursoClient.execute(`
        SELECT 
          p.id,
          p.productName,
          p.supplierId,
          s.name AS supplierName,   
          p.quantity,
          p.unitPrice,
          p.total,
          p.purchaseDate,
          p.createdAt
        FROM purchases p
        LEFT JOIN suppliers s ON s.id = p.supplierId
        ORDER BY p.purchaseDate DESC
      `);

      const purchases = result.rows.map((r) => ({
        id: r.id as string,
        productName: r.productName as string,
        supplierId: r.supplierId as string,
        supplierName: r.supplierName as string, //viene del JOIN
        quantity: Number(r.quantity),
        unitPrice: Number(r.unitPrice),
        total: Number(r.total),
        purchaseDate: r.purchaseDate as string,
        createdAt: r.createdAt as string,
      })) as PurchaseWithSupplier[];

      return purchases;
    } catch (e) {
      console.error("❌ Error al listar compras:", e);
      throw new Error("Error al listar compras");
    }
  },
});
