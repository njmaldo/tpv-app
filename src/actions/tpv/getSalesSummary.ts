import { defineAction } from "astro:actions";
import { db, Sales } from "astro:db";

// Action para obtener resumen de ventas
export const getSalesSummary = defineAction({
  accept: "json",
  handler: async () => {
    try {
      // Inicio del día de hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Traigo todas las ventas
      const sales = await db.select().from(Sales);

      // Filtrado en memoria (convirtiendo createdAt a Date)
      const todaySales = sales.filter((sale) => {
        try {
          const created = new Date(sale.createdAt);
          return created >= today;
        } catch {
          return false;
        }
      });

      // Totales por método de pago
      let totalCash = 0;
      let totalCredit = 0;
      let totalDebit = 0;
      let totalTransfer = 0;
      let totalGcash = 0;

      for (const sale of todaySales) {
        const method = (sale.paymentMethod || "").toString().toLowerCase();
        const amount = Number(sale.totalAmount) || 0;

        console.log("🔎 Procesando venta:", {
          id: sale.id,
          createdAt: sale.createdAt,
          paymentMethod: method,
          totalAmount: sale.totalAmount,
          parsedAmount: amount,
        });

        switch (method) {
          case "cash":
            totalCash += amount;
            break;
          case "credit":
            totalCredit += amount;
            break;
          case "debit":
            totalDebit += amount;
            break;
          case "transfer":
            totalTransfer += amount;
            break;
          case "gcash":
            totalGcash += amount;
            break;
        }
      }

      const totalSales =
        totalCash + totalCredit + totalDebit + totalTransfer + totalGcash;

      return {
        success: true,
        data: {
          totalCash,
          totalCredit,
          totalDebit,
          totalTransfer,
          totalGcash,
          totalSales,
        },
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
