
import type { PurchaseWithSupplier } from "@/interfaces/Purchase";
import tursoClient from "@/lib/turso";

export type CompraRow = {
  id: string;
  fecha: string;
  monto: number;
  descripcion: string | null;
  proveedor: string | null;
};

// Listar todas las compras (con proveedor)
export async function getCompras(): Promise<CompraRow[]> {
  try {
    const result = await tursoClient.execute(`
      SELECT c.id, c.fecha, c.monto, c.descripcion,
             p.name as proveedor
      FROM compras c
      LEFT JOIN suppliers p ON c.proveedorId = p.id
      ORDER BY c.fecha DESC
    `);

    const rows = result.rows ?? [];
    return (rows as any[]).map((r) => ({
      id: String(r.id),
      fecha: String(r.fecha),
      monto: Number(r.monto ?? 0),
      descripcion: r.descripcion == null ? null : String(r.descripcion),
      proveedor: r.proveedor == null ? null : String(r.proveedor),
    }));
  } catch (err) {
    console.error("Error en getCompras:", err);
    return [];
  }
}

// Total gastado mes actual
export async function getMonthlyPurchasesTotal(): Promise<number> {
  const mes = new Date().toISOString().slice(0, 7); // YYYY-MM

  const result = await tursoClient.execute(
    `SELECT SUM(total) as total FROM purchases WHERE strftime('%Y-%m', purchaseDate) = ?`,
    [mes]
  );

  const row = result.rows[0];
  return row?.total ? Number(row.total) : 0;
}


// Total gastado hoy
export async function getDailyPurchasesTotal(): Promise<number> {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const result = await tursoClient.execute(
    `SELECT SUM(total) as total FROM purchases WHERE DATE(purchaseDate) = ?`,
    [today]
  );

  const row = result.rows[0];
  return row?.total ? Number(row.total) : 0;
}

// KPIs generales de compras
export async function getComprasStats(): Promise<{ cantidad: number; total: number; promedio: number }> {
  try {
    const result = await tursoClient.execute(`
      SELECT 
        COUNT(*) as cantidad,
        IFNULL(SUM(monto), 0) as total,
        IFNULL(AVG(monto), 0) as promedio
      FROM compras
    `);

    const row = (result.rows?.[0] ?? {}) as any;
    return {
      cantidad: Number(row.cantidad ?? 0),
      total: Number(row.total ?? 0),
      promedio: Number(row.promedio ?? 0),
    };
  } catch (err) {
    console.error("Error en getComprasStats:", err);
    return { cantidad: 0, total: 0, promedio: 0 };
  }
}

// Total de compras efectuadas  
export async function getPurchasesCount(): Promise<number> {
  try {
    const result = await tursoClient.execute(
      `SELECT COUNT(*) as count FROM purchases`
    );

    const row = result.rows[0];
    return row?.count ? Number(row.count) : 0;
  } catch (err) {
    console.error("Error en getPurchasesCount:", err);
    return 0;
  }
}

//compras promedio
export async function getAveragePurchase(): Promise<number> {
  try {
    const result = await tursoClient.execute(
      `SELECT IFNULL(AVG(total), 0) as average FROM purchases`
    );

    const row = result.rows[0];
    return row?.average ? Number(row.average) : 0;
  } catch (err) {
    console.error("Error en getAveragePurchase:", err);
    return 0;
  }
}

// Compáración diaria
export async function getDailyComparison(): Promise<{
  today: number;
  yesterday: number;
  changePercent: number;
}> {
  try {
    const todayDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const yesterdayDate = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    const result = await tursoClient.execute({
      sql: `
        SELECT 
          SUM(CASE WHEN DATE(purchaseDate) = ? THEN total ELSE 0 END) as todayTotal,
          SUM(CASE WHEN DATE(purchaseDate) = ? THEN total ELSE 0 END) as yesterdayTotal
        FROM purchases
      `,
      args: [todayDate, yesterdayDate],
    });

    const row = (result.rows?.[0] ?? {}) as any;
    const today = Number(row.todayTotal ?? 0);
    const yesterday = Number(row.yesterdayTotal ?? 0);

    let changePercent = 0;
    if (yesterday > 0) {
      changePercent = ((today - yesterday) / yesterday) * 100;
    }

    return { today, yesterday, changePercent };
  } catch (err) {
    console.error("Error en getDailyComparison:", err);
    return { today: 0, yesterday: 0, changePercent: 0 };
  }
}

// Comparación Mensual
export async function getMonthlyComparison(): Promise<{
  thisMonth: number;
  lastMonth: number;
  changePercent: number;
}> {
  try {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7); // YYYY-MM

    // Mes anterior
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.toISOString().slice(0, 7);

    const result = await tursoClient.execute({
      sql: `
        SELECT 
          SUM(CASE WHEN strftime('%Y-%m', purchaseDate) = ? THEN total ELSE 0 END) as thisMonthTotal,
          SUM(CASE WHEN strftime('%Y-%m', purchaseDate) = ? THEN total ELSE 0 END) as lastMonthTotal
        FROM purchases
      `,
      args: [thisMonth, lastMonth],
    });

    const row = (result.rows?.[0] ?? {}) as any;
    const thisMonthTotal = Number(row.thisMonthTotal ?? 0);
    const lastMonthTotal = Number(row.lastMonthTotal ?? 0);

    let changePercent = 0;
    if (lastMonthTotal > 0) {
      changePercent = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    }

    return {
      thisMonth: thisMonthTotal,
      lastMonth: lastMonthTotal,
      changePercent,
    };
  } catch (err) {
    console.error("Error en getMonthlyComparison:", err);
    return { thisMonth: 0, lastMonth: 0, changePercent: 0 };
  }
}

//compreas Ultimos 30 días
export async function getLast30DaysPurchases(limit?: number): Promise<PurchaseWithSupplier[]> {
  try {
    const baseQuery = `
      SELECT 
        p.*, 
        s.name AS supplierName
      FROM purchases p
      JOIN suppliers s ON p.supplierId = s.id
      WHERE date(p.purchaseDate) >= date('now', '-30 day')
      ORDER BY p.purchaseDate DESC
    `;

    const sql = limit ? `${baseQuery} LIMIT ${limit}` : baseQuery;

    const result = await tursoClient.execute(sql);

    return result.rows.map((r: any) => ({
      id: r.id,
      productName: r.productName,
      supplierId: r.supplierId,
      supplierName: r.supplierName,
      quantity: Number(r.quantity),
      unitPrice: Number(r.unitPrice),
      total: Number(r.total),
      purchaseDate: r.purchaseDate,
      createdAt: r.createdAt,
    })) as PurchaseWithSupplier[];
  } catch (err) {
    console.error("Error en getLastPurchases:", err);
    return [];
  }
}

// Top suppliers
export async function getTopSuppliers(limit = 5) {
  try {
    const result = await tursoClient.execute(`
      SELECT 
        s.id,
        s.name,
        SUM(p.total) AS totalComprado
      FROM purchases p
      JOIN suppliers s ON p.supplierId = s.id
      GROUP BY s.id, s.name
      ORDER BY totalComprado DESC
      LIMIT ?
    `, [limit]);

    // Calcular total global para porcentajes
    const totalGeneral = result.rows.reduce(
      (acc: number, r: any) => acc + Number(r.totalComprado),
      0
    );

    return result.rows.map((r: any) => ({
      supplierId: r.id,
      name: r.name,
      totalComprado: Number(r.totalComprado),
      porcentaje: totalGeneral > 0 ? (Number(r.totalComprado) / totalGeneral) * 100 : 0
    }));
  } catch (err) {
    console.error("Error en getTopSuppliers:", err);
    return [];
  }
}
