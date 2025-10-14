import tursoClient from "@/lib/turso";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

// Comprobar si ya existe un cierre de caja para el turno actual
export const checkCashClosure = defineAction({
  accept: "json",
  input: z.object({
    userId: z.string(),
  }),
  handler: async ({ userId }) => {
    try {
      // Buscar el último registro de turno para este user
      const result = await tursoClient.execute({
        sql: `
          SELECT c.shift, c.start_time, c.end_time, c.user_id,
                u.name AS user_name, u.email AS user_email
          FROM cash_closures c
          JOIN "User" u ON u.id = c.user_id
          WHERE c.user_id = ?
          ORDER BY c.start_time DESC
          LIMIT 1;
        `,
        args: [userId],
      });

      if (result.rows.length === 0) {
        return {
          success: true,
          shift: null,
          open: false,
          closed: false,
          message: "No shifts found for this user.",
        };
      }

      const { shift, end_time, user_id, user_name, user_email } = result.rows[0];

      return {
        success: true,
        shift,
        open: !end_time,
        closed: !!end_time,
        closure: {
          shift,
          user_id,
          user_name,
          user_email,
        },
      };
    } catch (err) {
      console.error("❌ Error en checkCashClosure:", err);
      return {
        success: false,
        shift: null,
        open: false,
        closed: false,
        message: "Internal error verifying cash closure.",
      };
    }
  },
});