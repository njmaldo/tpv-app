import { defineAction } from "astro:actions";
import { z } from "zod";
import tursoClient from "@/lib/turso";

// Esquema para un producto en la venta
const SaleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1."),
  price: z.number().min(0.01, "El precio debe ser un número positivo."),
});

// Esquema completo de la venta
const AddSaleInputSchema = z.object({
  items: z.array(SaleItemSchema).min(1, "El carrito no puede estar vacío."),
  totalAmount: z.number().min(0.01, "El monto total debe ser un número positivo."),
  paymentMethod: z.enum(["cash", "credit", "debit", "transfer", "gcash"]),
});

export const addSale = defineAction({
  accept: "json",
  input: AddSaleInputSchema,

  handler: async (input) => {
    const { items, totalAmount, paymentMethod } = input;
    const saleId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    try {
      // Validar stock antes de continuar
      for (const item of items) {
        const result = await tursoClient.execute({
          sql: "SELECT stock FROM bakery_items WHERE id = ?",
          args: [item.productId],
        });

        const stock = result.rows[0]?.stock as number | undefined;

        if (stock === undefined) {
          throw new Error(`El producto con ID ${item.productId} no existe.`);
        }

        if (stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para el producto ${item.productId}. Disponible: ${stock}, solicitado: ${item.quantity}`,
          );
        }
      }

      // Preparo queries para batch
      const queries = [];

      // Insertar venta (ahora con paymentMethod)
      queries.push({
        sql: "INSERT INTO sales (id, totalAmount, createdAt, paymentMethod) VALUES (?, ?, ?, ?)",
        args: [saleId, totalAmount, createdAt, paymentMethod],
      });

      // Insertar ítems y actualizar stock
      for (const item of items) {
        queries.push({
          sql: "INSERT INTO sale_items (saleId, productId, quantity, price) VALUES (?, ?, ?, ?)",
          args: [saleId, item.productId, item.quantity, item.price],
        });

        queries.push({
          sql: "UPDATE bakery_items SET stock = stock - ? WHERE id = ?",
          args: [item.quantity, item.productId],
        });
      }

      // Ejecutar en batch
      await tursoClient.batch(queries);

      return {
        success: true,
        saleId, // devuelvo el id de la venta
        message: "Sale successfully registered!",
      };
    } catch (e: any) {
      console.error("❌ Error registering the sale:", e);
      return {
        success: false,
        message: e.message || "Error registering the sale.",
      };
    }
  },
});
