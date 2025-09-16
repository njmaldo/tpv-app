import tursoClient from "@/lib/turso";
import { defineAction } from "astro:actions";
import { z } from "astro:schema"; 

export const addCashClosure = defineAction({
  accept: "json",
  input: z.object({
    shift: z.string(),
    userId: z.string(),
    declaredCash: z.number().min(0),
    notes: z.string().optional(),
  }),
  handler: async (input) => {
    const { shift, userId, declaredCash, notes } = input;

    try {
      // 1. Calcular totales desde sales (ventas desde último cierre)
      const salesResult = await tursoClient.execute({
        sql: `
          SELECT paymentMethod, SUM(totalAmount) as total
          FROM sales
          WHERE createdAt >= COALESCE(
            (SELECT MAX(end_time) FROM cash_closures), '1970-01-01'
          )
          GROUP BY paymentMethod
        `,
      });

      let totalCash = 0;
      let totalCard = 0;
      let totalGcash = 0;
      let totalTransfer = 0;
      let totalSales = 0;

      salesResult.rows.forEach((row: any) => {
        const method = row.paymentMethod as string;
        const total = Number(row.total) || 0;

        switch (method) {
          case "cash":
            totalCash += total;
            break;
          case "credit":
          case "debit":
            totalCard += total;
            break;
          case "gcash":
            totalGcash += total;
            break;
          case "transfer":
            totalTransfer += total;
            break;
        }
        totalSales += total;
      });

      // 2. Calcular diferencia
      const diff = declaredCash - totalCash;
      const startTime = new Date().toISOString(); // podrías traer de "apertura"
      const endTime = new Date().toISOString();

      // 3. Insertar en cash_closures
      await tursoClient.execute({
        sql: `
          INSERT INTO cash_closures (
            id, shift, user_id, start_time, end_time,
            total_cash, total_card, total_sales, diff, notes, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          crypto.randomUUID(),
          shift,
          userId,
          startTime,
          endTime,
          totalCash,
          totalCard + totalGcash + totalTransfer,
          totalSales,
          diff,
          notes || "",
          new Date().toISOString(),
        ],
      });
      
      return {
        success: true,
        message: "Cierre de caja registrado con éxito",
        data: {
          totalCash,
          declaredCash,
          diff,
          totalSales,
        },
      };
    } catch (e: any) {
      console.error("❌ Error en cierre de caja:", e);
      return { success: false, message: e.message || "Error en cierre de caja." };
    }
  },
});
