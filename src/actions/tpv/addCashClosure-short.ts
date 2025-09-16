import { defineAction } from "astro:actions";
import { z } from "zod";
import { CashClosures, db} from "astro:db";

export const addCashClosure = defineAction({
  accept: "json",
  input: z.object({
    shift: z.string(),
    userId: z.string(),
    startTime: z.number(),
    endTime: z.number(),
    totalCash: z.number(),
    totalCredit: z.number(),
    totalDebit: z.number(),
    totalTransfer: z.number(),
    totalGcash: z.number(),
    totalSales: z.number(),
    declaredCash: z.number().optional(),
    diff: z.number().optional(),
    notes: z.string().optional(),
  }),
  handler: async (input) => {
    try {
      await db.insert(CashClosures).values([
        {
          id: crypto.randomUUID(),
          ...input,
          createdAt: new Date().toISOString(),
        },
      ]);

      return { success: true, message: "Cierre de caja registrado con éxito." };
    } catch (e: any) {
      console.error("❌ Error en addCashClosure:", e);
      return { success: false, message: "Error al registrar cierre de caja." };
    }
  },
});
