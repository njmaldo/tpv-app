
import tursoClient from "@/lib/turso";

// 📅 Ventas diarias
export async function getDailySales() {
  try {
    const hoy = new Date().toISOString().split("T")[0];
    const result = await tursoClient.execute({
      sql: `SELECT IFNULL(SUM(totalAmount), 0) as total FROM sales WHERE date(createdAt) = ?`,
      args: [hoy],
    });

    const total = Number(result.rows?.[0]?.total ?? 0);
    return { success: true, totalHoy: total };
  } catch (e) {
    console.error("Error en getDailySales:", e);
    return { success: false, totalHoy: 0 };
  }
}

// 📊 Ventas mensuales
export async function getMonthlySales() {
  try {
    const mes = new Date().toISOString().slice(0, 7); // YYYY-MM
    const result = await tursoClient.execute({
      sql: `SELECT IFNULL(SUM(totalAmount), 0) as total FROM sales WHERE strftime('%Y-%m', createdAt) = ?`,
      args: [mes],
    });

    const total = Number(result.rows?.[0]?.total ?? 0);
    return { success: true, totalMes: total };
  } catch (e) {
    console.error("Error en getMonthlySales:", e);
    return { success: false, totalMes: 0 };
  }
}

// 📦 Productos con bajo stock
export type Producto = {
  id: string;
  name: string;
  stock: number;
};

export async function getLowStock(): Promise<Producto[]> {
  try {
    const threshold = 5;
    const result = await tursoClient.execute({
      sql: `SELECT id, name, stock FROM bakery_items WHERE stock <= ? ORDER BY stock ASC`,
      args: [threshold],
    });

    return (result.rows ?? []).map((r: any) => ({
      id: String(r.id),
      name: String(r.name),
      stock: Number(r.stock ?? 0),
    }));
  } catch (e) {
    console.error("Error en getLowStock:", e);
    return [];
  }
}

// 📊 Productos activos / inactivos
export async function getActiveInactiveProducts() {
  try {
    const result = await tursoClient.execute(`
      SELECT 
        SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) as inactivos
      FROM bakery_items
    `);

    return {
      success: true,
      activos: Number(result.rows[0].activos),
      inactivos: Number(result.rows[0].inactivos),
    };
  } catch (err) {
    console.error("Error en getActiveInactiveProducts:", err);
    return { success: false, activos: 0, inactivos: 0 };
  }
}

// Total de productos
export async function getTotalProducts(): Promise<{ success: boolean; total: number }> {
  try {
    const result = await tursoClient.execute({
      sql: `SELECT COUNT(*) as total FROM bakery_items`,
    });
    const total = Number(result.rows?.[0]?.total ?? 0);
    return { success: true, total };
  } catch (e) {
    console.error("Error en getTotalProducts:", e);
    return { success: false, total: 0 };
  }
}

// Listado de productos con indicador "Nuevo"
export async function getProducts() {
  const result = await tursoClient.execute({
    sql: `SELECT id, name, price, category, isActive, createdAt FROM bakery_items ORDER BY createdAt DESC`,
  });

  const rows = result.rows ?? [];

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    price: r.price,
    category: r.category,
    isActive: r.isActive === 1,
    createdAt: r.createdAt,
    isNew: new Date(r.createdAt) > sevenDaysAgo, 
  }));
}

// inventario total
export async function getInventoryValue() {
  const result = await tursoClient.execute({
    sql: `SELECT SUM(stock * price) as totalValue FROM bakery_items WHERE isActive = 1`
  });

  const totalValue = Number((result.rows[0] as any).totalValue) || 0;

  return { totalValue };
}
// Inventario mes anterior
export async function getLastMonthInventoryValue() {
  const result = await tursoClient.execute(`
    SELECT SUM(stock * price) as totalValue
    FROM bakery_items
    WHERE strftime('%m', createdAt) = strftime('%m', date('now', '-1 month'))
  `);

  const row = result.rows[0] as unknown as { totalValue: number | null };

  return { totalValue: row.totalValue ?? 0 };
}

// Promedio de ITEMS
export async function getInventoryStats() {
  const result = await tursoClient.execute(`
    SELECT SUM(stock) as totalUnits, 
           AVG(price) as avgPrice
    FROM bakery_items
  `);

  const row = result.rows[0] as unknown as { totalUnits: number | null, avgPrice: number | null };
  
  return {
    totalUnits: row.totalUnits ?? 0,
    avgPrice: row.avgPrice ?? 0
  };
}

// Series 
// Diaria
export async function getDailySalesSeries() {
  const result = await tursoClient.execute({
    sql: `
      SELECT 
        strftime('%m-%d', createdAt) AS label,
        SUM(totalAmount) AS total
      FROM Sales
      WHERE createdAt >= date('now', '-6 days')
      GROUP BY label
      ORDER BY label ASC
    `,
    args: [],
  });

  return result.rows.map((r) => ({
    date: r.label as string,
    total: Number(r.total) || 0,
  }));
}

// Mensual
export async function getMonthlySalesSeries() {
  const result = await tursoClient.execute({
    sql: `
      SELECT 
        strftime('%m', createdAt) AS month,
        SUM(totalAmount) AS total
      FROM Sales
      WHERE createdAt >= date('now', '-5 months')
      GROUP BY month
      ORDER BY month ASC
    `,
    args: [],
  });

  return result.rows.map((r) => ({
    month: r.month as string,
    total: Number(r.total) || 0,
  }));
}

// Stock
export async function getLowStockSeries() {
  const result = await tursoClient.execute({
    sql: `
      SELECT 
        name,
        stock
      FROM bakery_items
      WHERE stock <= 10
      ORDER BY stock ASC
      LIMIT 7
    `,
    args: [],
  });

  return result.rows.map((r) => ({
    name: r.name as string,
    stock: Number(r.stock),
  }));
}

// Finanzas 
export async function getMonthlyFinance() {
  // Ventas mensuales
  const sales = await tursoClient.execute({
    sql: `
      SELECT SUM(totalAmount) AS total
      FROM Sales
      WHERE substr(createdAt, 1, 7) = strftime('%Y-%m', 'now')
    `,
  });

  // Compras mensuales
  const purchases = await tursoClient.execute({
    sql: `
      SELECT SUM(total) AS total
      FROM Purchases
      WHERE substr(purchaseDate, 1, 7) = strftime('%Y-%m', 'now')
    `,
  });

  const monthlySales = Number(sales.rows[0].total || 0);
  const monthlyPurchases = Number(purchases.rows[0].total || 0);

  return { monthlySales, monthlyPurchases };
}

export async function getTotalsByPeriod() {
  const query = async (months: number) => {
    const sales = await tursoClient.execute({
      sql: `
        SELECT SUM(totalAmount) AS total 
        FROM Sales 
        WHERE date(substr(createdAt, 1, 10)) >= date('now', ?)
      `,
      args: [`-${months} months`],
    });

    const purchases = await tursoClient.execute({
      sql: `
        SELECT SUM(total) AS total 
        FROM Purchases 
        WHERE date(purchaseDate) >= date('now', ?)
      `,
      args: [`-${months} months`],
    });

    const total = Number(sales.rows[0].total || 0) - Number(purchases.rows[0].total || 0);
    return total;
  };

  return {
    quarterTotal: await query(3),
    semesterTotal: await query(6),
    annualTotal: await query(12),
  };
}

// Monthly Finance data 
export async function getMonthlyFinanceTrend() {
  // Trae los últimos 12 meses de ventas
  const sales = await tursoClient.execute({
    sql: `
      SELECT 
        strftime('%Y-%m', REPLACE(REPLACE(createdAt, 'T', ' '), 'Z', '')) AS month,
        SUM(totalAmount) AS total
      FROM Sales
      WHERE date(substr(createdAt, 1, 10)) >= date('now', '-12 months')
      GROUP BY month
      ORDER BY month ASC;
    `
  });

  // Trae los últimos 12 meses de compras
  const purchases = await tursoClient.execute({
    sql: `
      SELECT 
        strftime('%Y-%m', REPLACE(REPLACE(purchaseDate, 'T', ' '), 'Z', '')) AS month,
        SUM(total) AS total
      FROM Purchases
      WHERE date(purchaseDate) >= date('now', '-12 months')
      GROUP BY month
      ORDER BY month ASC;
    `
  });

  // Convertir resultados en diccionarios { '2025-05': 1234.56, ... }
  const salesMap = Object.fromEntries(
    sales.rows.map(r => [r.month, Number(r.total || 0)])
  );

  const purchasesMap = Object.fromEntries(
    purchases.rows.map(r => [r.month, Number(r.total || 0)])
  );

  // Crear rango de los últimos 12 meses (aunque algún mes no tenga datos)
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    months.push(`${y}-${m}`);
  }

  // Unir todo en un array final
  const trend = months.map(month => {
    const sales = salesMap[month] || 0;
    const purchases = purchasesMap[month] || 0;
    return {
      month,
      sales,
      purchases,
      net: sales - purchases
    };
  });

  return trend;
}