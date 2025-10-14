import tursoClient from "@/lib/turso";
import { defineAction } from "astro:actions";

export const checkOpenShift = defineAction({
  accept: "json",
  handler: async () => {
    try {
      const result = await tursoClient.execute({
        sql: `
          SELECT shift
          FROM cash_closures
          WHERE end_time IS NULL
          LIMIT 1;
        `,
      });

      if (result.rows.length > 0) {
        return {
          success: true,
          open: true,
          shift: result.rows[0].shift, // Devuelve el turno abierto
        };
      }

      return {
        success: true,
        open: false, //No hay turno abierto
      };
    } catch (err) {
      console.error("❌ Error en checkOpenShift:", err);
      return {
        success: false,
        open: false,
        error: "DB error",
      };
    }
  },
});



