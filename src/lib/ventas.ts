import tursoClient from "./turso";


// Total de ventas del día (₱ + cantidad tickets)
export async function getTodaySales() {
   const result = await tursoClient.execute({
    sql: `
      SELECT 
        COALESCE(SUM(totalAmount), 0) AS total_sales,
        COUNT(*) AS total_tickets
      FROM sales
      WHERE date(createdAt) = date('now')
    `,
  });

  return result.rows[0];
}

// Ventas por método de pago (Cash, Credit, Debit, Transfer, GCash)
export async function getSalesByPaymentMethod() {
  const result = await tursoClient.execute({
    sql: `
      SELECT paymentMethod AS payment_method, COALESCE(SUM(totalAmount), 0) AS total
      FROM sales
      -- WHERE date(createdAt) = date('now')
      GROUP BY paymentMethod
    `,
  });

  return result.rows; // [{ payment_method: "cash", total: 1234 }, ...]
}

// 📌 Ticket promedio (Total Sales ÷ Nº Tickets)
export async function getAvgTicket() {
  const result = await tursoClient.execute({
    sql: `
      SELECT 
        COALESCE(SUM(totalAmount), 0) / NULLIF(COUNT(*), 0) AS avg_ticket
      FROM sales
      WHERE date(createdAt) = date('now')
    `,
  });

  return result.rows[0];
}

// Top productos del día (los más vendidos)
export async function getTopProducts(limit = 5) {
  const result = await tursoClient.execute({
    sql: `
      SELECT 
        b.name AS product,
        -- Usamos COALESCE para asegurar que si no hay ítems (aunque es improbable), la suma sea 0
        COALESCE(SUM(si.quantity), 0) AS qty,
        COALESCE(SUM(si.quantity * si.price), 0.0) AS total
      FROM sale_items si
      JOIN bakery_items b ON si.productId = b.id
      JOIN sales s ON si.saleId = s.id
      -- *** CORRECCIÓN: SE ELIMINA LA CLÁUSULA WHERE ***
      -- Se ha quitado: WHERE date(s.createdAt) = date('now')
      GROUP BY b.name
      ORDER BY qty DESC
      LIMIT ?
    `,
    args: [limit],
  });

  return result.rows; // Esto debería devolver los 5 productos más vendidos de todo el historial.
}

// Ventas por turno (ej: morning, evening)
export async function getSalesByShift() {
  const result = await tursoClient.execute({
    sql: `
      SELECT
        cc.id,
        u.name AS user_name,
        cc.shift,
        cc.start_time,
        cc.end_time,
        COALESCE(SUM(s.totalAmount), 0) AS total_sales,
        COUNT(s.id) AS tickets, 
        COALESCE(SUM(s.totalAmount), 0) * 1.0 / NULLIF(COUNT(s.id), 0) AS avg_ticket
      FROM cash_closures cc
      JOIN User u 
        ON cc.user_id = u.id
      LEFT JOIN sales s
        -- CORRECCIÓN: Normaliza todos los campos de fecha/hora usando datetime() sin modificadores.
        -- Esto asegura que SQLite los compare como cadenas de tiempo idénticas, 
        -- ignorando sutiles diferencias de formato o el sufijo 'Z'.
        ON datetime(s.createdAt) 
        BETWEEN 
          datetime(cc.start_time) 
        AND 
          datetime(COALESCE(cc.end_time, CURRENT_TIMESTAMP))
      
      GROUP BY cc.id, u.name, cc.shift, cc.start_time, cc.end_time
      ORDER BY cc.start_time DESC;
    `,
  });

  return result.rows;
}
