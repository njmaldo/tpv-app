
import tursoClient from "@/lib/turso";
import { db } from "astro:db";

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
