import tursoClient from "@/lib/turso";
import { defineAction } from "astro:actions";


// Obtener resumen de ventas
export const getSalesSummary = defineAction({
  accept: "json",
  handler: async () => {
    try {
      // 1. Buscar la última apertura de turno (start_time)
      const lastOpenShift = await tursoClient.execute({
        sql: `
          SELECT start_time FROM cash_closures
          WHERE end_time IS NULL
          ORDER BY start_time DESC
          LIMIT 1
        `,
      });

      const startTime = lastOpenShift.rows[0]?.start_time;
      if (!startTime) {
        // No hay un turno abierto, devuelve 0 para todos los totales
        return {
          success: true,
          data: {
            totalCash: 0,
            totalCredit: 0,
            totalDebit: 0,
            totalTransfer: 0,
            totalGcash: 0,
            totalSales: 0,
          },
        };
      }

      // 2. Obtener el resumen de ventas del turno actual
      const salesResult = await tursoClient.execute({
        sql: `
          SELECT paymentMethod, SUM(totalAmount) as total
          FROM sales
          WHERE createdAt >= ?
          GROUP BY paymentMethod
        `,
        args: [startTime],
      });
      // 3. Procesar los totales directamente del resultado de la consulta
      let totals = {
        totalCash: 0,
        totalCredit: 0,
        totalDebit: 0,
        totalTransfer: 0,
        totalGcash: 0,
        totalSales: 0,
      };

      for (const row of salesResult.rows) {
        const method = (row.paymentMethod as string).toLowerCase();
        const amount = Number(row.total) || 0;

        switch (method) {
          case "cash":
            totals.totalCash += amount;
            break;
          case "credit":
            totals.totalCredit += amount;
            break;
          case "debit":
            totals.totalDebit += amount;
            break;
          case "transfer":
            totals.totalTransfer += amount;
            break;
          case "gcash":
            totals.totalGcash += amount;
            break;
        }
        totals.totalSales += amount; // Suma al total general
      }

      return {
        success: true,
        data: totals,
      };
    } catch (e: any) {
      console.error("❌ Error en getSalesSummary:", e);
      return {
        success: false,
        message: "Error al calcular resumen de ventas.",
      };
    }
  },
});