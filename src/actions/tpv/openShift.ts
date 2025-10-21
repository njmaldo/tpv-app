import crypto from "crypto";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import tursoClient from "@/lib/turso";


export const openShift = defineAction({
  input: z.object({
    shift: z.enum(["morning","afternoon", "evening"]),
    userId: z.string(),
    declaredCash: z.number().default(0),
    notes: z.string().optional(),
  }),

  handler: async ({ shift, userId, declaredCash, notes }) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await tursoClient.execute({
      sql: `
        INSERT INTO cash_closures (
          id, shift, user_id, start_time, end_time, declared_cash, notes, created_at
        ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?)
      `,
      args: [id, shift, userId, now, declaredCash, notes ?? "", now],
    });

    return { success: true, id };
  },
});
