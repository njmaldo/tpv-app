import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import tursoClient from "@/lib/turso";

export const closeShift = defineAction({
  input: z.object({
    closureId: z.string().optional(),
    declaredCash: z.number(),
    notes: z.string().optional(),
    totals: z.object({
      totalCash: z.number(),
      totalCredit: z.number(),
      totalDebit: z.number(),
      totalTransfer: z.number(),
      totalGcash: z.number(),
      totalSales: z.number(),
    }),
  }),

  handler: async ({ closureId, declaredCash, notes, totals }) => {
    try {
      // 1️ Buscar el turno abierto si no se pasa closureId
      const r = await tursoClient.execute({
        sql: closureId
          ? `SELECT id, shift FROM cash_closures WHERE id = ? AND end_time IS NULL`
          : `SELECT id, shift FROM cash_closures WHERE end_time IS NULL ORDER BY start_time DESC LIMIT 1`,
        args: closureId ? [closureId] : [],
      });

      const row = r.rows[0];
      if (!row) {
        return { success: false, error: "No open shift found" };
      }

      const idToClose = row.id as string;

      // 2️ Usamos los totales ya calculados en frontend
      const {
        totalCash,
        totalCredit,
        totalDebit,
        totalTransfer,
        totalGcash,
        totalSales,
      } = totals;

      // 3️ Calcular diferencia
      const diff = declaredCash - totalSales;

      // 4️ Actualizar la fila de cash_closures con totales y cierre
      await tursoClient.execute({
        sql: `
          UPDATE cash_closures
          SET 
            end_time = datetime('now'),
            total_cash = ?,
            total_credit = ?,
            total_debit = ?,
            total_transfer = ?,
            total_gcash = ?,
            total_sales = ?,
            declared_cash = ?,
            diff = ?,
            notes = COALESCE(notes, '') || ?,
            created_at = datetime('now')
          WHERE id = ?
        `,
        args: [
          totalCash,
          totalCredit,
          totalDebit,
          totalTransfer,
          totalGcash,
          totalSales,
          declaredCash,
          diff,
          `\nCierre: ${notes ?? ""}`,
          idToClose,
        ],
      });

      return { success: true, id: idToClose, totals, diff };

    } catch (err) {
      console.error("❌ Error en closeShift:", err);
      return { success: false, error: "Error al registrar el cierre de turno." };
    }
  },
});
